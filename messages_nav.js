"use strict";
const { CANMessage, NMEA2000Reference } = require('./messages_decoder.js');



class PGN126992 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return {
            pgn: 126992,
            message: "N2K System Time",
            sid: this.getByte(message, 0),
            timeSource: NMEA2000Reference.lookup("timeSource",this.getByte(message, 1)&0x0f), 
            systemDate: this.get2ByteUInt(message, 3),
            systemTime: this.get4ByteUDouble(message, 5, 0.0001)
        };
    }
}

class PGN127245 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return {
            pgn: 127245, 
            message: "N2K Rudder",
            instance: this.getByte(message, 0),
            rudderDirectionOrder: NMEA2000Reference.lookup("rudderDirectionOrder",this.getByte(message, 1)&0x07), 
            angleOrder: this.get2ByteDouble(message, 2, 0.0001),
            rudderPosition: this.get2ByteDouble(message, 4, 0.0001)
        };
    }
}

class PGN127250 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return {
            pgn: 127250,
            message: "N2K Heading",
            sid: this.getByte(message, 0),
            heading: this.get2ByteUDouble(message, 1, 0.0001),
            deviation: this.get2ByteDouble(message, 3, 0.0001),
            variation: this.get2ByteDouble(message, 5, 0.0001),
            ref: NMEA2000Reference.lookup("headingReference",this.getByte(message, 7)&0x03)
        };
    }
}

class PGN127251 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return {
            pgn: 127251,
            message: "N2K Rate of Turn",
            sid: this.getByte(message, 0),
            rateOfTurn: this.get4ByteDouble(message, 1, 3.125E-08),
        };
    }
}

class PGN127257 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return {
            pgn: 127257,
            message: "N2K Attitude",
            sid: this.getByte(message, 0),
            yaw: this.get2ByteDouble(message, 1, 0.0001),
            pitch: this.get2ByteDouble(message, 3, 0.0001),
            roll: this.get2ByteDouble(message, 5, 0.0001)
        };
    }
}

class PGN127258 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return {
            pgn: 127258,
            message: "N2K Magnetic Variation",
            sid: this.getByte(message, 0),
            source: NMEA2000Reference.lookup("variationSource",this.getByte(message, 1) & 0x0f),
            daysSince1970: this.get2ByteUInt(message, 2),
            variation: this.get2ByteDouble(message, 4, 0.001)
        }
    }
}

class PGN128259 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return {
            pgn: 128259,
            message: "N2K Speed",
            sid: this.getByte(message, 0),
            waterReferenced: this.get2ByteDouble(message, 1, 0.01),
            groundReferenced: this.get2ByteDouble(message, 3, 0.01),
            swrt: NMEA2000Reference.lookup("swrtType",this.getByte(message, 5)&0x0f),
        };
    }
}

class PGN128267 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return {
            pgn: 128267,
            message: "N2K Water Depth",
            sid: this.getByte(message, 0),
            depthBelowTransducer: this.get4ByteUDouble(message, 1, 0.01),
            offset: this.get2ByteDouble(message, 5, 0.01),
            range: this.get1ByteUDouble(message, 7, 10),
        };
    }
}

class PGN128275 extends CANMessage {
    constructor() {
        super();
        this.fastPacket = true
    }
    fromMessage(message) {
        return {
            pgn: 128275,
            message: "N2K Distance Log",
            daysSince1970: this.get2ByteUInt(message, 0),
            secondsSinceMidnight: this.get4ByteUDouble(message, 2, 0.0001),
            log: this.get4ByteUDouble(message, 6, 1),
            tripLog: this.get4ByteUDouble(message, 10, 1),
        };
    }
}

class PGN129026 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return {
            pgn: 129026,
            message: "N2K COG SOG Rapid",
            sid: this.getByte(message, 0),
            ref: NMEA2000Reference.lookup("headingReference",this.getByte(message, 1)&0x03), //lookup
            cog: this.get2ByteUDouble(message, 2, 0.0001),
            sog: this.get2ByteUDouble(message, 4, 0.01),
        };
    }
}

