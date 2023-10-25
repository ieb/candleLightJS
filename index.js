
// https://github.com/jxltom/gs_usb/blob/master/gs_usb/ used to inspiration (thank you!)
// https://github.com/woj76/gs_usb_leonardo/ has some insight into the firmware 
// also https://github.com/candle-usb/candleLight_fw/blob/master/src/usbd_gs_can.c

const usb = require('usb');

/*
usb.LIBUSB_RECIPIENT_DEVICE 0
usb.LIBUSB_RECIPIENT_INTERFACE 1
usb.LIBUSB_RECIPIENT_ENDPOINT 2
usb.LIBUSB_REQUEST_TYPE_STANDARD 0
usb.LIBUSB_REQUEST_TYPE_CLASS 20
usb.LIBUSB_REQUEST_TYPE_VENDOR 40

LIBUSB_ENDPOINT_OUT = 0x00,

LIBUSB_ENDPOINT_IN = 0x80



*/


class GSUsb {
    static GS_DEVICE_FLAGS = {
        normal: 0,
        listenOnly: 0x01,
        loopBack: 0x02,
        //tripleSample: 0x04, // notsupported
        oneShot: 0x08,
        hwTimeStamp: 0x10
        //identify: 0x20, // notsupported
        //userId: 0x40, // notsupported
        //padPackets:0x80, // notsupported
        //fdMode: 0x100  // not supported, and makes no sense ???
    }

    // Special address description flags for the CAN_ID
    static CAN_EFF_FLAG = 0x80000000  // EFF/SFF is set in the MSB
    static CAN_RTR_FLAG = 0x40000000  // remote transmission request
    static CAN_ERR_FLAG = 0x20000000  // error message frame

    // Valid bits in CAN ID for frame formats
    static CAN_SFF_MASK = 0x000007FF  // standard frame format (SFF)
    static CAN_EFF_MASK = 0x1FFFFFFF  // extended frame format (EFF)
    static CAN_ERR_MASK = 0x1FFFFFFF  // omit EFF, RTR, ERR flags

    static CAN_SFF_ID_BITS = 11
    static CAN_EFF_ID_BITS = 29

    // CAN payload length and DLC definitions according to ISO 11898-1
    static CAN_MAX_DLC = 8
    static CAN_MAX_DLEN = 8

    // CAN ID length
    static CAN_IDLEN = 4

    static GS_USB_DEVICES = [
        {  // gs_usb
            vendorId:0x1D50,
            productId: 0x606F
        },
        { // candelite
            vendorId:0x1209,
            productId: 0x606F
        },
        { //cesCanExtFd
            vendorId:0x1CD2,
            productId: 0x606F
        },
        { //abeCanDebuggerFd
            vendorId:0x16D0,
            productId: 0x10B8
        }
    ];

    static GS_CAN_MODE = {
        reset: 0,
        start: 1
    };


    static  _GS_USB_BREQ = {
        HOST_FORMAT: {
            request: 0, // read only, bit may not be implemented
            len: 4,
            read: true
        },
        BITTIMING: {
            request: 1, // probably write only
            len: 20,
            write: true
        },
        MODE: {
            request: 2, // probably write only
            len: 8,
            write: true
        },
        BERR: {
            request: 3, // probably not implemented
            len: undefined
        },
        BT_CONST: {
            request: 4, // read only
            len: 40,
            read: true
        },
        DEVICE_CONFIG: {
            request: 5, // readonly
            len: 12,
            read: true
        },
        TIMESTAMP: {
            request: 6, // readonly
            len: 4,
            read: true
        },
        IDENTIFY: {
            request: 7, // write only, flashes led
            len: 4,
            write: true
        },
        GET_USER_ID: {
            request: 8,    //not implemented
            len: undefined
        },
        SET_USER_ID: {
            request: 9,   //not implemented
            len: undefined
        },
        DATA_BITTIMING: {
            request: 10, // not implemented
            len: undefined
        },
        BT_CONST_EXT: { // not implemented
            request: 11,
            len: 72
        },
        SET_TERMINATION: {
            request: 12, // write only
            len:  4,
            write: true
        },
        GET_TERMINATION: {
            request: 13, // readonly
            len: 4,
            read: true
        },
        GET_STATE: {
            request: 14, // not implemented
            len: undefined
        }
    };


    constructor() {
        this.gs_usb = undefined;
        this.deviceCapability = undefined;
    }

