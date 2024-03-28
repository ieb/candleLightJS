# CandleLightJS

A Javascript library to interact directly with USB devices implementing the gs_usb interface without the need for linux kernel support.

The library uses the WebAPI USB support so should work in Chrome and other browsers although it is being developed to be used in an Electron app running in the nodejs process.

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

# Library Usage

The user space driver is exposed as a class GSUsb. It will stream out raw frames that can be fed into decoders.

Usage see candump.js


# Commands

Dump the can data stream as json messages.

    node candump.js

Capture the can data stream as 24byte frames with a timestamp

    node capture.js <logfile.txt>

Convert messages back into 24 byte frames.

    node convert.js <messages.txt> <logfile.txt>

List available USB devices on the current platform that user space can access, some platforms (ChromOS penguine) may not expose all.

    node listusb.js

Playback a log file containing 24 byte frames

    node playback.js <logfile.txt>


# TODO

* [x] Prove interfacing with a USB device is possible from JS
* [x] Fix bug where the USB has to be unplugged to reset after each use.
* [x] Implement working API
* [x] Implement Frame handling for listen only.
* [x] Implement base level CAN node support (ACK only at this time.)
* [x] Implement CAN message filtering at the USB host.
* [x] Implement NMEA2000 message decoding.
* [x] Implement fast packet support.
* [x] Implement message filtering in the firmware.
* [x] Implement candump and playback to capture and playback raw packets in gs_host format. (timestamp + 24 bytes)
* [x] Fix conversion from message -> candump format, currently packets contain the wrong data.
* [x] Switch to using libusb endpoint polling rather than recursively calling the transferIn mechanism. The approach is effectively the same except using libusb endpoint polling makes use of threads inside libusb to handle the usb interface which results in lower CPU load as the bandwidth increases. For low CANBus traffic levels it probably doesnt matter. Testing on  macOS the node process drops from about 10% CPU to 2% CPU.



# Notes.

To use a endpoint it must first be claimed. If not there is a NOT_FOUND error

The firmware requires all settings including bitrate are set before the CAN device is started, this because the FW sets internal state which is then transferred into registers by the can_start call. It also allows
them to be set later, with no effect.

If the devices is opened listen only it wont send any ACK messages and so if its the only other device on a bus
it will receive messages that are no acked repeatedly.


In order to close  the device, transfers must be cancelled. There is no cancel in the WebUSB API that works. So
the transfers are started with a timeout of 500ms to allow them to timeout when before close.

As soon as transfers are cancelled the CAN interface must be stopped to prevent internal buffers in the device overflowing and corrupting the device.

Have found the candleLight_fw can be rebuilt and re flashed over dfu using https://github.com/candle-usb/candleLight_fw which allows additional request IDs to be added for debugging and feedback. 

# CAN Filtering. 

## Hardware filtering

The STM32F07xx chips have 28 can filters that can be confgured to filter messages in the hardware. Candlelight firmware doesnt support setting CAN filters and there is no gs_usb support for setting filters.

If filtering can messages in hardware is to be done, we could filter by source address so that we
only recieve messages from devices of interst, but the source addresses change and renegotiated.
Hence filtering by source ID would have to be performed without restarting the can hardware. 
(TODO, find out if this is possible)

https://www.st.com/content/ccc/resource/technical/document/reference_manual/3d/6d/5a/66/b4/99/40/d4/DM00031020.pdf/files/DM00031020.pdf/jcr:content/translations/en.DM00031020.pdf
32.4.1 page 1080 states filters can be initialised outside can hardware initialisation mode which implies filter can be set after the can hardware becomes active, but can recpetion is disabled when this happens.

So filtering dynamically based on source ID or frequent messages is a possibility.


The other approach is a static filter. PGNs are defined in bits 16-24 (inclusive, shifted 8 bits, lower 8 bits 0) for PDU format 1 and and 8-24 (inclusive, no shift) for PDU2.
eg

PDU1 can ID mask   0x01FF0000  where   FF is < 240 ie < 0xF0. PDU to Can ID is << 8
PDU2 can ID mask   0x01FFFF00  PDU is 1FFFF

pdu 126992 == 0x1F010, can ID == 0x-1F010--

Below is listed some examples of PGNs and the bit patterns.

65359   0b1111111101001111 PDU2  Raymarine Seatalk Pilot Heading
65379   0b1111111101100011 PDU2  Raymarine Seatalk Pilot Heading 2
65384   0b1111111101101000 PDU2  Raymarine Seatalk Pilot Heading 3
60928   0b1110111000000000 PDU1  IsoAddressClaim

