"use strict";
const { FastPacketHandler } = require('./fastpacket.js');


class NMEA2000MessageDecoder {

    static messages = {};
    constructor() {
        console.log(FastPacketHandler);
        this.fastPacketHandler = new FastPacketHandler();
    }

    decode(frame) {
        if ( NMEA2000MessageDecoder.messages[frame.messageHeader.pgn] ) {
            if (NMEA2000MessageDecoder.messages[frame.messageHeader.pgn].fastPacket) {
                const message = this.fastPacketHandler.handleFastPacket(frame);
                if ( message !== undefined ) {
                    // fast packet has been reconstructed, decode.
                    return NMEA2000MessageDecoder.messages[frame.messageHeader.pgn].fromMessage(message);
                }
            } else {
                // single packet message, frame is the message
                return NMEA2000MessageDecoder.messages[frame.messageHeader.pgn].fromMessage(frame);
            }

        } else {
            console.log("PGN Not found ", frame.messageHeader.pgn);
        }
        return undefined;
    }
}

class CANMessage {

    static n2kDoubleNA=-1000000000.0;
    static n2kInt16NA=-32767;
    static n2kInt8NA=-127;

    constructor() {
    }
    get2ByteUDouble(message, byteOffset, factor) {
        if ( message.data.byteLength < byteOffset+2) {
            return CANMessage.n2kDoubleNA;
        }
        if ( message.data.getUint8(byteOffset) === 0xff
          && message.data.getUint8(byteOffset+1) === 0xff ) {
            return CANMessage.n2kDoubleNA;
        }
        return factor*message.data.getUint16(byteOffset, true);

    }
    get2ByteDouble(message, byteOffset, factor) {
        if ( message.data.byteLength < byteOffset+2) {
            return CANMessage.n2kDoubleNA;
        }
        if ( message.data.getUint8(byteOffset) == 0xff
          && message.data.getUint8(byteOffset+1) == 0x7f ) {
            return CANMessage.n2kDoubleNA;
        }
        return factor*message.data.getInt16(byteOffset, true);
    }
    get4ByteUDouble(message, byteOffset, factor) {
        if ( message.data.byteLength < byteOffset+4) {
            return CANMessage.n2kDoubleNA;
        }
        if ( (message.data.getUint8(byteOffset) == 0xff) 
          && (message.data.getUint8(byteOffset+1) == 0xff) 
          && (message.data.getUint8(byteOffset+2) == 0xff) 
          && (message.data.getUint8(byteOffset+3) == 0xff) ) {
            return CANMessage.n2kDoubleNA;
        }
        return factor*message.data.getUint32(byteOffset, true);

    }
    get4ByteDouble(message, byteOffset, factor) {
        if ( message.data.byteLength < byteOffset+4) {
            return CANMessage.n2kDoubleNA;
        }
        if ( (message.data.getUint8(byteOffset) == 0xff)
          && (message.data.getUint8(byteOffset+1) == 0xff) 
          && (message.data.getUint8(byteOffset+2) == 0xff) 
          && (message.data.getUint8(byteOffset+3) == 0x7f) ) {
            return CANMessage.n2kDoubleNA;
        }
        return factor*message.data.getInt32(byteOffset, true);

    }


    get2ByteUint(message, byteOffset) {
        if ( message.data.byteLength < byteOffset+2) {
            return CANMessage.n2kInt16NA;
        }
        return message.data.getUint16(byteOffset, true);

    }
    get2ByteInt(message, byteOffset) {
        if ( message.data.byteLength < byteOffset+2) {
            return CANMessage.n2kInt16NA;
        }
        return message.data.getInt16(byteOffset, true);

    }

    getByte(message,byteOffset) {
        if ( message.data.byteLength < byteOffset+1) {
            return 0x00;
        }
        return message.data.getUint8(byteOffset);
    }
}



module.exports =  { 
    NMEA2000MessageDecoder,
    CANMessage
};