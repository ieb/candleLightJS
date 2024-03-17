"use strict";

const { NMEA2000MessageDecoder } = require('./lib/messages_decoder.js');
const { CanLogMessagePlayer, CanRecorder } = require("./lib/canlog.js");



require('./lib/messages_iso.js').register(NMEA2000MessageDecoder.messages)
require('./lib/messages_engine.js').register(NMEA2000MessageDecoder.messages)
require('./lib/messages_nav.js').register(NMEA2000MessageDecoder.messages)

try {
    if ( process.argv.length !== 3) {
        console.log("Usage: node convert.js <logfile>");
        console.log("Will read a log file containing messages, reconstruct the frames and emit them.");
    } else {
        const canPlayer = new CanLogMessagePlayer();
        const messageDecoder = new NMEA2000MessageDecoder();
        canPlayer.on('message', (message) => {
            const converted = messageDecoder.encode(message);
            if ( converted !== undefined ) {
                for (var i = 0; i < converted.frames.length; i++) {
                    const data = new Uint8Array(converted.frames[i].buffer);
                    console.log(CanRecorder.toString(message.time, data));
                }
            }
        });
        canPlayer.start(process.argv[2]).then(() => {
            console.log("Done");
            process.exit(0);
        });        
    }
} catch (err) {
    console.log("oops",err);
    // No device was selected.
}
