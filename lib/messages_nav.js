"use strict";
const { CANMessage, NMEA2000Reference } = require('./messages_decoder.js');



class PGN126992 extends CANMessage {
    constructor() {
        super();
    }
    // checked
    fromMessage(message) {
        return {
            pgn: 126992,
            message: "N2K System Time",
            sid: this.getByte(message, 0),
            timeSource: NMEA2000Reference.lookup("timeSource",this.getByte(message, 1)&0x0f), 
            systemDate: this.get2ByteUInt(message, 2),
            systemTime: this.get4ByteUDouble(message, 4, 0.0001)
        };
    }
    toMessage(pgnObj) {
        if (pgnObj.pgn === 126992) {
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.sid);
            this.setByte(data, 1, (pgnObj.timeSource.id&0x0f) | 0xf0);
            this.set2ByteUInt(data, 2, pgnObj.timeSource);
            this.set4ByteUDouble(data, 4, pgnObj.systemTime, 0.0001);
            return {
                priority: 3,
                type: "extended",
                pgn: 126992,
                data
            }
        }
    }

}

class PGN127245 extends CANMessage {
    constructor() {
        super();
    }
    // checked
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
    toMessage(pgnObj) {
        if (pgnObj.pgn === 127245) {
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.instance);
            this.setByte(data, 1, pgnObj.rudderDirectionOrder.id&0x07 | 0xf8 );
            this.set2ByteDouble(data, 2, pgnObj.angleOrder, 0.0001);
            this.set2ByteDouble(data, 4, pgnObj.rudderPosition, 0.0001);
            this.setByte(data, 6, 0xff);
            this.setByte(data, 7, 0xff);
            return {
                priority: 2,
                type: "extended",
                pgn: 127245,
                data
            }
        }
    }
}

class PGN127250 extends CANMessage {
    constructor() {
        super();
    }
    // checked
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
    toMessage(pgnObj) {
        if (pgnObj.pgn === 127250) {
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.sid);
            this.set2ByteUDouble(data, 1, pgnObj.heading, 0.0001);
            this.set2ByteDouble(data, 3, pgnObj.deviation, 0.0001);
            this.set2ByteDouble(data, 5, pgnObj.variation, 0.0001);
            this.setByte(data, 7, pgnObj.ref.id&0x03 | 0xfc);
            return {
                priority: 2,
                type: "extended",
                pgn: 127250,
                data
            }
        }
    }
}

class PGN127251 extends CANMessage {
    constructor() {
        super();
    }
    // checked.
    fromMessage(message) {
        return {
            pgn: 127251,
            message: "N2K Rate of Turn",
            sid: this.getByte(message, 0),
            rateOfTurn: this.get4ByteDouble(message, 1, 3.125E-08),
        };
    }
    toMessage(pgnObj) {
        if (pgnObj.pgn === 127251) {
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.sid);
            this.set4ByteDouble(data, 1, pgnObj.rateOfTurn, 3.125E-08);
            this.setByte(data, 5,0xff);
            this.set2ByteUInt(data, 6,0xffff);
            return {
                priority: 2,
                type: "extended",
                pgn: 127251,
                data
            }
        }
    }
}

class PGN127257 extends CANMessage {
    constructor() {
        super();
    }
    // checked
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
    toMessage(pgnObj) {
        if (pgnObj.pgn === 127257) {
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.sid);
            this.set2ByteDouble(data, 1, pgnObj.yaw, 0.0001);
            this.set2ByteDouble(data, 3, pgnObj.pitch, 0.0001);
            this.set2ByteDouble(data, 5, pgnObj.roll, 0.0001);
            return {
                priority: 3,
                type: "extended",
                pgn: 127257,
                data
            }
        }
    }
}

class PGN127258 extends CANMessage {
    constructor() {
        super();
    }
    // checked.
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
    toMessage(pgnObj) {
        if (pgnObj.pgn === 127258) {
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.sid);
            this.setByte(data, 1, pgnObj.source.id&0x0f);
            this.set2ByteUInt(data, 2, pgnObj.daysSince1970);
            this.set2ByteDouble(data, 4, pgnObj.variation, 0.001);
            this.set2ByteUInt(data, 6,0xffff);
            return {
                priority: 6,
                type: "extended",
                pgn: 127258,
                data
            }
        }
    }

}

