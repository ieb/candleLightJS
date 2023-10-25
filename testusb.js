const usb = require('usb');
const { GSUsb } = require('./gs_usb.js');

// https://github.com/jxltom/gs_usb/tree/master/gs_usb
// /Users/ieb/timefields/candelLite/gs_usb



const webusb = new usb.WebUSB({
    allowAllDevices: true
});


const showDevices = async () => {
    const devices = await webusb.getDevices();
    console.log("USB Devices",devices);
    const text = devices.map(d => `${d.vendorId}\t${d.productId}\t${d.serialNumber || '<no serial>'}`);
    text.unshift('VID\tPID\tSerial\n-------------------------------------');

    console.log("USB Devices ",text.join('\n'));
};


showDevices().then( async () => {
    console.log("Done");


  try {
    console.log(GSUsb);
    const gs_usb = new GSUsb();
    await gs_usb.start();
    console.log("Started GS USB");
    await gs_usb.stop();
    console.log("Stopped GS USB");
  } catch (err) {
    console.log("oops",err);
    // No device was selected.
  }
});