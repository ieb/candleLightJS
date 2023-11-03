"use strict";

const process = require('node:process');
const usb = require('usb');
const { GSUsb } = require('./gsusb.js');
const { NMEA2000MessageDecoder } = require('./messages_decoder.js');
const readline = require('readline');
// https://github.com/jxltom/gs_usb/tree/master/gs_usb
// /Users/ieb/timefields/candelLite/gs_usb


require('./messages_iso.js').register(NMEA2000MessageDecoder.messages)
require('./messages_engine.js').register(NMEA2000MessageDecoder.messages)
require('./messages_nav.js').register(NMEA2000MessageDecoder.messages)


const webusb = new usb.WebUSB({
    allowAllDevices: true
});


const showDevices = async () => {
    const devices = await webusb.getDevices();
    const text = devices.map(d => `${d.vendorId}\t${d.productId}\t${d.serialNumber || '<no serial>'}\t${d.productName}`);
    text.unshift('VID\tPID\tSerial\tProductName\n-------------------------------------');

    console.log("USB Devices ",text.join('\n'));
};


showDevices().then( async () => {
    console.log("Done");


  try {
    const gs_usb = new GSUsb();
    await gs_usb.start(250000, GSUsb.GS_DEVICE_FLAGS.hwTimeStamp);
    console.log("Started GS USB");

    const messageDecoder = new NMEA2000MessageDecoder();
    gs_usb.on("frame", (frame) => {
        const message = messageDecoder.decode(frame);
        if ( message !== undefined ) {
            console.log(JSON.stringify(message));
        }
    });
    gs_usb.startStreamingCANFrmes();

    const shutdown = async () => {
        await gs_usb.stopStreamingCANFrames();
        await gs_usb.stop();
    };
    process.on('exit', async (code) => {
        console.log("Got exit");
        await shutdown();
        console.log("Finished exit");
        process.exit();
    });
    process.on('SIGTERM', async (code) => {
        console.log("Got term");
        await shutdown();
        console.log("Finished term");
        process.exit();
    });

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true)

    process.stdin.on('keypress', async (str, key) => {
        console.log("Pressed ",key);
         if (key.ctrl && key.name === 'c') {
            console.log("shutdown requested ");
            await shutdown();
            process.exit();
        } else {
            console.log("Press ^C to exit, not ",key);
        }
    });
  } catch (err) {
    console.log("oops",err);
    // No device was selected.
  }
});