class PGN128259 extends CANMessage {
    constructor() {
        super();
    }
    // checked
    fromMessage(message) {
        return {
            pgn: 128259,
            message: "N2K Speed",
            sid: this.getByte(message, 0),
            waterReferenced: this.get2ByteDouble(message, 1, 0.01),
            groundReferenced: this.get2ByteDouble(message, 3, 0.01),
            swrt: NMEA2000Reference.lookup("swrtType",this.getByte(message, 5)),
            speedDirection: (this.getByte(message, 6)>>4)&0x0f,
        };
    }
    toMessage(pgnObj) {
        if (pgnObj.pgn === 128259) {
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.sid);
            this.set2ByteDouble(data, 1, pgnObj.waterReferenced, 0.01);
            this.set2ByteDouble(data, 3, pgnObj.groundReferenced, 0.01);
            this.setByte(data, 5, pgnObj.swrt.id);
            this.setByte(data, 6, (pgnObj.speedDirection&0x0f)<<4 | 0x0f);
            this.setByte(data, 7,0xff);
            return {
                priority: 2,
                type: "extended",
                pgn: 128259,
                data
            }
        }
    }
}

class PGN128267 extends CANMessage {
    constructor() {
        super();
    }
    // checked
    fromMessage(message) {
        return {
            pgn: 128267,
            message: "N2K Water Depth",
            sid: this.getByte(message, 0),
            depthBelowTransducer: this.get4ByteUDouble(message, 1, 0.01),
            offset: this.get2ByteDouble(message, 5, 0.001),   
            maxRange: this.get1ByteUDouble(message, 7, 10),
        };
    }
    toMessage(pgnObj) {
        if (pgnObj.pgn === 128267) {
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.sid);
            this.set4ByteUDouble(data, 1, pgnObj.depthBelowTransducer, 0.01);
            this.set2ByteDouble(data, 5, pgnObj.offset, 0.001);
            this.set1ByteUDouble(data, 7, pgnObj.maxRange, 10);
            return {
                priority: 3,
                type: "extended",
                pgn: 128267,
                data
            }
        }
    }
}
class PGN128275 extends CANMessage {
    constructor() {
        super();
        this.fastPacket = true
    }
    // checked
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
    toMessage(pgnObj) {
        if (pgnObj.pgn === 128275) {
            const data = new DataView(new ArrayBuffer(14));
            this.set2ByteUInt(data, 0, pgnObj.daysSince1970);
            this.set4ByteUDouble(data, 2, pgnObj.secondsSinceMidnight, 0.0001);
            this.set4ByteUDouble(data, 6, pgnObj.log, 1);
            this.set4ByteUDouble(data, 10, pgnObj.tripLog, 1);
            return {
                priority: 6,
                fastPacket: true,
                type: "extended",
                pgn: 128275,
                data
            }
        }
    }
}

class PGN129026 extends CANMessage {
    constructor() {
        super();
    }
    // checked
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
    toMessage(pgnObj) {
        if (pgnObj.pgn === 129026) {
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.sid);
            this.setByte(data, 1, pgnObj.ref.id&0x03);
            this.set2ByteUDouble(data, 2, pgnObj.cog, 0.0001);
            this.set2ByteUDouble(data, 4, pgnObj.sog, 0.01);
            this.setByte(data, 6, 0xff);
            this.setByte(data, 7, 0xff);
            return {
                priority: 2,
                type: "extended",
                pgn: 129026,
                data
            }
        }
    }
}