    async start(flags) {
        const webusb = new usb.WebUSB({
            allowAllDevices: true
        });



        this.gs_usb = await webusb.requestDevice({ filters: GSUsb.GS_USB_DEVICES});
        console.log("Found  ",this.gs_usb);
        await this.gs_usb.open();
        await this.gs_usb.reset();
        this.capabilities = await this.readDeviceCapabilities();


        this.device_flags = (flags || 0) 
            &  this.capabilities.features
            & ( GSUsb.GS_DEVICE_FLAGS.listenOnly 
                | GSUsb.GS_DEVICE_FLAGS.loopBack 
                | GSUsb.GS_DEVICE_FLAGS.oneShot
                | GSUsb.GS_DEVICE_FLAGS.hwTimeStamp );



        // start the device
        const out = new DataView(new ArrayBuffer(8));
        // uint32 little endian
        out.setUint32(0,0x01, true); // start 
        out.setUint32(4,this.device_flags, true);


        const result = await this.gs_usb.controlTransferOut({
            requestType: 'vendor', // 0x40
            recipient: 'interface', // 0x01 ,, write 0x41
            request: 0x02, // mode request
            value: 0, // channel
            index: 0
        }, out.buffer);
        if ( result.status === "ok" ) {
            console.log("Started Ok");
        } else {
            console.log("Failed to start",result);
        }


        console.log("Closing device  ");

    }

    async stop() {

        // stop the device
        const out = new DataView(new ArrayBuffer(8));
        // uint32 little endian
        out.setUint32(0,0x00, true); // reset 
        out.setUint32(4,0x00, true); // no flags

        if ( await this._controlWrite(GSUsb._GS_USB_BREQ.MODE, out.buffer)) {
            console.log("Stopped Ok");
        } else {
            console.log("Failed to stop",result);
        }
        await this.gs_usb.close();
    }

    async identify(led) {
        const out = new DataView(new ArrayBuffer(4));
        out.setUint32(0,led);
        await this._controlWrite(GSUsb._GS_USB_BREQ.IDENTIFY, out.buffer);
    }

    async readDeviceCapabilities() {
        const data = await this._controlRead(GSUsb._GS_USB_BREQ.BT_CONST);
        if ( data != undefined ) {
            const capabilities = {
                features: data.getUint32(0,true),
                fclk_can: data.getUint32(4,true),
                tseg1_min: data.getUint32(8,true),
                tseg1_max: data.getUint32(12,true),
                tseg2_min: data.getUint32(16,true),
                tseg2_max: data.getUint32(20,true),
                sjw_max: data.getUint32(24,true),
                brp_min: data.getUint32(28,true),
                brp_max: data.getUint32(32,true),
                brp_inc: data.getUint32(36,true)
            }
            console.log("Got Capabilities ", capabilities);
            return capabilities;
        } else {
            console.log("Failed to get capabilities ", result);
            return undefined;
        }
    }


    async setBitrate(bitrate) {
        // only supporting 87.5 sample point
        // https://github.com/HubertD/cangaroo/blob/b4a9d6d8db7fe649444d835a76dbae5f7d82c12f/src/driver/CandleApiDriver/CandleApiInterface.cpp#L17-L112



        if (this.capabilities.fclk_can == 48000000) {
            const timing = {
                prop_seg: 1,
                phase_seg1:12,
                phase_seg2: 2,
                sjw: 1,
                brp: 300
            }
            switch(bitrate) {
                case 10000: timing.brp = 300; break;
                case 20000: timing.brp = 150; break;
                case 50000: timing.brp = 60; break; 
                case 83333: timing.brp = 36; break; 
                case 100000: timing.brp = 30; break; 
                case 125000: timing.brp = 24; break; 
                case 250000: timing.brp = 12; break; 
                case 500000: timing.brp = 6; break; 
                case 800000: 
                 timing.brp = 4; 
                 timing.phase_seg1 = 11;
                 break;
                case 1000000: timing.brp = 3; break;;
                default:
                    console.log("Bitrate not supported ",bitrate);
                    return false;
            }
            return await this.setTiming(timing);
        } else if (this.capabilities.fclk_can == 80000000) {
            const timing = {
                prop_seg: 1,
                phase_seg1:12,
                phase_seg2: 2,
                sjw: 1,
                brp: 300
            }
            switch(bitrate) {
                case 10000: timing.brp = 500; break;
                case 20000: timing.brp = 250; break;
                case 50000: timing.brp = 100; break;
                case 83333: timing.brp = 60; break; 
                case 100000: timing.brp = 50; break;
                case 125000: timing.brp = 40; break; 
                case 250000: timing.brp = 20; break;
                case 500000: timing.brp = 10; break;
                case 800000: 
                    timing.phase_seg1 = 7;
                    timing.phase_seg2 = 2;
                    timing.brp = 2;
                    break;
                case 1000000: timing.brp = 2; break;

                default:
                    console.log("Bitrate not supported ",bitrate);
                    return false;
            }
            return await this.setTiming(timing);
        } else {
            console.log("Device Clock not supported ",this.capabilities.fclk_can);
            return false;
        }
    }




