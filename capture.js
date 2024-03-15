"use strict";

const process = require('node:process');
const usb = require('usb');
const { GSUsb } = require('./lib/gsusb.js');
const readline = require('readline');
const { CanRecorder } = require('./lib/canlog.js');


if ( process.argv.length !== 3) {
    console.log("Usage: node capture.js <logfile>");
    console.log("Will write a log file containing frames from a gs_usb device");
    process.exit();
}

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
    const canRecoder = new CanRecorder();


    const status = await gs_usb.start(250000, GSUsb.GS_DEVICE_FLAGS.hwTimeStamp);
    if ( !status.ok ) {
        console.log("Failed to find gsusb device", status);
        return;
    }
    console.log("Started GS USB");
    console.log("Opening File ", process.argv[2]);
    canRecoder.open(process.argv[2]);

    gs_usb.on("frame", (frame) => {
        canRecoder.write(frame);
    });    
    gs_usb.startStreamingCANFrames();

    const shutdown = async () => {
        canRecoder.close();
        await gs_usb.stop();
    };
    // eslint-disable-next-line no-unused-vars
    process.on('exit', async (code) => {

        console.log("Got exit");
        await shutdown();
        console.log("Finished exit");
        process.exit();
    });
    // eslint-disable-next-line no-unused-vars
    process.on('SIGTERM', async (code) => {
        console.log("Got term");
        await shutdown();
        console.log("Finished term");
        process.exit();
    });


    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

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