class PGN129029 extends CANMessage {
    constructor() {
        super();
        this.fastPacket = true
    }
    //checked.
    fromMessage(message) {
        const typeMethod = this.getByte(message, 31);
        const nReferenceStations = this.getByte(message, 42);
        const stations = [];
        if ( nReferenceStations!= CANMessage.N2kUInt8NA ) {
            for(var i=0; i< nReferenceStations; i++) {
                const ind = this.get2ByteInt(message, 43+i*4);
                stations.push({
                    referenceStationType: NMEA2000Reference.lookup("gnssType",ind&0x0f),
                    referenceSationID: (ind>>4),
                    ageOfCorrection: this.get2ByteUDouble(message, 45+i*4,0.01)
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
            altitude: this.get8ByteDouble(message, 23, 1e-6), // 23+8=31
            GNSStype: NMEA2000Reference.lookup("gnssType",typeMethod&0x0f), 
            GNSSmethod: NMEA2000Reference.lookup("gnssMethod",(typeMethod>>4)&0x0f),  
            integrety: NMEA2000Reference.lookup("gnssIntegrity",this.getByte(message, 32)&0x03), 
            nSatellites: this.getByte(message, 33),
            hdop: this.get2ByteDouble(message, 34, 0.01),
            pdop: this.get2ByteDouble(message, 36, 0.01),
            geoidalSeparation: this.get4ByteDouble(message, 38, 0.01), //38+4=42
            nReferenceStations: nReferenceStations,
            stations: stations
        };
    }
    toMessage(pgnObj) {
        if (pgnObj.pgn === 129029) {
            const data = new DataView(new ArrayBuffer(42+pgnObj.nReferenceStations*4));
            this.setByte(data, 0, pgnObj.sid);
            this.set2ByteUInt(data, 1, pgnObj.daysSince1970);
            this.set4ByteUDouble(data, 3, pgnObj.secondsSinceMidnight, 0.0001);
            this.set8ByteDouble(data, 7, pgnObj.latitude, 1e-16);
            this.set8ByteDouble(data, 15, pgnObj.longitude, 1e-16);
            this.set8ByteDouble(data, 23, pgnObj.altitude, 1e-16);
            this.setByte(data, 31, (pgnObj.GNSStype.id&0x0f)|((pgnObj.GNSSmethod.id&0x0f)<<4));
            this.setByte(data, 32, (pgnObj.integrety.id&0x03) | 0xfc );
            this.setByte(data, 33, pgnObj.nSatellites);
            this.set2ByteDouble(data, 34, pgnObj.hdop, 0.01);
            this.set2ByteDouble(data, 36, pgnObj.pdop, 0.01);
            this.set4ByteDouble(data, 38, pgnObj.geoidalSeparation, 0.01);
            if ( pgnObj.nReferenceStations !== CANMessage.N2kUInt8NA ) {
                for(var i=0; i< pgnObj.nReferenceStations; i++) {
                    this.set2ByteInt(data, 42+i*4, pgnObj.stations[i].referenceStationType.id&0x0f | (pgnObj.stations[i].referenceSationID<<4) );
                    this.set2ByteUDouble(data, 44+i*4, pgnObj.stations[i].ageOfCorrection, 0.01);
                }
            }
            return {
                priority: 3,
                fastPacket: true,
                type: "extended",
                pgn: 129029,
                data
            }
        }
    }

}

class PGN129283 extends CANMessage {
    constructor() {
        super();
    }
    // checked
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
    toMessage(pgnObj) {
        if (pgnObj.pgn === 129283) {
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.sid);
            this.setByte(data, 1, pgnObj.xteMode.id&0x0f | ((pgnObj.navigationTerminated.id&0x01)<<6));
            this.set4ByteDouble(data, 2, pgnObj.xte, 0.01);
            this.setByte(data, 6, 0xff);
            this.setByte(data, 7, 0xff);

            return {
                priority: 3,
                type: "extended",
                pgn: 129283,
                data
            }
        }
    }
}

class PGN130306 extends CANMessage {
    constructor() {
        super();
    }
    // checked
    fromMessage(message) {

        const decoded = {
            pgn: 130306,
            message: "N2K Wind",
            sid: this.getByte(message, 0),
            windSpeed: this.get2ByteUDouble(message, 1, 0.01),
            windAngle: this.get2ByteUDouble(message, 3, 0.0001),
            windReference: NMEA2000Reference.lookup("windReference",this.getByte(message, 5)&0x07) 
        };
        // relative to the boat rather than a direction
        if ( decoded.windReference.id >  1) {
            if (decoded.windAngle > Math.PI ) {
                decoded.windAngle = decoded.windAngle - 2*Math.PI;
            }
        } 
        return decoded;
    }
    toMessage(pgnObj) {
        if (pgnObj.pgn === 130306) {
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.sid);
            this.set2ByteUDouble(data, 1, pgnObj.windSpeed, 0.01);
            this.set2ByteUDouble(data, 3, pgnObj.windAngle, 0.0001);
            this.setByte(data, 5, pgnObj.windReference.id&0x07);
            this.setByte(data, 6, 0xff);
            this.setByte(data, 7, 0xff);
            return {
                priority: 2,
                type: "extended",
                pgn: 130306,
                data
            }
        }
    }

}

class PGN130310 extends CANMessage {
    constructor() {
        super();
    }
    // checked
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
    toMessage(pgnObj) {
        if (pgnObj.pgn === 130310) {
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.sid);
            this.set2ByteUDouble(data, 1, pgnObj.waterTemperature, 0.01);
            this.set2ByteUDouble(data, 3, pgnObj.outsideAmbientAirTemperature, 0.01);
            this.set2ByteUDouble(data, 5, pgnObj.atmosphericPressure, 100);
            this.setByte(data, 7,0xff);
            return {
                priority: 5,
                type: "extended",
                pgn: 130310,
                data
            }
        }
    }

}

class PGN130311 extends CANMessage {
    constructor() {
        super();
    }
    // checked
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
    toMessage(pgnObj) {
        if (pgnObj.pgn === 130311) {
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.sid);
            this.setByte(data, 1, (pgnObj.tempSource.id&0x3f) | ((pgnObj.humiditySource.id&0x03)<<6) );
            this.set2ByteUDouble(data, 2, pgnObj.temperature, 0.01);
            this.set2ByteDouble(data, 4, pgnObj.humidity, 0.004);
            this.set2ByteUDouble(data, 6, pgnObj.atmosphericPressure, 100);
            return {
                pgn: 130311,
                type: "extended",
                data
            }
        }
    }

}