class PGN129029 extends CANMessage {
    constructor() {
        super();
        this.fastPacket = true
    }
    fromMessage(message) {
        const typeMethod = this.getByte(message, 31);
        const nReferenceStations = this.getByte(message, 42);
        const stations = [];
        if ( nReferenceStations!= CANMessage.N2kUInt8NA ) {
            for(var i=0; i< nReferenceStations; i++) {
                const ind = this.get2ByteUInt(message, 42+i*4);
                stations.push({
                    referenceStationType: NMEA2000Reference.lookup("gnssType",ind&0x0f),
                    referenceSationID: (ind>>4),
                    ageOfCorrection: this.get2ByteUInt(message, 44+i*4,0.01)
                });
            }
        }
        return {
            pgn: 129029,
            message: "N2K GNSS",
            sid: this.getByte(message, 0),
            daysSince1970: this.get2ByteUInt(message, 1),
            secondsSinceMidnight: this.get4ByteUDouble(message, 3, 0.0001),
            latitude: this.get8ByteDouble(message, 7, 1e-16), // 7+8=15
            longitude: this.get8ByteDouble(message, 15, 1e-16), // 15+8=23
            altitude: this.get8ByteDouble(message, 23, 1e-16), // 23+8=31
            GNSStype: NMEA2000Reference.lookup("gnssType",typeMethod&0x0f), 
            GNSSmethod: NMEA2000Reference.lookup("gnssMethod",(typeMethod>>4)&0x0f),  
            integrety: NMEA2000Reference.lookup("gnssIntegrety",this.getByte(message, 32)&0x03), 
            nSatellites: this.getByte(message, 33),
            hdop: this.get2ByteDouble(message, 34),
            pdop: this.get2ByteDouble(message, 36),
            geoidalSeparation: this.get4ByteDouble(message, 38, 0.01), //38+4=42
            nReferenceStations: nReferenceStations,
            stations: stations
        };
    }
}

class PGN129283 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        const xteModeNav = this.getByte(message, 1);
        return {
            pgn: 129283,
            message: "N2K Cross Track Error",
            sid: this.getByte(message, 0),
            xteMode: NMEA2000Reference.lookup("xteMode",xteModeNav&0x0f),
            navigationTerminated: NMEA2000Reference.lookup("yesNo",((xteModeNav>>6)&0x01)),
            xte: this.get4ByteDouble(message, 2, 0.01),
        };
    }
}

class PGN130306 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return {
            pgn: 130306,
            message: "N2K Wind",
            sid: this.getByte(message, 0),
            windSpeed: this.get2ByteUDouble(message, 1, 0.01),
            windAngle: this.get2ByteUDouble(message, 3, 0.0001),
            windReference: NMEA2000Reference.lookup("windReference",this.getByte(message, 5)&0x07) 
        };
    }
}

class PGN130310 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return {
            pgn: 130310,
            message: "N2K Outside Environment Parameters",
            sid: this.getByte(message, 0),
            waterTemperature: this.get2ByteUDouble(message, 1, 0.01),
            outsideAmbientAirTemperature: this.get2ByteUDouble(message, 3, 0.01),
            atmosphericPressure: this.get2ByteUDouble(message, 5, 100)
        };
    }
}

class PGN130311 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        const vb = this.getByte(message, 1);
        return {
            pgn: 130311,
            message: "N2K Environment Parameters",
            sid: this.getByte(message, 0),
            tempSource: NMEA2000Reference.lookup("temperatureSource",(vb & 0x3f)), 
            humiditySource: NMEA2000Reference.lookup("humiditySource",(vb>>6 & 0x03)),
            temperature: this.get2ByteUDouble(message, 2, 0.01),
            humidity: this.get2ByteDouble(message, 4, 0.004),
            atmosphericPressure: this.get2ByteUDouble(message, 6, 100)
        };
    }
}

class PGN130313 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return {
            pgn: 130313,
            message: "N2K Humidity",
            sid: this.getByte(message, 0),
            humidityInstance: this.getByte(message, 1),
            humiditySource:  NMEA2000Reference.lookup("humiditySource",this.getByte(message, 2)),
            actualHumidity: this.get2ByteDouble(message, 3, 0.004),
            setHumidity: this.get2ByteDouble(message, 5, 0.004)
        };
    }
}

class PGN130314 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return {
            pgn: 130314,
            message: "N2K Pressure",
            sid: this.getByte(message, 0),
            pressureInstance: this.getByte(message, 1),
            pressureSource: NMEA2000Reference.lookup("pressureSource",this.getByte(message, 2)),
            actualPressure: this.get4ByteDouble(message, 3, 0.1)
        };
    }
}

class PGN130315 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return{
            pgn: 130315,
            message: "N2K Set Pressure",
            sid: this.getByte(message, 0),
            pressureInstance: this.getByte(message, 1),
            pressureSource: NMEA2000Reference.lookup("pressureSource",this.getByte(message, 2)),
            setPressure: this.get4ByteDouble(message, 3, 0.1)        
        };
    }
}

class PGN130316 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return {
            pgn: 130316,
            message: "N2K Temperature Extended",
            sid: this.getByte(message, 0),
            tempInstance: this.getByte(message, 1),
            tempSource: NMEA2000Reference.lookup("temperatureSource",this.getByte(message, 2)),
            actualTemperature: this.get3ByteDouble(message, 3, 0.001),
            setTemperature: this.get2ByteDouble(message, 6, 0.1)
        };
    }
}

