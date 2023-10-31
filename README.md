# CandleLightJS

A Javascript library to interact directly with USB devices implementing the gs_usb interface without the need for linux kernel support.

The library uses the WebAPI BLE support so should work in Chrome and other browsers although it is being developed to be used in an Electron app running in the nodejs process.

Developing this was made infinitely easier by reading the following git repos.

* https://github.com/candle-usb/candleLight_fw (Firmware)
* https://github.com/node-usb/node-usb (libusb interface exposing WebUSB APIs)
* https://github.com/jxltom/gs_usb (Python)
* https://github.com/HubertD/cangaroo (C++ client code)


# Why ?

CandleLight and other near copies have become a low cost, low power, widely available interface to CAN Bus 
networks. However, unfortunately the gs_usb driver is normally only available on Linux installs with limited or
no support in OSX, and certainly nothing in ChromeOS. This JS library makes it possible to write tools and
visualizations in webpages and apps that interface directly to the CAN Bus, including NMEA2000 marine networks
without needing to write additional firmware or create hardware. Primary target platform is Chromebooks, but
almost every other OS should also work. Previously the approach was to buy an expensive commercial NMEA2000->
Serial converter ($200) or build something based on a ESP32 or Arduino.


# TODO

* [x] Prove interfacing with a USB device is possible from JS
* [ ] Fix bug where the USB has to be unplugged to reset after each use.
* [ ] Implement working API
* [ ] Implement Frame handling for listen only.
* [ ] Implement base level CAN node support... may not be possible.
* [ ] Implement CAN message filtering.


# Notes.

To use a endpoint it must first be claimed. If not there is a NOT_FOUND error

The firmware requires all settings including bitrate are set before the CAN device is started, this because the FW sets internal state which is then transferred into registers by the can_start call. It also allows
them to be set later, with no effect.

If the devices is opened listen only it wont send any ACK messages and so if its the only other device on a bus
it will receive messages that are no acked repeatedly.


In order to close  the device, transfers must be cancelled. There is no cancel in the WebUSB API that works. So
the transfers are started with a timeout of 500ms to allow them to timeout when before close.

At present the firmware doesn't shutdown correctly and the output list overflows causing the firmware to lock solid for receive requiring a power cycle before it can restart. A fix is required in the JS or FW code. not sure.

Have found the candleLight_fw can be rebuilt and re flashed over dfu using https://github.com/candle-usb/candleLight_fw which allows additional request IDs to be added for debugging and feedback. 