class PGN130313 extends CANMessage {
    constructor() {
        super();
    }
    // checked
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
    toMessage(pgnObj) {
        if (pgnObj.pgn === 130313) {
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.sid);
            this.setByte(data, 1, pgnObj.humidityInstance );
            this.setByte(data, 2, pgnObj.humiditySource.id );
            this.set2ByteDouble(data, 3, pgnObj.actualHumidity, 0.004);
            this.set2ByteDouble(data, 5, pgnObj.setHumidity, 0.004);
            this.setByte(data, 7,0xff);
            return {
                pgn: 130313,
                type: "extended",
                data
            }
        }
    }

}

class PGN130314 extends CANMessage {
    constructor() {
        super();
    }
    // checked
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
    toMessage(pgnObj) {
        if (pgnObj.pgn === 130314) {
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.sid);
            this.setByte(data, 1, pgnObj.pressureInstance );
            this.setByte(data, 2, pgnObj.pressureSource.id );
            this.set4ByteDouble(data, 3, pgnObj.actualPressure, 0.1);
            this.setByte(data, 7,0xff);
            return {
                pgn: 130314,
                type: "extended",
                data
            }
        }
    }

}

class PGN130315 extends CANMessage {
    constructor() {
        super();
    }
    // checked
    fromMessage(message) {
        return{
            pgn: 130315,
            message: "N2K Set Pressure",
            sid: this.getByte(message, 0),
            pressureInstance: this.getByte(message, 1),
            pressureSource: NMEA2000Reference.lookup("pressureSource",this.getByte(message, 2)),
            setPressure: this.get4ByteUDouble(message, 3, 0.1)        
        };
    }
    toMessage(pgnObj) {
        if (pgnObj.pgn === 130315) {
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.sid);
            this.setByte(data, 1, pgnObj.pressureInstance );
            this.setByte(data, 2, pgnObj.pressureSource.id );
            this.set4ByteUDouble(data, 3, pgnObj.setPressure, 0.1);
            this.setByte(data, 7,0xff);
            return {
                pgn: 130315,
                type: "extended",
                data
            }
        }
    }

}

class PGN130316 extends CANMessage {
    constructor() {
        super();
    }
    // checked
    fromMessage(message) {
        return {
            pgn: 130316,
            message: "N2K Temperature Extended",
            sid: this.getByte(message, 0),
            tempInstance: this.getByte(message, 1),
            tempSource: NMEA2000Reference.lookup("temperatureSource",this.getByte(message, 2)),
            actualTemperature: this.get3ByteUDouble(message, 3, 0.001),
            setTemperature: this.get2ByteUDouble(message, 6, 0.1)
        };
    }
    toMessage(pgnObj) {
        if (pgnObj.pgn === 130316) {
            // little odd, is this a fast packet or not ?
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.sid);
            this.setByte(data, 1, pgnObj.pressureInstance );
            this.setByte(data, 2, pgnObj.tempSource.id );
            this.set3ByteUDouble(data, 3, pgnObj.actualTemperature, 0.001  );
            this.set2ByteUDouble(data, 6, pgnObj.setTemperature, 0.1);
            return {
                priority: 5,
                type: "extended",
                pgn: 130316,
                data
            }
        }
    }

}

class PGN127506 extends CANMessage {
    constructor() {
        super();
        this.fastPacket = true;
    }
    // checked
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
    toMessage(pgnObj) {
        if (pgnObj.pgn === 127506) {
            const data = new DataView(new ArrayBuffer(11));
            this.setByte(data, 0, pgnObj.sid);
            this.setByte(data, 1, pgnObj.dcInstance );
            this.setByte(data, 2, pgnObj.dcType.id );
            this.setByte(data, 3, pgnObj.stateOfCharge);
            this.setByte(data, 4, pgnObj.stateOfHealth );
            this.set2ByteUDouble(data, 5, pgnObj.timeRemaining, 60  );
            this.set2ByteUDouble(data, 7, pgnObj.rippleVoltage, 0.001);
            this.set2ByteUDouble(data, 9, pgnObj.capacity, 3600);
            return {
                fastPacket: true,
                priority: 5,
                type: "extended",
                pgn: 127506,
                data
            }
        }
    }
}

class PGN130916 extends CANMessage {
    constructor() {
        super();
    }
    // checked
    fromMessage(message) {
        return {
            pgn: 130916,
            message: "Raymarine Proprietary unknown",
            canmessage: this.dumpMessage(message)
        };
    }
    toMessage(pgnObj) {
        if (pgnObj.pgn === 130916) {
            return {
                priority: 5,
                type: "extended",
                pgn: 130916,
                data: pgnObj.message
            }
        }
    }
}

