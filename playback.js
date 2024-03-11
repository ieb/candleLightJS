"use strict";

const { NMEA2000MessageDecoder } = require('./messages_decoder.js');
const { CanPlayer } = require("./canlog.js");



require('./messages_iso.js').register(NMEA2000MessageDecoder.messages)
require('./messages_engine.js').register(NMEA2000MessageDecoder.messages)
require('./messages_nav.js').register(NMEA2000MessageDecoder.messages)

try {
    if ( process.argv.length !== 3) {
        console.log("Usage: node testplayback.js <logfile>");
        console.log("Will read a log file recorded by testlog.js and process the can frames into messages");
    } else {
        const canPlayer = new CanPlayer();
        const messageDecoder = new NMEA2000MessageDecoder();
        canPlayer.on('frame', (frame) => {
            const message = messageDecoder.decode(frame);
            if ( message !== undefined ) {
                console.log(JSON.stringify(message));
            }
        });
        canPlayer.start(process.argv[2]);        
    }
} catch (err) {
    console.log("oops",err);
    // No device was selected.
}
