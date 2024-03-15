"use strict";
const { CANMessage, NMEA2000Reference } = require('./messages_decoder.js');

/**
 * EngineDynamicParam, the message is transfered as a fast packet. from
 */

class PGN127489_EngineDynamicParam extends CANMessage{
    constructor() {
        super();
        this.fastPacket = true;
    }
    engineStatus1(message) {
        const v = this.get2ByteUInt(message, 20);
        const status=[];
        if ( v&0x01 == 0x01 ) status.push("Check Engine");
        if ( v&0x02 == 0x02 ) status.push("Over Temperature");
        if ( v&0x04 == 0x04 ) status.push("Low Oil Pressure");
        if ( v&0x08 == 0x08 ) status.push("Low Oil Level");
        if ( v&0x10 == 0x10 ) status.push("Low Fuel Pressure");
        if ( v&0x20 == 0x20 ) status.push("Low System Voltage");
        if ( v&0x40 == 0x40 ) status.push("Low Coolant Level");
        if ( v&0x80 == 0x80 ) status.push("Water Flow");
        if ( v&0x100 == 0x100 ) status.push("Water In Fuel");
        if ( v&0x200 == 0x200 ) status.push("Charge Indicator");
        if ( v&0x400 == 0x400 ) status.push("Preheat Indicator");
        if ( v&0x800 == 0x800) status.push("High Boost Pressure");
        if ( v&0x1000 == 0x1000) status.push("Rev Limit Exceeded");
        if ( v&0x2000 == 0x2000 ) status.push("EGR System");
        if ( v&0x4000 == 0x4000 ) status.push("Throttle Position Sensor");
        if ( v&0x8000 == 0x8000 ) status.push("Emergency Stop");
        return status;
    }
    engineStatus2(message) {
        const v = this.get2ByteUInt(message, 22);
        const status=[];
        if ( v&0x01 == 0x01 ) status.push("Warning Level 1");
        if ( v&0x02 == 0x02 ) status.push("Warning Level 2");
        if ( v&0x04 == 0x04 ) status.push("Power Reduction");
        if ( v&0x08 == 0x08 ) status.push(" Maintenance Needed");
        if ( v&0x10 == 0x10 ) status.push("Engine Comm Error");
        if ( v&0x20 == 0x20 ) status.push("Sub or Secondary Throttle");
        if ( v&0x40 == 0x40 ) status.push("Neutral Start Protect");
        if ( v&0x80 == 0x80 ) status.push("Engine Shutting Down");
        return status;
    }
    // checked
    fromMessage(message) {
        return {
            pgn: 127489,
            message: "EngineDynamicParam",
            engineInstance: this.getByte(message, 0),
            engineOilPressure: this.get2ByteUDouble(message, 1,100),
            engineOilTemperature: this.get2ByteUDouble(message, 3,0.1),
            engineCoolantTemperature: this.get2ByteUDouble(message, 5,0.01),
            alternatorVoltage: this.get2ByteDouble(message, 7,0.01),
            fuelRate: this.get2ByteDouble(message, 9,0.1),
            engineHours: this.get4ByteUDouble(message, 11, 1),
            engineCoolantPressure: this.get2ByteUDouble(message, 15, 100),
            engineFuelPressure: this.get2ByteUDouble(message, 17, 1000),
            reserved: this.getByte(message, 19),
            status1: this.engineStatus1(message),
            status2: this.engineStatus1(message),
            engineLoad: this.get1ByteInt(message, 24),
            engineTorque: this.get1ByteInt(message, 25)
        }
    }

