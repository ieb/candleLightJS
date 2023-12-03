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
            console.log("NMEA2000MessageDecoder: Decoder Not found for PGN ", frame.messageHeader.pgn, " to fix, register one ");
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

    lookup(m, v) {
        return m[v] || "lookup_"+v;
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
    get8ByteUDouble(message, byteOffset, factor) {
        if ( message.data.byteLength < byteOffset+8) {
            return CANMessage.n2kDoubleNA;
        }
        if ( (message.data.getUint8(byteOffset) == 0xff) 
          && (message.data.getUint8(byteOffset+1) == 0xff) 
          && (message.data.getUint8(byteOffset+2) == 0xff) 
          && (message.data.getUint8(byteOffset+3) == 0xff) 
          && (message.data.getUint8(byteOffset+4) == 0xff) 
          && (message.data.getUint8(byteOffset+5) == 0xff) 
          && (message.data.getUint8(byteOffset+6) == 0xff) 
          && (message.data.getUint8(byteOffset+7) == 0xff) 

          ) {
            return CANMessage.n2kDoubleNA;
        }

        let v = message.data.getBigUint64(byteOffset, true);
        let n = 0; // so we dont have a infinite loop
        while ( !Number.isSafeInteger(v) && n < 12 ) {
            v = v / BigInt(2);
            factor = factor * 2.0;
            n++;
        }
        // v should now be safe as  number
        // -(2^^53 - 1) to 2^^53 - 1,
        return factor * Number(v);

    }
    get8ByteDouble(message, byteOffset, factor) {
        if ( message.data.byteLength < byteOffset+8) {
            return CANMessage.n2kDoubleNA;
        }
        if ( (message.data.getUint8(byteOffset) == 0xff)
          && (message.data.getUint8(byteOffset+1) == 0xff) 
          && (message.data.getUint8(byteOffset+2) == 0xff) 
          && (message.data.getUint8(byteOffset+3) == 0xff) 
          && (message.data.getUint8(byteOffset+4) == 0xff) 
          && (message.data.getUint8(byteOffset+5) == 0xff) 
          && (message.data.getUint8(byteOffset+6) == 0xff) 
          && (message.data.getUint8(byteOffset+7) == 0x7f) 
          ) {
            return CANMessage.n2kDoubleNA;
        }
        let v = message.data.getBigInt64(byteOffset, true);
        let n = 0; // so we dont have a infinite loop
        while ( !Number.isSafeInteger(v) && n < 12 ) {
            v = v / BigInt(2);
            factor = factor * 2.0;
            n++;
        }
        // v should now be safe as  number
        // -(2^^53 - 1) to 2^^53 - 1,
        return factor * Number(v);
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

    get3ByteDouble(message, byteOffset, factor) {
        if ( message.data.byteLength < byteOffset+3) {
            return CANMessage.n2kDoubleNA;
        }
        const b0 = message.data.getUint8(byteOffset);
        const b1 = message.data.getUint8(byteOffset+1);
        const b2 = message.data.getUint8(byteOffset+2);

        if ( (b0 == 0xff)
          && (b1 == 0xff) 
          && (b2 == 0x7f)) {
            return CANMessage.n2kDoubleNA;
        }
        // take account of the sign.
        const v = b0
            | b1<<8 
            | b2<<16
            | ((b2&0x80) == 0x80)?0xff:0x00;
        return factor*v;
    }
    get3ByteUDouble(message, byteOffset, factor) {
        if ( message.data.byteLength < byteOffset+3) {
            return CANMessage.n2kDoubleNA;
        }
        const b0 = message.data.getUint8(byteOffset);
        const b1 = message.data.getUint8(byteOffset+1);
        const b2 = message.data.getUint8(byteOffset+2);

        if ( (b0 == 0xff)
          && (b1 == 0xff) 
          && (b2 == 0x7f)) {
            return CANMessage.n2kDoubleNA;
        }
        // unsigned works just fine.        
        const v = b0
            | b1<<8 
            | b2<<16;
        return factor*v;
    }


    get1ByteUDouble(message, byteOffset, factor) {
        if ( message.data.byteLength < byteOffset+1) {
            return CANMessage.n2kDoubleNA;
        }
        if ( (message.data.getUint8(byteOffset) == 0xff) ) {
            return CANMessage.n2kDoubleNA;
        }
        return factor*message.data.getUint8(byteOffset);
    }
    get1ByteDouble(message, byteOffset, factor) {
        if ( message.data.byteLength < byteOffset+1) {
            return CANMessage.n2kDoubleNA;
        }
        if ( (message.data.getUInt8(byteOffset) == 0x7f) ) {
            return CANMessage.n2kDoubleNA;
        }
        return factor*message.data.getInt8(byteOffset);
    }



    get2ByteUInt(message, byteOffset) {
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


class NMEA2000Reference {
    static reference = {
        "timeSource": {
            0: { id: 0, name:"GPS"},
            1: { id: 1, name:"GLONASS"},
            2: { id: 2, name:"RadioStation"},
            3: { id: 3, name:"LocalCesiumClock"},
            4: { id: 4, name:"LocalRubidiumClock"},
            5: { id: 5, name:"LocalCrystalClock"},
        },
        "rudderDirectionOrder": {
            0: { id: 0, name:"NoDirectionOrder"},
            1: { id: 1, name:"MoveToStarboard"},
            2: { id: 2, name:"MoveToPort"},
            7: { id: 7, name:"Unavailable"},
        },
        "headingReference": {
             0: { id: 0, name:"True"},
             1: { id: 1, name:"Magnetic"},
             2: { id: 2, name:"Error"},
             3: { id: 3, name:"Unavailable"},
        },
        "variationSource": {
            0: { id: 0, name:"manual"},
            1: { id: 1, name:"chart"},
            2: { id: 2, name:"table"},
            3: { id: 3, name:"calc"},
            4: { id: 4, name:"wmm2000"},
            5: { id: 5, name:"wmm2005"},
            6: { id: 6, name:"wmm2010"},
            7: { id: 7, name:"wmm2015"},
            8: { id: 8, name:"wmm2020"},
        },
        "swrtType": {
            0: { id: 0, name:"Paddle wheel"},
            1: { id: 1, name:"Pitot tube"},
            2: { id: 2, name:"Doppler log"},
            3: { id: 3, name:"Ultrasound"},
            4: { id: 4, name:"Electro magnetic"},
            254: { id: 254, name:"Error"},
            255: { id: 255, name:"Unavailable"},
        },
        "gnssType": {
            0: { id: 0, name:"GPS"},
            1: { id: 1, name:"GLONASS"},
            2: { id: 2, name:"GPSGLONASS"},
            3: { id: 3, name:"GPSSBASWAAS"},
            4: { id: 4, name:"GPSSBASWAASGLONASS"},
            5: { id: 5, name:"Chayka"},
            6: { id: 6, name:"integrated"},
            7: { id: 7, name:"surveyed"},
            8: { id: 8, name:"Galileo"},
        },
        "gnssMethod": {
            0: { id: 0, name:"noGNSS"},
            1: { id: 1, name:"GNSSfix"},
            2: { id: 2, name:"DGNSS"},
            3: { id: 3, name:"PreciseGNSS"},
            4: { id: 4, name:"RTKFixed"},
            5: { id: 5, name:"RTKFloat"},
            14: { id: 14, name:"Error"},
            15: { id: 15, name:"Unavailable"},
        },
        "gnssIntegrity": {
            0: { id: 0, name:"No integrity checking"},
            1: { id: 1, name:"Safe"},
            2: { id: 2, name:"Caution"},
            3: { id: 3, name:"Unsafe"},
        },
        "xteMode": {
            0: { id: 0, name:"Autonomous"},
            1: { id: 1, name:"Differential"},
            2: { id: 2, name:"Estimated"},
            3: { id: 3, name:"Simulator"},
            4: { id: 4, name:"Manual"},
        },
        "yesNo": {
            0: { id: 0, name:"No"},
            1: { id: 1, name:"Yes"},
        },
        "windReference": {
            0:  { id: 0, name:"True"},
            1:  { id: 1, name:"Magnetic"},
            2:  { id: 2, name:"Apparent"},
            3:  { id: 3, name:"True (boat referenced)"},
            4:  { id: 4, name:"True (water referenced)"},
        },
        "temperatureSource": {
            0: { id: 0, name:"Sea Temperature"},
            1: { id: 1, name:"Outside Temperature"},
            2: { id: 2, name:"Inside Temperature"},
            3: { id: 3, name:"Engine Room Temperature"},
            4: { id: 4, name:"Main Cabin Temperature"},
            5: { id: 5, name:"Live Well Temperature"},
            6: { id: 6, name:"Bait Well Temperature"},
            7: { id: 7, name:"Refrigeration Temperature"},
            8: { id: 8, name:"Heating System Temperature"},
            9: { id: 9, name:"Dew Point Temperature"},
            10: { id: 10, name:"Apparent Wind Chill Temperature"},
            11: { id: 11, name:"Theoretical Wind Chill Temperature"},
            12: { id: 12, name:"Heat Index Temperature"},
            13: { id: 13, name:"Freezer Temperature"},
            14: { id: 14, name:"Exhaust Gas Temperature"},
            15: { id: 15, name:"Shaft Seal Temperature"},
        },
        "humiditySource": {
            0: { id: 0, name:"Inside"},
            1: { id: 1, name:"Outside"},
        },
        "pressureSource": {
            0: { id: 0, name:"Atmospheric"},
            1: { id: 1, name:"Water"},
            2: { id: 2, name:"Steam"},
            3: { id: 3, name:"Compressed Air"},
            4: { id: 4, name:"Hydraulic"},
            5: { id: 5, name:"Filter"},
            6: { id: 6, name:"AltimeterSetting"},
            7: { id: 7, name:"Oil"},
            8: { id: 8, name:"Fuel"},
        },
        "dcSourceType": {
            0: { id: 0, name:"Battery"},
            1: { id: 1, name:"Alternator"},
            2: { id: 2, name:"Convertor"},
            3: { id: 3, name:"Solar cell"},
            4: { id: 4, name:"Wind generator"},
        },
        "steeringMode": {
            0: { id: 0, name:"Main Steering"},
            1: { id: 1, name:"Non-Follow-Up Device"},
            2: { id: 2, name:"Follow-Up Device"},
            3: { id: 3, name:"Heading Control Standalone"},
            4: { id: 4, name:"Heading Control"},
            5: { id: 5, name:"Track Control"},
        },
        "turnMode": {
            0: { id: 0, name:"Rudder limit controlled"},
            1: { id: 1, name:"Turn rate controlled"},
            2: { id: 2, name:"Radius controlled"},
        },
        "directionReference": {
            0: { id: 0, name:"True"},
            1: { id: 1, name:"Magnetic"},
            2: { id: 2, name:"Error"},
        },
        "directionRudder": {
            0: { id: 0, name:"No Order"},
            1: { id: 1, name:"Move to starboard"},
            2: { id: 2, name:"Move to port"},
        },
        "tankType": {
            0: { id: 0, name:"Fuel"},
            1: { id: 1, name:"Water"},
            2: { id: 2, name:"Gray water"},
            3: { id: 3, name:"Live well"},
            4: { id: 4, name:"Oil"},
            5: { id: 5, name:"Black water"},
        }

    };


    static lookup(name, value) {
        if ( NMEA2000Reference.reference[name] && NMEA2000Reference.reference[name][value] ) {
            return NMEA2000Reference.reference[name][value];
        } else {
            return { type: name, id: value, name:"undefined" };
        }
    }
}

module.exports =  { 
    NMEA2000MessageDecoder,
    NMEA2000Reference,
    CANMessage
};