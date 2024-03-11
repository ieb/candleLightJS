"use strict";
const { FastPacketHandler } = require('./fastpacket.js');


class NMEA2000MessageDecoder {

    static messages = {};
    constructor() {
        console.log(FastPacketHandler);
        this.fastPacketHandler = new FastPacketHandler();
    }

    decode(frame) {
        if ( frame.frameType !== "extended" ) {
            console.log("Not decoding frame, not extended type");
        } else if ( NMEA2000MessageDecoder.messages[frame.messageHeader.pgn] ) {
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

    get1ByteInt(message, byteOffset) {
        if ( message.data.byteLength < byteOffset+1) {
            return 0x00;
        }
        return message.data.getInt8(byteOffset);
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
            2: { id: 2, name:"??"},
            3: { id: 3, name:"??"},
        },
        "windReference": {
            0:  { id: 0, name:"True Ground"},
            1:  { id: 1, name:"Magnetic Ground"},
            2:  { id: 2, name:"Apparent"},
            3:  { id: 3, name:"True Boat"},
            4:  { id: 4, name:"True Water"},
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
            132: { id: 15, name:"Shaft Seal Temperature"},
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
            6: { id: 6, name:"??"},
            7: { id: 7, name:"??"},
        },
        "turnMode": {
            0: { id: 0, name:"Rudder limit controlled"},
            1: { id: 1, name:"Turn rate controlled"},
            2: { id: 2, name:"Radius controlled"},
            3: { id: 3, name:"??"},
            4: { id: 4, name:"??"},
            5: { id: 5, name:"??"},
            6: { id: 6, name:"??"},
            7: { id: 7, name:"??"},
        },
        "directionReference": {
            0: { id: 0, name:"True"},
            1: { id: 1, name:"Magnetic"},
            2: { id: 2, name:"Error"},
            3: { id: 3, name:"??"},
        },
        "directionRudder": {
            0: { id: 0, name:"No Order"},
            1: { id: 1, name:"Move to starboard"},
            2: { id: 2, name:"Move to port"},
            3: { id: 3, name:"??"},
            4: { id: 4, name:"??"},
            5: { id: 5, name:"??"},
            6: { id: 6, name:"??"},
            7: { id: 7, name:"??"},
        },
        "tankType": {
            0: { id: 0, name:"Fuel"},
            1: { id: 1, name:"Water"},
            2: { id: 2, name:"Gray water"},
            3: { id: 3, name:"Live well"},
            4: { id: 4, name:"Oil"},
            5: { id: 5, name:"Black water"},
        },
        "manufacturerCode": {
            69: { id: 69, name:"ARKS Enterprises, Inc." },
            78: { id: 78, name:"FW Murphy/Enovation Controls" },
            80: { id: 80, name:"Twin Disc" },
            85: { id: 85, name:"Kohler Power Systems" },
            88: { id: 88, name:"Hemisphere GPS Inc" },
            116: { id: 116, name:"BEP Marine" },
            135: { id: 135, name:"Airmar" },
            137: { id: 137, name:"Maretron" },
            140: { id: 140, name:"Lowrance" },
            144: { id: 144, name:"Mercury Marine" },
            147: { id: 147, name:"Nautibus Electronic GmbH" },
            148: { id: 148, name:"Blue Water Data" },
            154: { id: 154, name:"Westerbeke" },
            161: { id: 161, name:"Offshore Systems (UK) Ltd." },
            163: { id: 163, name:"Evinrude/BRP" },
            165: { id: 165, name:"CPAC Systems AB" },
            168: { id: 168, name:"Xantrex Technology Inc." },
            172: { id: 172, name:"Yanmar Marine" },
            174: { id: 174, name:"Volvo Penta" },
            175: { id: 175, name:"Honda Marine" },
            176: { id: 176, name:"Carling Technologies Inc. (Moritz Aerospace)" },
            185: { id: 185, name:"Beede Instruments" },
            192: { id: 192, name:"Floscan Instrument Co. Inc." },
            193: { id: 193, name:"Nobletec" },
            198: { id: 198, name:"Mystic Valley Communications" },
            199: { id: 199, name:"Actia" },
            200: { id: 200, name:"Honda Marine" },
            201: { id: 201, name:"Disenos Y Technologia" },
            211: { id: 211, name:"Digital Switching Systems" },
            215: { id: 215, name:"Xintex/Atena" },
            224: { id: 224, name:"EMMI NETWORK S.L." },
            225: { id: 225, name:"Honda Marine" },
            228: { id: 228, name:"ZF" },
            229: { id: 229, name:"Garmin" },
            233: { id: 233, name:"Yacht Monitoring Solutions" },
            235: { id: 235, name:"Sailormade Marine Telemetry/Tetra Technology LTD" },
            243: { id: 243, name:"Eride" },
            250: { id: 250, name:"Honda Marine" },
            257: { id: 257, name:"Honda Motor Company LTD" },
            272: { id: 272, name:"Groco" },
            273: { id: 273, name:"Actisense" },
            274: { id: 274, name:"Amphenol LTW Technology" },
            275: { id: 275, name:"Navico" },
            283: { id: 283, name:"Hamilton Jet" },
            285: { id: 285, name:"Sea Recovery" },
            286: { id: 286, name:"Coelmo SRL Italy" },
            295: { id: 295, name:"BEP Marine" },
            304: { id: 304, name:"Empir Bus" },
            305: { id: 305, name:"NovAtel" },
            306: { id: 306, name:"Sleipner Motor AS" },
            307: { id: 307, name:"MBW Technologies" },
            311: { id: 311, name:"Fischer Panda" },
            315: { id: 315, name:"ICOM" },
            328: { id: 328, name:"Qwerty" },
            329: { id: 329, name:"Dief" },
            341: { id: 341, name:"Böning Automationstechnologie GmbH & Co. KG" },
            345: { id: 345, name:"Korean Maritime University" },
            351: { id: 351, name:"Thrane and Thrane" },
            355: { id: 355, name:"Mastervolt" },
            356: { id: 356, name:"Fischer Panda Generators" },
            358: { id: 358, name:"Victron Energy" },
            370: { id: 370, name:"Rolls Royce Marine" },
            373: { id: 373, name:"Electronic Design" },
            374: { id: 374, name:"Northern Lights" },
            378: { id: 378, name:"Glendinning" },
            381: { id: 381, name:"B & G" },
            384: { id: 384, name:"Rose Point Navigation Systems" },
            385: { id: 385, name:"Johnson Outdoors Marine Electronics Inc Geonav" },
            394: { id: 394, name:"Capi 2" },
            396: { id: 396, name:"Beyond Measure" },
            400: { id: 400, name:"Livorsi Marine" },
            404: { id: 404, name:"ComNav" },
            409: { id: 409, name:"Chetco" },
            419: { id: 419, name:"Fusion Electronics" },
            421: { id: 421, name:"Standard Horizon" },
            422: { id: 422, name:"True Heading AB" },
            426: { id: 426, name:"Egersund Marine Electronics AS" },
            427: { id: 427, name:"em-trak Marine Electronics" },
            431: { id: 431, name:"Tohatsu Co, JP" },
            437: { id: 437, name:"Digital Yacht" },
            438: { id: 438, name:"Comar Systems Limited" },
            440: { id: 440, name:"Cummins" },
            443: { id: 443, name:"VDO (aka Continental-Corporation)" },
            451: { id: 451, name:"Parker Hannifin aka Village Marine Tech" },
            459: { id: 459, name:"Alltek Marine Electronics Corp" },
            460: { id: 460, name:"SAN GIORGIO S.E.I.N" },
            466: { id: 466, name:"Veethree Electronics & Marine" },
            467: { id: 467, name:"Humminbird Marine Electronics" },
            470: { id: 470, name:"SI-TEX Marine Electronics" },
            471: { id: 471, name:"Sea Cross Marine AB" },
            475: { id: 475, name:"GME aka Standard Communications Pty LTD" },
            476: { id: 476, name:"Humminbird Marine Electronics" },
            478: { id: 478, name:"Ocean Sat BV" },
            481: { id: 481, name:"Chetco Digitial Instruments" },
            493: { id: 493, name:"Watcheye" },
            499: { id: 499, name:"Lcj Capteurs" },
            502: { id: 502, name:"Attwood Marine" },
            503: { id: 503, name:"Naviop S.R.L." },
            504: { id: 504, name:"Vesper Marine Ltd" },
            510: { id: 510, name:"Marinesoft Co. LTD" },
            517: { id: 517, name:"NoLand Engineering" },
            518: { id: 518, name:"Transas USA" },
            529: { id: 529, name:"National Instruments Korea" },
            532: { id: 532, name:"Onwa Marine" },
            571: { id: 571, name:"Marinecraft (South Korea)" },
            573: { id: 573, name:"McMurdo Group aka Orolia LTD" },
            578: { id: 578, name:"Advansea" },
            579: { id: 579, name:"KVH" },
            580: { id: 580, name:"San Jose Technology" },
            583: { id: 583, name:"Yacht Control" },
            586: { id: 586, name:"Suzuki Motor Corporation" },
            591: { id: 591, name:"US Coast Guard" },
            595: { id: 595, name:"Ship Module aka Customware" },
            600: { id: 600, name:"Aquatic AV" },
            605: { id: 605, name:"Aventics GmbH" },
            606: { id: 606, name:"Intellian" },
            612: { id: 612, name:"SamwonIT" },
            614: { id: 614, name:"Arlt Tecnologies" },
            637: { id: 637, name:"Bavaria Yacts" },
            641: { id: 641, name:"Diverse Yacht Services" },
            644: { id: 644, name:"Wema U.S.A dba KUS" },
            645: { id: 645, name:"Garmin" },
            658: { id: 658, name:"Shenzhen Jiuzhou Himunication" },
            688: { id: 688, name:"Rockford Corp" },
            704: { id: 704, name:"JL Audio" },
            715: { id: 715, name:"Autonnic" },
            717: { id: 717, name:"Yacht Devices" },
            734: { id: 734, name:"REAP Systems" },
            735: { id: 735, name:"Au Electronics Group" },
            739: { id: 739, name:"LxNav" },
            743: { id: 743, name:"DaeMyung" },
            744: { id: 744, name:"Woosung" },
            773: { id: 773, name:"Clarion US" },
            776: { id: 776, name:"HMI Systems" },
            777: { id: 777, name:"Ocean Signal" },
            778: { id: 778, name:"Seekeeper" },
            781: { id: 781, name:"Poly Planar" },
            785: { id: 785, name:"Fischer Panda DE" },
            795: { id: 795, name:"Broyda Industries" },
            796: { id: 796, name:"Canadian Automotive" },
            797: { id: 797, name:"Tides Marine" },
            798: { id: 798, name:"Lumishore" },
            799: { id: 799, name:"Still Water Designs and Audio" },
            802: { id: 802, name:"BJ Technologies (Beneteau)" },
            803: { id: 803, name:"Gill Sensors" },
            811: { id: 811, name:"Blue Water Desalination" },
            815: { id: 815, name:"FLIR" },
            824: { id: 824, name:"Undheim Systems" },
            838: { id: 838, name:"TeamSurv" },
            844: { id: 844, name:"Fell Marine" },
            847: { id: 847, name:"Oceanvolt" },
            862: { id: 862, name:"Prospec" },
            868: { id: 868, name:"Data Panel Corp" },
            890: { id: 890, name:"L3 Technologies" },
            894: { id: 894, name:"Rhodan Marine Systems" },
            896: { id: 896, name:"Nexfour Solutions" },
            905: { id: 905, name:"ASA Electronics" },
            909: { id: 909, name:"Marines Co (South Korea)" },
            911: { id: 911, name:"Nautic-on" },
            930: { id: 930, name:"Ecotronix" },
            962: { id: 962, name:"Timbolier Industries" },
            963: { id: 963, name:"TJC Micro" },
            968: { id: 968, name:"Cox Powertrain" },
            969: { id: 969, name:"Blue Seas" },
            1850: { id: 1850, name:"Teleflex Marine (SeaStar Solutions)" },
            1851: { id: 1851, name:"Raymarine" },
            1852: { id: 1852, name:"Navionics" },
            1853: { id: 1853, name:"Japan Radio Co" },
            1854: { id: 1854, name:"Northstar Technologies" },
            1855: { id: 1855, name:"Furuno" },
            1856: { id: 1856, name:"Trimble" },
            1857: { id: 1857, name:"Simrad" },
            1858: { id: 1858, name:"Litton" },
            1859: { id: 1859, name:"Kvasar AB" },
            1860: { id: 1860, name:"MMP" },
            1861: { id: 1861, name:"Vector Cantech" },
            1862: { id: 1862, name:"Yamaha Marine" },
            1863: { id: 1863, name:"Faria Instruments" },
        },
        "industry": {
            0: { id: 0, name:"Global" },
            1: { id: 1, name:"Highway" },
            2: { id: 2, name:"Agriculture" },
            3: { id: 3, name:"Construction" },
            4: { id: 4, name:"Marine" },
            5: { id: 5, name:"Industrial" },
        },
        "seatalkPilotMode": {
            64: { id: 64, name:"Standby" },
            66: { id: 66, name:"Auto" },
            70: { id: 70, name:"Wind" },
            74: { id: 74, name:"Track" },
        },
        "seatalkKeystroke": {
            1: { id: 1, name:"Auto" },
            2: { id: 2, name:"Standby" },
            3: { id: 3, name:"Wind" },
            5: { id: 5, name:"-1" },
            6: { id: 6, name:"-10" },
            7: { id: 7, name:"+1" },
            8: { id: 8, name:"+10" },
            33: { id: 33, name:"-1 and -10" },
            34: { id: 34, name:"+1 and +10" },
            35: { id: 35, name:"Track" },
        },
        "seatalkDeviceId": {
            3: { id: 3, name:"S100" },
            5: { id: 5, name:"Course Computer" },
        },
        "seatalkNetworkGroup": {
            0: { id: 0, name:"None" },
            1: { id: 1, name:"Helm 1" },
            2: { id: 2, name:"Helm 2" },
            3: { id: 3, name:"Cockpit" },
            4: { id: 4, name:"Flybridge" },
            5: { id: 5, name:"Mast" },
            6: { id: 6, name:"Group 1" },
            7: { id: 7, name:"Group 2" },
            8: { id: 8, name:"Group 3" },
            9: { id: 9, name:"Group 4" },
            10: { id: 10, name:"Group 5" },
        },
        "seatalkDisplayColor": {
            0: { id: 0, name:"Day 1" },
            2: { id: 2, name:"Day 2" },
            3: { id: 3, name:"Red/Black" },
            4: { id: 4, name:"Inverse" },
        }
    };


    static lookup(name, value) { 
        if ( NMEA2000Reference.reference[name] && NMEA2000Reference.reference[name][value] ) {
            return NMEA2000Reference.reference[name][value];
        } else {
            if ( NMEA2000Reference.reference[name] === undefined ) {
                console.log("Lookup Invalid type ",name);
            } else if (  NMEA2000Reference.reference[name][value] === undefined ) {
                console.log("Lookup missing value",name, value);
            }
            return { type: name, id: value, name:"undefined" };
        }
    }
}

module.exports =  { 
    NMEA2000MessageDecoder,
    NMEA2000Reference,
    CANMessage
};