    toMessage(pgnObj) {
        if (pgnObj.pgn === 127489) {
            let status1 = 0x00;
            if ( pgnObj.status1.contains("Check Engine") ) status1 = status1 | 0x01;
            if ( pgnObj.status1.contains("Over Temperature") ) status1 = status1 | 0x02;
            if ( pgnObj.status1.contains("Low Oil Pressure") ) status1 = status1 | 0x04;
            if ( pgnObj.status1.contains("Low Oil Level") ) status1 = status1 | 0x08;
            if ( pgnObj.status1.contains("Low Fuel Pressure") ) status1 = status1 | 0x10;
            if ( pgnObj.status1.contains("Low System Voltage") ) status1 = status1 | 0x20;
            if ( pgnObj.status1.contains("Low Coolant Level") ) status1 = status1 | 0x40;
            if ( pgnObj.status1.contains("Water Flow") ) status1 = status1 | 0x80;
            if ( pgnObj.status1.contains("Water In Fuel") ) status1 = status1 | 0x100;
            if ( pgnObj.status1.contains("Charge Indicator") ) status1 = status1 | 0x200;
            if ( pgnObj.status1.contains("Preheat Indicator") ) status1 = status1 | 0x400;
            if ( pgnObj.status1.contains("High Boost Pressure") ) status1 = status1 | 0x800;
            if ( pgnObj.status1.contains("Rev Limit Exceeded") ) status1 = status1 | 0x1000;
            if ( pgnObj.status1.contains("EGR System") ) status1 = status1 | 0x2000;
            if ( pgnObj.status1.contains("Throttle Position Sensor") ) status1 = status1 | 0x4000;
            if ( pgnObj.status1.contains("Emergency Stop") ) status1 = status1 | 0x8000;
            let status2 = 0x00;
            if ( pgnObj.status2.contains("Warning Level 1") ) status2 = status2 | 0x1;
            if ( pgnObj.status2.contains("Warning Level 2") ) status2 = status2 | 0x2;
            if ( pgnObj.status2.contains("Power Reduction") ) status2 = status2 | 0x4;
            if ( pgnObj.status2.contains("Maintenance Needed") ) status2 = status2 | 0x8;
            if ( pgnObj.status2.contains("Engine Comm Error") ) status2 = status2 | 0x10;
            if ( pgnObj.status2.contains("Sub or Secondary Throttle") ) status2 = status2 | 0x20;
            if ( pgnObj.status2.contains("Neutral Start Protect") ) status2 = status2 | 0x40;
            if ( pgnObj.status2.contains("Engine Shutting Down") ) status2 = status2 | 0x80;
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.engineInstance);
            this.set2ByteUDouble(data, 1, pgnObj.engineOilPressure, 100);
            this.set2ByteUDouble(data, 3, pgnObj.engineOilTemperature, 0.1);
            this.set2ByteUDouble(data, 5, pgnObj.engineCoolantTemperature, 0.01);
            this.set2ByteDouble(data, 7, pgnObj.alternatorVoltage, 0.01);
            this.set2ByteDouble(data, 9, pgnObj.fuelRate, 0.1);
            this.set4ByteUDouble(data, 11, pgnObj.engineHours, 1);
            this.set2ByteUDouble(data, 15, pgnObj.engineCoolantPressure, 100);
            this.set2ByteUDouble(data, 17, pgnObj.engineFuelPressure, 1000);
            this.setByte(data, 19, pgnObj.reserved);

            this.set2ByteUInt(data, 20, status1);
            this.set2ByteUInt(data, 22, status2);
            this.set1ByteInt(data, 24, pgnObj.engineLoad);
            this.set1ByteInt(data, 25, pgnObj.engineTorque);
            return {
                fastPacket: true,
                priority: 2,
                pgn: 127489,
                data
            }
        }
    }


}



/*
 * RapidEngineData
 */
class PGN127488_RapidEngineData extends CANMessage{
    constructor() {
        super();
    }
    // checked ok
    fromMessage(message) {
        return {
            pgn: 127488,
            message: "RapidEngineData",
            engineInstance: this.getByte(message,0),
            engineSpeed: this.get2ByteUDouble(message,1 ,0.25), // RPM
            engineBoostPressure: this.get2ByteUDouble(message, 3,100),
            engineTiltTrim: this.getByte(message,5)
        }
    }
    toMessage(pgnObj) {
        if (pgnObj.pgn === 127488) {
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.engineInstance);
            this.set2ByteUDouble(data, 1, pgnObj.engineSpeed, 0.25);
            this.set2ByteUDouble(data, 3, pgnObj.engineBoostPressure, 100);
            this.setByte(data, 5, pgnObj.engineTiltTrim);
            this.setByte(data, 6, 0xff);
            this.setByte(data, 7, 0xff);
            return {
                priority: 2,
                pgn: 127488,
                data
            }
        }
    }

}
/**
 * Temperature
 */