class PGN126720 extends CANMessage {
    constructor() {
        super();
        this.fastPacket = true;
    }
    // not verified.
    fromMessage(message) {
        const f1 = this.get2ByteUInt(message, 0);
        const manufacturerCode = (f1 >> 5)&0x07ff;
        const industry = (f1)&0x07;
        const propietaryId = this.get2ByteUInt(message, 2);
        if ( (manufacturerCode == 1851) && (industry === 4))   {
            if ( propietaryId === 33264 ) {
                const command = this.getByte(message, 4);
                switch(command) {
                    case 132:           
                        return {
                            pgn: 126720,
                            message: "Raymarine Seatalk 1 Pilot Mode",
                            canmessage: this.dumpMessage(message),
                            manufacturerCode:  NMEA2000Reference.lookup("manufacturerCode", manufacturerCode),
                            industry: NMEA2000Reference.lookup("industry", industry),
                            propietaryId,
                            command,
                            uknown1: this.getByte(message, 5),
                            uknown2: this.getByte(message, 6),
                            uknown3: this.getByte(message, 7),
                            pilotMode: NMEA2000Reference.lookup("seatalkPilotMode", this.getByte(message, 8)), 
                            subMode: this.getByte(message, 8),
                            pilotModeData: this.getByte(message, 8),
                            // remaining 10 bytes unknown.
                        }
                    case 134:
                        return {
                            pgn: 126720,
                            message: "Raymarine Seatalk 1 Keystroke",
                            canmessage: this.dumpMessage(message),
                            manufacturerCode:  NMEA2000Reference.lookup("manufacturerCode", manufacturerCode),
                            industry: NMEA2000Reference.lookup("industry", industry),
                            propietaryId,
                            command,
                            device: this.getByte(message, 5),
                            key: NMEA2000Reference.lookup("seatalkKeystroke", this.getByte(message, 6)), 
                            keyInverted: this.getByte(message, 7),
                            // remaining 14 bytes unknown
                        };
                    case 144:
                        return {
                            pgn: 126720,
                            message: "Raymarine Seatalk 1 Device Identification",
                            canmessage: this.dumpMessage(message),
                            manufacturerCode:  NMEA2000Reference.lookup("manufacturerCode", manufacturerCode),
                            industry: NMEA2000Reference.lookup("industry", industry),
                            propietaryId,
                            command,
                            reserved: this.getByte(message, 5),
                            deviceId: NMEA2000Reference.lookup("seatalkDeviceId", this.getByte(message, 6)), 

                        };
                    default:
                        return {
                            pgn: 126720,
                            message: "Raymarine Seatalk 1 UnknownCommand",
                            canmessage: this.dumpMessage(message),
                            manufacturerCode:  NMEA2000Reference.lookup("manufacturerCode", manufacturerCode),
                            industry: NMEA2000Reference.lookup("industry", industry),
                            propietaryId,
                            command
                        };
                }

            } else if ( propietaryId === 3212 ) {
                const command = this.getByte(message, 6);
                switch(command) {
                    case 0:
                        // this is sent but filtered.
                        return {
                            pgn: 126720,
                            message: "Raymarine Seatalk1 Display Birghtness",
                            canmessage: this.dumpMessage(message),
                            manufacturerCode:  NMEA2000Reference.lookup("manufacturerCode", manufacturerCode),
                            industry: NMEA2000Reference.lookup("industry", industry),
                            propietaryId,
                            group:  NMEA2000Reference.lookup("seatalkNetworkGroup", this.getByte(message, 4)),
                            unknown1: this.getByte(message, 5),
                            command,
                            brightness: this.getByte(message, 7),
                            unknown2: this.getByte(message, 8),
                        };
                    case 1:
                        return {
                            pgn: 126720,
                            message: "Raymarine Seatalk1 Display Color",
                            canmessage: this.dumpMessage(message),
                            manufacturerCode:  NMEA2000Reference.lookup("manufacturerCode", manufacturerCode),
                            industry: NMEA2000Reference.lookup("industry", industry),
                            propietaryId,
                            group:  NMEA2000Reference.lookup("seatalkNetworkGroup", this.getByte(message, 4)),
                            unknown1: this.getByte(message, 5),
                            command,
                            color: NMEA2000Reference.lookup("seatalkDisplayColor", this.getByte(message, 7)),
                            unknown2: this.getByte(message, 8),
                        };
                    default:
                        return {
                            pgn: 126720,
                            message: "Raymarine Seatalk1 Unknown 3212 ",
                            canmessage: this.dumpMessage(message),
                            manufacturerCode:  NMEA2000Reference.lookup("manufacturerCode", manufacturerCode),
                            industry: NMEA2000Reference.lookup("industry", industry),
                            propietaryId,
                            group:  NMEA2000Reference.lookup("seatalkNetworkGroup", this.getByte(message, 4)),
                            unknown1: this.getByte(message, 5),
                            command,
                            value: this.getByte(message, 7),
                            unknown2: this.getByte(message, 8),
                        };
                }
            } else {
                return {
                    pgn: 126720,
                    message: "Unknown Raymarine Proprietary message",
                    canmessage: this.dumpMessage(message),
                    manufacturerCode:  NMEA2000Reference.lookup("manufacturerCode", manufacturerCode),
                    industry: NMEA2000Reference.lookup("industry", industry),
                    propietaryId,
                };


            }
        } else {
            return {
                pgn: 126720,
                message: "Unknown Proprietary message",
                canmessage: this.dumpMessage(message),
                manufacturerCode:  NMEA2000Reference.lookup("manufacturerCode", manufacturerCode),
                industry: NMEA2000Reference.lookup("industry", industry),
                propietaryId,
            };
        }

    }
    toMessage(pgnObj) {
        if (pgnObj.pgn === 126720) {
            if ( (pgnObj.manufacturerCode == 1851) && (pgnObj.industry === 4))   {
                if ( pgnObj.propietaryId === 33264 ) {
                    switch(pgnObj.command) {
                        case 132: {
                                const data = new DataView(new ArrayBuffer(21));
                                this.set2ByteUInt(data, 0, ((pgnObj.manufacturerCode&0x07ff)<<5) | (pgnObj.industry&0x07));
                                this.set2ByteUInt(data, 2, pgnObj.propietaryId);
                                this.setByte(data, 4, pgnObj.command );
                                this.setByte(data, 5, pgnObj.uknown1 );
                                this.setByte(data, 6, pgnObj.uknown2 );
                                this.setByte(data, 7, pgnObj.uknown3 );
                                this.setByte(data, 8, pgnObj.pilotMode.id );
                                this.setByte(data, 9, pgnObj.subMode );
                                this.setByte(data, 10, pgnObj.pilotModeData );
                                for (let i = 0; i < 10; i++) {
                                    this.setByte(data, 11+i, 0xff );
                                }
                                return {
                                    fastPacket: true,
                                    type: "extended",
                                    priority: 5,
                                    pgn: 126720,
                                    data
                                }
                            }
            
                        case 134:{
                                const data = new DataView(new ArrayBuffer(22));
                                this.set2ByteUInt(data, 0, ((pgnObj.manufacturerCode&0x07ff)<<5) | (pgnObj.industry&0x07));
                                this.set2ByteUInt(data, 2, pgnObj.propietaryId);
                                this.setByte(data, 4, pgnObj.command );
                                this.setByte(data, 5, pgnObj.device );
                                this.setByte(data, 6, pgnObj.key.id );
                                this.setByte(data, 7, pgnObj.keyInverted );
                                for (let i = 0; i < 14; i++) {
                                    this.setByte(data, 8+i, 0xff );
                                }
                                return {
                                    fastPacket: true,
                                    type: "extended",
                                    priority: 5,
                                    pgn: 126720,
                                    data
                                }
                            }
                        case 144: {
                                const data = new DataView(new ArrayBuffer(7));
                                this.set2ByteUInt(data, 0, ((pgnObj.manufacturerCode&0x07ff)<<5) | (pgnObj.industry&0x07));
                                this.set2ByteUInt(data, 2, pgnObj.propietaryId);
                                this.setByte(data, 4, pgnObj.command );
                                this.setByte(data, 5, pgnObj.reserved );
                                this.setByte(data, 6, pgnObj.deviceId.id );
                                return {
                                    fastPacket: true,
                                    type: "extended",
                                    priority: 5,
                                    pgn: 126720,
                                    data
                                }
                            }
                        default:
                            return {
                                fastPacket: true,
                                type: "extended",
                                priority: 5,
                                pgn: 126720,
                                data: pgnObj.canmessage
                            }
                    }

                } else if ( pgnObj.propietaryId === 3212 ) {
                    switch(pgnObj.command) {
                        case 0: {
                                const data = new DataView(new ArrayBuffer(9));
                                this.set2ByteUInt(data, 0, ((pgnObj.manufacturerCode&0x07ff)<<5) | (pgnObj.industry&0x07));
                                this.set2ByteUInt(data, 2, pgnObj.propietaryId);
                                this.setByte(data, 4, pgnObj.group.id );
                                this.setByte(data, 5, pgnObj.unknown1 );
                                this.setByte(data, 6, pgnObj.command );
                                this.setByte(data, 7, pgnObj.brightness );
                                this.setByte(data, 8, pgnObj.unknown2 );
                                return {
                                    fastPacket: true,
                                    type: "extended",
                                    priority: 5,
                                    pgn: 126720,
                                    data
                                }
                            }
                        case 1: {
                                const data = new DataView(new ArrayBuffer(9));
                                this.set2ByteUInt(data, 0, ((pgnObj.manufacturerCode&0x07ff)<<5) | (pgnObj.industry&0x07));
                                this.set2ByteUInt(data, 2, pgnObj.propietaryId);
                                this.setByte(data, 4, pgnObj.group.id );
                                this.setByte(data, 5, pgnObj.unknown1 );
                                this.setByte(data, 6, pgnObj.command );
                                this.setByte(data, 7, pgnObj.color.id );
                                this.setByte(data, 8, pgnObj.unknown2 );
                                return {
                                    fastPacket: true,
                                    type: "extended",
                                    priority: 5,
                                    pgn: 126720,
                                    data
                                }
                            }
                        default: {
                                const data = new DataView(new ArrayBuffer(9));
                                this.set2ByteUInt(data, 0, ((pgnObj.manufacturerCode&0x07ff)<<5) | (pgnObj.industry&0x07));
                                this.set2ByteUInt(data, 2, pgnObj.propietaryId);
                                this.setByte(data, 4, pgnObj.group.id );
                                this.setByte(data, 5, pgnObj.unknown1 );
                                this.setByte(data, 6, pgnObj.command );
                                this.setByte(data, 7, pgnObj.value );
                                this.setByte(data, 8, pgnObj.unknown2 );
                                return {
                                    fastPacket: true,
                                    type: "extended",
                                    priority: 5,
                                    pgn: 126720,
                                    data
                                }
                            }
                    }
                } 
            }
            return {
                fastPacket: true,
                type: "extended",
                priority: 5,
                pgn: 126720,
                data: pgnObj.canmessage
            }

        }
    }

}

