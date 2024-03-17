"use strict";
const { CANMessage } = require('./messages_decoder.js');



/*ISO Address Claim

typedef union {
  uint64_t name;
  struct {
    uint32_t unicNumberAndManCode; // ManufacturerCode 11 bits , UniqueNumber 21 bits
    unsigned char deviceInstance; // indentifies multiple idendical devices on the same bus, eg 2 engine controllers.
    unsigned char deviceFunction; // http://www.nmea.org/Assets/20120726%20nmea%202000%20class%20&%20function%20codes%20v%202.00.pdf
    unsigned char deviceClass; // http://www.nmea.org/Assets/20120726%20nmea%202000%20class%20&%20function%20codes%20v%202.00.pdf
  // I found document: http://www.novatel.com/assets/Documents/Bulletins/apn050.pdf it says about next fields:
  // The System Instance Field can be utilized to facilitate multiple NMEA 2000 networks on these larger marine platforms.
  // NMEA 2000 devices behind a bridge, router, gateway, or as part of some network segment could all indicate this by use
  // and application of the System Instance Field.
  // DeviceInstance and SystemInstance fields can be now changed by function SetDeviceInformationInstances or
  // by NMEA 2000 group function. Group function handling is build in the library.
    unsigned char industryGroupAndSystemInstance; // 4 bits each
  };
} tUnionDeviceInformation;

*/

class PGN60928_IsoAddressClaim  extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
        const codeAndManNumber = message.data.getUint32(0, true);
        const industryGroupAndSystemInstance = message.data.getUint8(7);
        return {
            pgn: 60928,
            message: "IsoAddressClaim",
            manufacturerCode: (codeAndManNumber>>21)&0x07ff, // top 11 bits
            uniqueNumber: (codeAndManNumber)&0x1fffff, // lower 21 bits
            deviceInstance: message.data.getUint8(4),
            deviceFunction: message.data.getUint8(5),
            deviceClass: message.data.getUint8(6),
            industryGroup: (industryGroupAndSystemInstance>>4)&0x0f,
            systemInstance: (industryGroupAndSystemInstance)&0x0f
        }
    }    
    toMessage(pgnObj) {
        if (pgnObj.pgn === 60928) {
            const data = new DataView(new ArrayBuffer(8));
            this.setUint32(data, 0, ((pgnObj.manufacturerCode&0x07ff)<<21)
                                    | (pgnObj.uniqueNumber&0x1fffff));
            this.setByte(data, 4, pgnObj.deviceInstance);
            this.setByte(data, 5, pgnObj.deviceFunction);
            this.setByte(data, 6, pgnObj.deviceClass);
            this.setByte(data, 7, ((pgnObj.industryGroup&0x0f)<<4
                                    | (pgnObj.systemInstance&0x0f) ));
            return {
                priority: 6,
                type: "extended",
                pgn: 60928,
                data
            }
        }
    }

}
class PGN126993_HeartBeat  extends CANMessage {
    constructor() {
        super();
    }
    fromMessage(message) {
       return {
            pgn: 126993,
            message: "Heartbeat"
        }
    }
    toMessage(pgnObj) {
        const data = new DataView(new ArrayBuffer(8));
        this.setUint32(data, 0, 0xffffffff);
        this.setUint32(data, 0, 0xffffffff);
        return {
                priority: 6,
                type: "extended",
                pgn: 126993,
                data
        }
    }

}


126993
const register = (pgnRegistry) => {
    pgnRegistry[60928] = new PGN60928_IsoAddressClaim();
    pgnRegistry[126993] = new PGN126993_HeartBeat();

}



module.exports =  { 
    register
};