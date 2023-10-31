const process = require('node:process');
const usb = require('usb');
const { GSUsb } = require('./index.js');
const readline = require('readline');
// https://github.com/jxltom/gs_usb/tree/master/gs_usb
// /Users/ieb/timefields/candelLite/gs_usb



const webusb = new usb.WebUSB({
    allowAllDevices: true
});


const checkState = async () => {
    const devices = await webusb.getDevices();
    const text = devices.map(d => `${d.vendorId}\t${d.productId}\t${d.serialNumber || '<no serial>'}`);
    text.unshift('VID\tPID\tSerial\n-------------------------------------');
    console.log("USB Devices ",text.join('\n'));

};


checkState().then( async () => {
  console.log("Done");


  try {
    console.log(GSUsb);
    const gs_usb = new GSUsb(GSUsb.GS_DEVICE_FLAGS.listenOnly);
    await gs_usb.checkDevice();



  } catch (err) {
    console.log("oops",err);
    // No device was selected.
  }
});