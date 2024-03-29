"use strict";

const process = require('node:process');
const usb = require('usb');
const { GSUsb } = require('./lib/gsusb.js');
const { NMEA2000MessageDecoder } = require('./lib/messages_decoder.js');
const readline = require('readline');
const fs = require('node:fs/promises');

// https://github.com/jxltom/gs_usb/tree/master/gs_usb
// /Users/ieb/timefields/candelLite/gs_usb


require('./lib/messages_iso.js').register(NMEA2000MessageDecoder.messages)
require('./lib/messages_engine.js').register(NMEA2000MessageDecoder.messages)
require('./lib/messages_nav.js').register(NMEA2000MessageDecoder.messages)


const webusb = new usb.WebUSB({
    allowAllDevices: true
});

if ( process.argv.length !== 2 ) {
    console.log("Usage: node candump.js");
    console.log("Dumps the can bus as processed json messages");
    process.exit();    
}

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


    const status = await gs_usb.start(250000, GSUsb.GS_DEVICE_FLAGS.hwTimeStamp);
    if ( !status.ok ) {
        console.log("Failed to find gsusb device", status);
        return;
    }
    console.log("Started GS USB");
    // should only get RapidEngineData
    const filtersIn = {
        sourceFilter: [],
        destinationFilter: [],
        pgnFilter: [
            126992, // System time
            127250, // Heading
            127257, // attitude
            127258, // variation
            128259, // speed
            128267, // depth
            128275, // log
            129029, // GNSS
            129026, // sog cog rapid
            129283, // XTE
            130306, // wind
            127506, // DC Status
            127508, // DC Bat status
            130312, // temp
            130316, // ext temp
            127505, // fluid level
            127489, // Engine Dynamic params
            127488, // Engine Rapiod
            130314, // pressure
            127245, // rudder
            130310, // outside enviromental parameters.
            130311,  // parameters also
            130313,   // humidity,
            130315   // set pressure
        ]
    };
    filtersIn.pgnFilter = [];

    await gs_usb.setupDeviceFilters(filtersIn);

    const filters = await gs_usb.getDeviceFilters();
    console.log("Filters are ", filters);

    const messageDecoder = new NMEA2000MessageDecoder();
    gs_usb.on("frame", (frame) => {
        const message = messageDecoder.decode(frame);
        if ( message !== undefined ) {
            console.log(JSON.stringify(message));
        }
    });

    const storedMetrics = {
        counters: {},
        prev: {},
        diff: {}
    };
    const metricsFile = `metrics.${Date.now()}.log`;

    const metricsLogger = setInterval( async () => {
        const metrics = await gs_usb.readMetrics();
        if ( metrics ) {
            for (var k in metrics ) {
                if ( storedMetrics.counters[k] === undefined) {
                    storedMetrics.prev[k] = 0;
                    storedMetrics.counters[k] = metrics[k];
                } else {
                    storedMetrics.prev[k] = storedMetrics.counters[k];
                    storedMetrics.counters[k] = metrics[k];
                }
                storedMetrics.diff[k] = storedMetrics.counters[k] -  storedMetrics.prev[k];
                if ( storedMetrics.diff[k] < 0 ) {
                    storedMetrics.diff[k] = storedMetrics.diff[k] + 65535;
                }
            }
        }
        await fs.writeFile(metricsFile, (JSON.stringify(storedMetrics.diff))+"\n", { flag: "a"});
    }, 500);

    await gs_usb.startPolling();

    //gs_usb.startStreamingCANFrames();


    const shutdown = async () => {
        await gs_usb.stopPolling();
        await gs_usb.stop();
        clearInterval(metricsLogger);
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