class PGN127506 extends CANMessage {
    constructor() {
        super();
        this.fastPacket = true;
    }
    fromMessage(message) {
        return {
            pgn: 127506,
            message: "N2K DC Status",
            sid: this.getByte(message, 0),
            dcInstance: this.getByte(message, 1),
            dcType: NMEA2000Reference.lookup("dcSourceType",this.getByte(message, 2)), // lookup
            stateOfCharge: this.getByte(message, 3),
            stateOfHealth: this.getByte(message, 4),
            timeRemaining: this.get2ByteUDouble(message, 5, 60),
            rippleVoltage: this.get2ByteUDouble(message, 7, 0.001),
            capacity: this.get2ByteUDouble(message, 9, 3600),
        };
    }
}

class PGN130916 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return {
            pgn: 130916,
            message: "Raymarine Proprietary unknown",
            canmessage: message
        };
    }
}

class PGN126720 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return {
            pgn: 126720,
            message: "Raymarine Proprietary Backlight",
            canmessage: message
        };
    }
}

class PGN127237 extends CANMessage {

    constructor() {
        super();
    }
    fromMessage(message) {
        const v1 = this.getByte(message, 0);
        const v2 = this.getByte(message, 1);
        
        return {
            pgn: 127237,
            message: "Raymarine Proprietary Heading Track Control",
            rudderLimitExceeded: NMEA2000Reference.lookup("yesNo",(v1 & 0x03)), // lookup
            offHeadingLimitExceeded: NMEA2000Reference.lookup("yesNo",((v1 >> 2) & 0x03)), // lookup
            offTrackLimitExceeded: NMEA2000Reference.lookup("yesNo",((v1 >> 4) & 0x03)), // lookup
            override: NMEA2000Reference.lookup("yesNo",((v1 >> 6) & 0x03)), // lookup
            steeringMode: NMEA2000Reference.lookup("steeringMode",(v2 & 0x07)),
            turnMode: NMEA2000Reference.lookup("turnMode",((v2 >> 3) & 0x07)), // lookup
            headingReference: NMEA2000Reference.lookup("directionReference",((v2 >> 6) & 0x03)), // lookup
            commandedRudderDirection: NMEA2000Reference.lookup("directionRudder",((this.getByte(message, 2)>>5)&0x07)), // lookup
            commandedRudderAngle: this.get2ByteDouble(message, 3, 0.0001),
            headingToSteerCourse: this.get2ByteUDouble(message, 5, 0.0001),
            track: this.get2ByteUDouble(message, 7, 0.0001),
            rudderLimit: this.get2ByteUDouble(message, 9, 0.0001),
            offHeadingLimit: this.get2ByteUDouble(message, 11, 0.0001),
            radiusOfTurnOrder: this.get2ByteDouble(message, 13, 1),
            rateOfTurnOrder: this.get2ByteDouble(message, 15, 3.125e-5),
            offTrackLimit: this.get2ByteDouble(message, 17, 1),
            vesselHeading: this.get2ByteUDouble(message, 19, 0.0001),
        };
    }
}


class PGN65359 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return {
            pgn: 65359,
            message: "Raymarine Seatalk Pilot Heading",
            canmessage: message
        };
    }
}

class PGN65379 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return {
            pgn: 65379,
            message: "Raymarine Seatalk Pilot Heading 2",
            canmessage: message
        };
    }
}

class PGN65384 extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return {
            pgn: 65384,
            message: "Raymarine Seatalk Pilot Heading 3",
            canmessage: message
        };
    }
}

const register = (pgnRegistry) => {
    pgnRegistry[126720] = new PGN126720();
    pgnRegistry[126992] = new PGN126992();
    pgnRegistry[127237] = new PGN127237();
    pgnRegistry[127245] = new PGN127245();
    pgnRegistry[127250] = new PGN127250();
    pgnRegistry[127251] = new PGN127251();
    pgnRegistry[127257] = new PGN127257();
    pgnRegistry[127258] = new PGN127258();
    pgnRegistry[127506] = new PGN127506();
    pgnRegistry[128259] = new PGN128259();
    pgnRegistry[128267] = new PGN128267();
    pgnRegistry[128275] = new PGN128275();
    pgnRegistry[129026] = new PGN129026();
    pgnRegistry[129029] = new PGN129029();
    pgnRegistry[129283] = new PGN129283();
    pgnRegistry[130306] = new PGN130306();
    pgnRegistry[130310] = new PGN130310();
    pgnRegistry[130311] = new PGN130311();
    pgnRegistry[130313] = new PGN130313();
    pgnRegistry[130314] = new PGN130314();
    pgnRegistry[130315] = new PGN130315();
    pgnRegistry[130316] = new PGN130316();
    pgnRegistry[130916] = new PGN130916();
    pgnRegistry[65359] = new PGN65359();
    pgnRegistry[65379] = new PGN65379();
    pgnRegistry[65384] = new PGN65384();




}


module.exports =  { 
    register
};
