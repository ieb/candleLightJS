const usb = require('usb');
// https://github.com/jxltom/gs_usb/tree/master/gs_usb
// /Users/ieb/timefields/candelLite/gs_usb



// lists usb devices.

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

/*
  try {
    console.log(GSUsb);
    const gs_usb = new GSUsb(GSUsb.GS_DEVICE_FLAGS.listenOnly);
    await gs_usb.checkDevice();



  } catch (err) {
    console.log("oops",err);
    // No device was selected.
  }
  */
});