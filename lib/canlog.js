"use strict";

const fs = require('node:fs');
const readline = require('node:readline');
const process = require('node:process');
const { CanFrame } = require("./canframe.js");

const byteToHex = [];
const hexToByte = {};

for (let i = 0; i <= 0xff; i++) {
    const asHex = i.toString(16).padStart(2, "0");
    byteToHex.push(asHex);
    hexToByte[asHex] =  i;
}

/**
 * A simple player.
 * Expects a log file containing packets captured with capture.js or converted with convert.js
 * (234234.342342) can0 123#1122334455667788 
 *                          ^^^^^^^^^^^^^^^^ can packet data in hex
 *                      ^^^ can id in hex  
 *                 ^^^^ can device
 *         ^^^^^^ microseconds 0 padded
 *  ^^^^^^ seconds.
 * emits "frame" events on recieving frames, same as gsusb
 */

class CanPlayer {
    constructor(options) {
        options = options || {};
        this.started = false;
        this._listeners = {};
        this.filters = options.filters || {};
    }
    // event emitter
    _emitEvent(name, value) {
        if ( this._listeners[name] !== undefined ) {
            this._listeners[name].forEach(async (f) => { 
                try {
                    await f(value);
                } catch (e) {
                    console.log("Error: failed to deliver event ",name,value,e);
                }
            });
        }
    }

    /**
     * register event handler function
     *
     * Events
     * frame - payload is an frame object
     * canpacket - payload is a DataView of the can packet
     * error - payload is the exception or error object
     * stopped_reading - when the driver stops reading
     *
     */
    on(name, fn) {
        this._listeners[name] = this._listeners[name] || [];
        this._listeners[name].push(fn);
    }

    /**
     * start playing the file at filePath.
     * listen to "frame" events before calling this.
     */ 
    async start(filePath) {
        this.started = true;
        let tlast = undefined;
        let tfirst = undefined;
        let lastEmit_ms = undefined;
        let firstEmit_ms = undefined;
        const frame = new CanFrame(24);

        const rl = readline.createInterface(fs.createReadStream(filePath, { encoding: 'utf8' }));
        for await (const input of rl) {
            if ( !this.started ) {
                break;
            }
            const canPacket = this._parseCanPacket(input);
            if ( canPacket.valid ) {
                if ( tfirst == undefined ) {
                   tfirst = canPacket.time * 1000; // in ms
                   lastEmit_ms = Date.now();
                   firstEmit_ms = lastEmit_ms;
                } else {
                   tlast = canPacket.time * 1000; // in ms
                   const emitAt = tlast -  tfirst + firstEmit_ms;
                   const delay_ms = emitAt - Date.now();
                   if ( delay_ms > 0 ) {
                       await new Promise((resolve) => {
                               setTimeout(resolve, delay_ms);
                       });
                   }
                   lastEmit_ms = Date.now();
                }


                // now process the frame.
                frame.fromBuffer(canPacket.data);
                if ( this._acceptMessage(frame) ) {
                    this._emitEvent("frame", frame);
                }
            }  else {
                console.log("Invalid packet ", canPacket);
            }             
        }
        const playBackDrift_ms = (lastEmit_ms - firstEmit_ms) - (tlast - tfirst);
        console.log(`playback drift ${playBackDrift_ms} ms`); 
        this._emitEvent("end");
        this.started = false;
    }

    stop() {
        this.started = false;
    }

    _acceptMessage(frame) {
        if (this.filters !== undefined 
            && frame.frameType === "extended"  
            && frame.messageHeader !== undefined ) {
            if ( this.filters[frame.messageHeader.pgn] !== undefined ) {
                if ( this.filters[frame.messageHeader.pgn](frame.messageHeader) ) {
                    return true;
                }
                if ( this.filters['*'] !== undefined ) {
                    if ( this.filters['*'](frame.messageHeader) ) {
                        return true;
                    }
                }
            } else {
                return true;
            }
        } else {
            return true;
        }
    }



    _parseCanPacket(line) {
        const parts = line.split(' ');
        if ( parts.length < 2) {
            return { valid: false, reason: "wrong format", line: line };
        }
        if ( !parts[0].startsWith('(') || !parts[0].endsWith(')') ) {
            return { valid: false, reason: "Timestamp missing", line: line };
        }
        const time = parseFloat(parts[0].substring(1));
        const data = new DataView(new ArrayBuffer(parts[1].length/2));  
        for (var i = 0; i < data.byteLength; i++) {
            data.setUint8(i, parseInt(parts[1].substring(i*2,i*2+2),16));
        }
        return {
            valid: true,
            time,
            data
        };
    }

}