126983 anything lower than this is not of interest.
0x1F000-0x1FEFF is of interest, but volume of traffic is in this range.

Can filter to remove proprietary messages and remove upper range messages.
accept Mask 0xFF000 match 0x1F---
reject Mask 0xFFF00 match 0x1FF--
reject Mask 0xFFFFF match 0x1F80E
reject Mask 0xFFFFF match 0x1F80F
reject Mask 0xFFFFF match 0x1F810
reject Mask 0xFFFFF match 0x1F811





higher than 130816 (0x1FEFF ) not of interest 



127488 0b11111001000010010 PDU2 Y  RapidEngineData
127489 0b11111001000000001 PDU2 Y  EngineDynamicParam
126720 0b11110111100000000 PDU1   Raymarine Proprietary Backlight
126992 0b11111000000010000 PDU2 Y  N2K System Time
127237 0b11111000100000101 PDU2   Raymarine Proprietary Heading Track Control
127245 0b11111000100001101 PDU2 Y  N2K Rudder
127250 0b11111000100010010 PDU2 Y  N2K Heading
127251 0b11111000100010011 PDU2   N2K Rate of Turn
127257 0b11111000100011001 PDU2 Y N2K Attitude
127258 0b11111000100011010 PDU2 Y N2K Magnetic Variation
127505 0b11111001000000000 PDU2 Y Fluid Level
127506 0b11111001000010010 PDU2 Y N2K DC Status
127508 0b11111001000010100 PDU2 Y DCBatteryStatus
128259 0b11111010100000011 PDU2 Y N2K Speed
128267 0b11111010100001011 PDU2 Y N2K Water Depth
128275 0b11111010100010011 PDU2 Y N2K Distance Log
129026 0b11111100000000010 PDU2 Y N2K COG SOG Rapid
129029 0b11111100000000101 PDU2 Y N2K GNSS
129038 0b11111100000001110 PDU2   AIS Class A Position Report
129039 0b11111100000001111 PDU2   AIS Class B Position Report
129040 0b11111100000010000 PDU2   AIS Class B Extended Position Repor
129041 0b11111100000010001 PDU2   AIS Aids to Navigation (AtoN) Report

129283 0b11111100100000011 PDU2 Y N2K Cross Track Error
130306 0b11111110100000010 PDU2 Y N2K Wind
130310 0b11111110100000110 PDU2 Y N2K Outside Environment Parameters
130311 0b11111110100000111 PDU2 Y N2K Environment Parameters
130312 0b11111110100001000 PDU2 Y Temperature
130313 0b11111110100001001 PDU2   N2K Humidity
130314 0b11111110100001010 PDU2 Y N2K Pressure
130315 0b11111110100001011 PDU2   N2K Set Pressure
130316 0b11111110100001100 PDU2 Y N2K Temperature Extended
130916 0b11111111101100100 PDU2  Raymarine Proprietary unknown

No real patterns are availabe other than perhaps the data bit (24) not set.
Probably the best way of using filters is to reject the high volume PGNs that are not wanted and would swamp the processing power of the chip. Process the remainder though an code level filter.
Could also reject messages that are not broadcast messages. 


## Software filtering

Process the CAN ID and filter on it. 

See GSUsb.setupFilters

Requires custom Firmware see my candleLight_fw see https://github.com/ieb/candleLight_fw/tree/withFilters

Allows upto 20 filters on pgn, source, and destination. There must be 1 match from each class of filter for the message to be accepted.  if destination 0xff is defined and pgn 60928, then only broadcast ISORequests CAN packets will be sent to the USB host.


# Device shutdown - Darwin/OSX

On Darwin, it seems, if the kernel usb layer gets into a halt state, then the halt must be cleared followed 
by a reset of the device, but using the webusb/node/libusb stack this seems impossible. The result is that 
the kernel gets stuck with a stack of pending transfers, allocated memory blocks. It permanently tells the 
USB device it cant accept any more transfers in, and the device runs out of transfer buffers at which point 
it drops frames. The leds on the candleLight got fixed on. The only way to fix this is to power cycle the USB 
to reset the darwin kernel for the device.  

Or, to disble the can hardware and drain messages from the kernel so that it does not go into a hung state. Thats what the code does now.

This seems to be a feature of darwin. libusb documentation mentiones it. May not happen on other os's. libusb 
indicates it is possible to avoid, but not via WebUSB calls..... and trying resulted in segfaults.

Switching to performing the polling inside libusb has made this area more reliable and the JS code is simpler.

