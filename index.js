const { GSUsb } = require("./lib/gsusb.js");
const { NMEA2000MessageDecoder, NMEA2000Reference } = require('./lib/messages_decoder.js');
const { CanRecorder, CanPlayer } = require('./lib/canlog.js');


require('./lib/messages_iso.js').register(NMEA2000MessageDecoder.messages)
require('./lib/messages_engine.js').register(NMEA2000MessageDecoder.messages)
require('./lib/messages_nav.js').register(NMEA2000MessageDecoder.messages)

module.exports =  { 
    GSUsb,
    NMEA2000MessageDecoder,
    NMEA2000Reference,
    CanRecorder,
    CanPlayer
};