class CanLogMessagePlayer  {
    constructor(options) {
        options = options || {};
        this.started = false;
        this._listeners = {};
        this.realtime = options.realtime;
    }
    // event emitter
    _emitEvent(name, value) {
        if ( this._listeners[name] !== undefined ) {
            this._listeners[name].forEach(async (f) => { 
                try {
                    await f(value);
                } catch (e) {
                    console.log("Error: failed to deliver event ",name,value,e);
                }
            });
        }
    }

    /**
     * register event handler function
     *
     * Events
     * frame - payload is an frame object
     * canpacket - payload is a DataView of the can packet
     * error - payload is the exception or error object
     * stopped_reading - when the driver stops reading
     *
     */
    on(name, fn) {
        this._listeners[name] = this._listeners[name] || [];
        this._listeners[name].push(fn);
    }

    /**
     * start playing the file at filePath.
     * listen to "frame" events before calling this.
     */ 
    async start(filePath) {
        this.hwClockWrap = 0;
        this.lastTimestamp_us = undefined;
        this.started = true;
        let tlast = undefined;
        let tfirst = undefined;
        let lastEmit_ms = undefined;
        let firstEmit_ms = undefined;
        const frame = new CanFrame(24);

        const rl = readline.createInterface(fs.createReadStream(filePath, { encoding: 'utf8' }));
        for await (const input of rl) {
            if ( !this.started ) {
                break;
            }
            const canMessage = this._parseCanMessage(input);
            if ( canMessage.valid ) {
                if ( tfirst == undefined ) {
                   tfirst = canMessage.time * 1000; // in ms
                   lastEmit_ms = Date.now();
                   firstEmit_ms = lastEmit_ms;
                } else {

                   tlast = canMessage.time * 1000; // in ms
                   const emitAt = tlast -  tfirst + firstEmit_ms;
                   const delay_ms = emitAt - Date.now();
                   if ( this.realtime ) {
                       if ( delay_ms > 0 ) {
                           await new Promise((resolve) => {
                                   setTimeout(resolve, delay_ms);
                           });
                       }
                   }
                   lastEmit_ms = Date.now();
                }
                this._emitEvent("message", canMessage);
            }  else {
                //console.log("Invalid packet ", canMessage);
            }             
        }
        const playBackDrift_ms = (lastEmit_ms - firstEmit_ms) - (tlast - tfirst);
        const realtimeFactor = (tlast - tfirst)/(lastEmit_ms - firstEmit_ms);
        if ( this.realtime ) {
            console.log(`playback drift ${playBackDrift_ms} ms, factor ${realtimeFactor}x`); 
        } else {
            console.log(`playback factor ${realtimeFactor}x`); 
        }
        this.started = false;
    }

    stop() {
        this.started = false;
    }




    _parseCanMessage(line) {
        if ( line.startsWith("MESSAGE ")) {
            const parts = line.split("} {");
            if (parts.length > 1) {
                const frame = JSON.parse(parts[0].substring("MESSAGE ".length)+"}");
                const message = JSON.parse("{"+parts[1]);
                message.timestamp_us = frame.timestamp_us;
                if ( this.lastTimestamp_us !== undefined  && this.lastTimestamp_us > message.timestamp_us ) {
                    this.hwClockWrap++;
                } 

                this.lastTimestamp_us = message.timestamp_us;
                message.time = (message.timestamp_us+(this.hwClockWrap*4294967296))/1000000;
                message.frame = frame;
                message.valid = true;



                return message;
            }            
        }
        return {
            valid: false,
            line
        };
    }
}

/**
 * A simple recorder, writes a file in the form that can be played by CanPlayer.
 * Format is
 * (decimal) hexdata.
 */ 
class CanRecorder {



    constructor() {
        this.file = undefined;
    }

    open(filePath) {
        this.file = fs.createWriteStream(filePath, { encoding: "utf8", flags: "w"});
    }

    /**
     * the can packet is a DataView
     */ 
    write(frame) {
        const hrTime = process.hrtime()
        const time = hrTime[0] + hrTime[1]/1E9;
        const data = new Uint8Array(frame.toBuffer());
        this.file.write(CanRecorder.toString(time, data));
        this.file.write('\n');
    }

    static toString(time, data) {
        const packet = [];
        for (var i = 0; i < data.byteLength; i++) {
            packet.push(byteToHex[data[i]]);    
        }
        return `(${time.toFixed(6)}) ${packet.join("")}`;
    }

    close() {
        this.file.close();
        this.file = undefined;
    }

}


module.exports = {
    CanRecorder,
    CanPlayer,
    CanLogMessagePlayer
};