class PGN127237 extends CANMessage {

    constructor() {
        super();
        this.fastPacket = true;
    }
    // not verified.

    fromMessage(message) {
        const v1 = this.getByte(message, 0);
        const v2 = this.getByte(message, 1);
        // not sent from test.
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
    toMessage(pgnObj) {
        if (pgnObj.pgn === 127237) {
            const data = new DataView(new ArrayBuffer(21));
            this.setByte(data, 0, pgnObj.rudderLimitExceeded&0x03 
                                 | ((pgnObj.offHeadingLimitExceeded&0x03)<<2) 
                                 | ((pgnObj.offTrackLimitExceeded&0x03)<<4) 
                                 | ((pgnObj.override&0x03)<<6));
            this.setByte(data, 1, pgnObj.steeringMode&0x07 
                                 | ((pgnObj.turnMode&0x07)<<3) 
                                 | ((pgnObj.headingReference&0x07)<<6));
            this.setByte(data, 2, pgnObj.commandedRudderDirection<<5 | 0x1f); 
            this.set2ByteDouble(data, 3, pgnObj.commandedRudderAngle,  0.0001  );
            this.set2ByteUDouble(data, 5, pgnObj.headingToSteerCourse,  0.0001  );
            this.set2ByteUDouble(data, 7, pgnObj.track,  0.0001  );
            this.set2ByteUDouble(data, 9, pgnObj.rudderLimit,  0.0001  );
            this.set2ByteUDouble(data, 11, pgnObj.offHeadingLimit,  0.0001  );
            this.set2ByteDouble(data, 13, pgnObj.radiusOfTurnOrder,  1  );
            this.set2ByteDouble(data, 15, pgnObj.rateOfTurnOrder,  3.125e-5  );
            this.set2ByteDouble(data, 17, pgnObj.offTrackLimit,  1  );
            this.set2ByteUDouble(data, 19, pgnObj.vesselHeading,  0.0001 );
            return {
                fastPacket: true,
                type: "extended",
                priority: 2,
                pgn: 127237,
                data
            }
        }
    }
}


class PGN65359 extends CANMessage {
    constructor() {
        super();
    }
    // not verified
    fromMessage(message) {
        const f1 = this.get2ByteUInt(message, 0);
        if ( (((f1 >> 5)&0x07ff == 1851) && ((f1)&0x07 === 4)) )  {
            return {
                pgn: 65359,
                message: "Raymarine Seatalk Pilot Heading",
                canmessage: this.dumpMessage(message),
                manufacturerCode: (f1 >> 5)&0x07ff, // should be 1851 == Raymarine
                reserved1: (f1>>3)&0x03,
                industry: (f1)&0x07,
                sid: this.getByte(message, 2),
                headingTrue: this.get2ByteUDouble(message, 3, 0.0001),
                headingMagnetic: this.get2ByteUDouble(message, 5, 0.0001),
                reserved2: this.getByte(7)
            };

        } else {
            return {
                pgn: 65359,
                message: "Unknown Proprietary",
                canmessage: this.dumpMessage(message),
                manufacturerCode: (f1 >> 5)&0x07ff, 
                reserved1: (f1>>3)&0x03,
                industry: (f1)&0x07
            };
        }
    }
    toMessage(pgnObj) {
        if (pgnObj.pgn === 65359) {
            if ((pgnObj.manufacturerCode === 1851) && (pgnObj.industry === 4) ) {
                const data = new DataView(new ArrayBuffer(8));
                this.set2ByteUInt(data, 0, ((pgnObj.manufacturerCode&0x07ff)<<5) 
                                | (pgnObj.industry&0x07)
                                | ((pgnObj.reserved1&0x03)<<3));
                this.setByte(data, 2, pgnObj.sid);
                this.set2ByteUDouble(data, 3, pgnObj.headingTrue, 0.0001 );
                this.set2ByteUDouble(data, 5, pgnObj.headingMagnetic, 0.0001 );
                this.setByte(data, 7, pgnObj.reserved2);
                return {
                    priority: 5,
                    type: "extended",
                    pgn: 65359,
                    data
                }
            } else {
                return {
                    priority: 5,
                    type: "extended",
                    pgn: 65359,
                    data: pgnObj.canmessage
                }
            }
        }
    }

}

class PGN65379 extends CANMessage {
    constructor() {
        super();
    }
    // not verified
    fromMessage(message) {
        const f1 = this.get2ByteUInt(message, 0);
        if ( (((f1 >> 5)&0x07ff == 1851) && ((f1)&0x07 === 4)) )  {
            return {
                pgn: 65379,
                message: "Raymarine Seatalk Pilot Heading 2",
                canmessage: this.dumpMessage(message),
                manufacturerCode: (f1 >> 5)&0x07ff, // should be 1851 == Raymarine
                reserved1: (f1>>3)&0x03,
                industry: (f1)&0x07, // should be 4
                pilotMode: this.get2ByteUInt(message, 2),
                subMode: this.get2ByteUInt(message, 4),
                pilotModeData: this.getByte(message, 6)
            };
        } else {
            return {
                pgn: 65379,
                message: "Unknown Proprietary",
                canmessage: this.dumpMessage(message),
                manufacturerCode: (f1 >> 5)&0x07ff, 
                reserved1: (f1>>3)&0x03,
                industry: (f1)&0x07
            };

        }
    }
    toMessage(pgnObj) {
        if (pgnObj.pgn === 65379) {
            if ((pgnObj.manufacturerCode === 1851) && (pgnObj.industry === 4) ) {
                const data = new DataView(new ArrayBuffer(8));
                this.set2ByteUInt(data, 0, ((pgnObj.manufacturerCode&0x07ff)<<5) 
                                | (pgnObj.industry&0x07)
                                | ((pgnObj.reserved1&0x03)<<3));
                this.set2ByteUInt(data, 2, pgnObj.pilotMode);
                this.set2ByteUInt(data, 4, pgnObj.subMode);
                this.setByte(data, 6, pgnObj.pilotModeData);
                this.setByte(data, 7, 0xff);
                return {
                    priority: 5,
                    type: "extended",
                    pgn: 65379,
                    data
                }
            } else {
                return {
                    priority: 5,
                    type: "extended",
                    pgn: 65379,
                    data: pgnObj.canmessage
                }
            }
        }
    }


}

class PGN65384 extends CANMessage {
    constructor() {
        super();
    }
    // not verified
    fromMessage(message) {
        const f1 = this.get2ByteUInt(message, 0);
        if ( (((f1 >> 5)&0x07ff == 1851) && ((f1)&0x07 === 4)) )  {
            return {
                pgn: 65384,
                message: "Raymarine Seatalk Pilot Heading 3",
                canmessage: this.dumpMessage(message),
                manufacturerCode: (f1 >> 5)&0x07ff, // should be 1851 == Raymarine
                reserved1: (f1>>3)&0x03,
                industry: (f1)&0x07, // should be 4
                // rest is unknown.
            };
        } else {
            return {
                pgn: 65384,
                message: "Unknown Proprietary",
                canmessage: this.dumpMessage(message),
                manufacturerCode: (f1 >> 5)&0x07ff, 
                reserved1: (f1>>3)&0x03,
                industry: (f1)&0x07
            };   
        }
    }
    toMessage(pgnObj) {
        if (pgnObj.pgn === 65384) {
            return {
                priority: 5,
                type: "extended",
                pgn: 65384,
                data: pgnObj.canmessage
            }            
        }
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