    /**
     * https://github.com/candle-usb/candleLight_fw/blob/master/src/can.c#L63
     * seg = propagation segment
     * phaseSeg1 = phase segment 1
     * phaseSeg2 = phase segment 2
     * sjw = synchronisation segment
     * brp = precalar wher clock = 48Mhz, see this.capabilities.fclk_can to check, 
     * https://github.com/candle-usb/candleLight_fw/blob/master/src/usbd_gs_can.c#L227C14-L227C29
     * https://github.com/candle-usb/candleLight_fw/blob/master/include/config.h#L59
     * 
     * Message https://github.com/candle-usb/candleLight_fw/blob/master/include/gs_usb.h#L242
     */

    async setTiming(timing) {
        const out = new DataView(new ArrayBuffer(20));
        out.setUint32(0, timing.prop_seg, true);
        out.setUint32(4, timing.phase_seg1, true);
        out.setUint32(8, timing.phase_seg2, true);
        out.setUint32(12, timing.sjw, true);
        out.setUint32(16, timing.brp, true);

        if ( await this._controlWrite(GSUsb._GS_USB_BREQ.BITTIMING, out.buffer) ) {
            console.log("Set timing Ok");
            this.capabilities = await this.readDeviceCapabilities();
            return true;
        } else {
            console.log("Failed to set timing",result);
            return false;
        }
    }




    async getStartOfFrameTimestampUs() {
        const data = await this._controlRead(GSUsb._GS_USB_BREQ.TIMESTAMP);
        if (  data !== undefined ) {
            console.log("Got Frame TS info ", data.getUint32(0, true));
            return data.getUint32(0, true);
        } else {
            console.log("Failed to get Timestamp");
            return undefined;
        }
    }


    async _controlRead(req) {
        try {
            const result = await this.gs_usb.controlTransferIn({
                requestType: 'vendor', // 0x40
                recipient: 'interface', // 0x01 ,, write 0x41
                request: req.request, // identify mode
                value: 0,  // channel
                index: 0
            }, req.len);
            if ( result.status == "ok") {
                return result.data;
            } else {
                console.log("Failed to read data", req, result);
                return undefined;
            }
        } catch (e) {
            if ( req.read ) {
                console.log("Read failed, firmware bug perhaps ", e);
            } else {
                console.log("Read failed, read not supported ", e);
            }
            return undefined;                    
        }
    }
    async _controlWrite(req, buffer) {
        try {
            const result = await this.gs_usb.controlTransferOut({
                requestType: 'vendor', // 0x40
                recipient: 'interface', // 0x01 ,, write 0x41
                request: req.request, // mode request
                value: 0,  // channel
                index: 0
            }, buffer);
            if ( result.status === "ok" ) {
                return true;
            } else {
                console.log("Failed to write",result);
                return false;
            }
        } catch (e) {
            if ( req.write ) {
                console.log("Write failed, firmware bug perhaps ", e);
            } else {
                console.log("Write failed, read not supported ", e);
            }
            return undefined;                    
        }

    }

    getUSBDevice() {
        return this.gs_usb;
    }

    async getDeviceInfo() {
        const data = await this._controlRead(GSUsb._GS_USB_BREQ.DEVICE_CONFIG);
        if ( data != undefined ) {
            const deviceInfo = {
                reserved1: data.getUint8(0, true),
                reserved2: data.getUint8(1, true),
                reserved3: data.getUint8(2, true),
                icount: data.getUint8(3, true),
                fw_version: data.getUint32(4, true),
                hw_version: data.getUint32(8, true)
            }
            console.log("Got device info as ", deviceInfo);
            return deviceInfo;

        } else {
            console.log("Failed to get device info");
            return undefined;
        }
    }



}

module.exports =  { 
    GSUsb 
};