class PGN130312_Temperature extends CANMessage {
    constructor() {
        super();
    }

    // checked
    fromMessage(message) {
        return  {
            pgn: 130312,
            message: "Temperature",
            sid: this.getByte(message,0),
            instance: this.getByte(message,1),
            source: NMEA2000Reference.lookup("temperatureSource",this.getByte(message,2)),
            actualTemperature: this.get2ByteUDouble(message, 3,0.01),
            requestedTemperature: this.get2ByteUDouble(message, 5,0.01)
        };
    }
    toMessage(pgnObj) {
        if (pgnObj.pgn === 130312) {
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.sid);
            this.setByte(data, 1, pgnObj.instance);
            this.setByte(data, 2, pgnObj.source.id);
            this.set2ByteUDouble(data, 3, pgnObj.actualTemperature, 0.01);
            this.set2ByteUDouble(data, 5, pgnObj.requestedTemperature, 0.01);
            this.setByte(data, 7, 0xff);
            return {
                priority: 5,
                pgn: 130312,
                data
            }
        }
    }
}
/*
 * DC BatteryStatus
 */
class PGN127508_DCBatteryStatus extends CANMessage {
    constructor() {
        super();
    }

    // checked.
    fromMessage(message) {
        return  {
            pgn: 127508,
            message: "DCBatteryStatus",
            instance: this.getByte(message,0),
            batteryVoltage: this.get2ByteUDouble(message, 1,0.01),
            batteryCurrent: this.get2ByteDouble(message, 3,0.1),
            batteryTemperature: this.get2ByteUDouble(message, 5,0.01),
            sid: this.getByte(message,7),
        };
    }
    toMessage(pgnObj) {
        if (pgnObj.pgn === 127508) {
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, pgnObj.instance);
            this.set2ByteUDouble(data, 1, pgnObj.actualTemperature, 0.01);
            this.set2ByteDouble(data, 3, pgnObj.requestedTemperature, 0.1);
            this.set2ByteUDouble(data, 5, pgnObj.requestedTemperature, 0.01);
            this.setByte(data, 7, pgnObj.sid);
            return {
                priority: 6,
                pgn: 127508,
                data
            }
        }
    }
}
/**
 * FluidLevel
 */
class PGN127505_FluidLevel extends CANMessage {
    constructor() {
        super();
    }

    // checked
    fromMessage(message) {
        const b = this.getByte(message,0)
        return {
            pgn: 127505,
            message: "FluidLevel",
            instance: b&0x0f,
            fluidType: NMEA2000Reference.lookup("tankType",(b>>4)&0x0f),
            fluidLevel: this.get2ByteDouble(message, 1,0.004),
            fluidCapacity: this.get4ByteUDouble(message, 3,0.1)
        };
    }
    toMessage(pgnObj) {
        if (pgnObj.pgn === 127505) {
            const data = new DataView(new ArrayBuffer(8));
            this.setByte(data, 0, (pgnObj.instance&0x0f) | ((pgnObj.fluidType&0x0f)<<4)) ;
            this.get2ByteUDouble(data, 1, pgnObj.actualTemperature, 0.01);
            this.get2ByteDouble(data, 3, pgnObj.fluidLevel, 0.001);
            this.get2ByteUDouble(data, 5, pgnObj.fluidCapacity, 0.01);
            this.setByte(data, 7, 0xff);
            return {
                priority: 6,
                pgn: 127505,
                data
            }
        }
    }
}

const register = (pgnRegistry) => {
    pgnRegistry[127489] = new PGN127489_EngineDynamicParam();
    pgnRegistry[127488] = new PGN127488_RapidEngineData();
    pgnRegistry[130312] = new PGN130312_Temperature();
    pgnRegistry[127508] = new PGN127508_DCBatteryStatus();
    pgnRegistry[127505] = new PGN127505_FluidLevel();    
}





module.exports =  { 
    register

};