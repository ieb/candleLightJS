"use strict";
const { CANMessage } = require('./messages_decoder.js');

/**
 * EngineDynamicParam, the message is transfered as a fast packet. from
 */
class PGN127489_EngineDynamicParam extends CANMessage{
    constructor() {
        super();
        this.fastPacket = true;
    }
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
            status1: this.get2ByteUint(message, 20),
            status2: this.get2ByteUint(message, 22),
            engineLoad: this.getByte(message, 24),
            engineTorque: this.getByte(message, 25)
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
    fromMessage(message) {
        return {
            pgn: 127488,
            message: "RapidEngineData",
            engineInstance: this.getByte(message,0),
            engineSpeed: this.get2ByteUDouble(message,1 ,0.25),
            engineBoostPressure: this.get2ByteUDouble(message, 3,100),
            engineTiltTrim: this.getByte(message,5)
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
    fromMessage(message) {
        return  {
            pgn: 130312,
            message: "Temperature",
            sid: this.getByte(message,0),
            instance: this.getByte(message,1),
            source: this.getByte(message,2),
            actualTemperature: this.get2ByteUDouble(message, 3,0.01),
            requestedTemperature: this.get2ByteUDouble(message, 5,0.01)
        };
    }
}
/*
 * DC BatteryStatus
 */
class PGN127508_DCBatteryStatus extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        return  {
            pgn: 127508,
            message: "DCBatteryStatus",
            instance: this.getByte(message,0),
            batteryInstance: this.get2ByteDouble(message, 1,0.01),
            batteryCurrent: this.get2ByteDouble(message, 3,0.1),
            batteryTemperature: this.get2ByteUDouble(message, 5,0.01)
        };
    }
}
/**
 * FluidLevel
 */
class PGN127505_FluidLevel extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        const b = this.getByte(message,0)
        return {
            pgn: 127505,
            message: "FluidLevel",
            instance: b&0x0f,
            fluidType: (b>>4)&0x0f,
            fluidLevel: this.get2ByteDouble(message, 1,0.004),
            fluidCapacity: this.get4ByteUDouble(message, 3,0.1)
        };
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