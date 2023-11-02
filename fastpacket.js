"use strict";

/**
 * Handles reconstructing frames into fast packets. It can handle multiple fast packet sources
 * provided the first frame received is frame 0. 
 */ 
class FastPacketHandler {
    constructor() {
        this.fastPackets = {};
        const gc = this.garbageCollect.bind(this);
        setInterval(gc, 30000);
    }

    /**
     * Perform periodic garbage collection to remove fast packets that were incomplete after 15s.
     */ 
    garbageCollect() {
        const t = Date.now();
        for(var k in this.fastPackets ) {
            if ( (t - this.fastPackets[k].created) > 15000 ) {
                console.log("Incomplete fast packet timed out ",k);
                delete this.fastPackets[k];
            }
        }
    }

    /**
     * Handle a fast packet, return the packet if complete, otherwise undefined.
     */ 
    handleFastPacket(frame) {
        const seq = frame.data.getUint8(0);
        const fastPacketSequence = frame.can_id+":"+((seq>>5)&0x07);
        const frameNo = seq&0x1f;
        let frameOffset = 1;
        let packetOffset = 0;
        if ( frameNo === 0 ) {
            const length = frame.data.getUint8(1);
            frameOffset++;
            if ( this.fastPackets[fastPacketSequence] !== undefined ) {
                console.log(`Fastpacket ${fastPacketSequence} was incomplete`);
            }
            this.fastPackets[fastPacketSequence] = {
                created: Date.now(),
                messageHeader: frame.messageHeader,
                length: length,
                recievedLength: 0,
                frameNo: 0,
                data: new DataView(new ArrayBuffer(length))
            };
        } else if ( this.fastPackets[fastPacketSequence] === undefined ) {
            console.log(`Fastpacket ${fastPacketSequence} no frame 0 received`);
            return undefined;
        } else {
            packetOffset = 6+(7*(frameNo-1));
        }
        const packet = this.fastPackets[fastPacketSequence];
        //console.log(`Fastpacket ${fastPacketSequence} len:${packet.length} frame:${frameNo}  frameLen:${frame.can_dlc} offset:${packetOffset}   `);
        while(packet.recievedLength<packet.length && frameOffset<frame.can_dlc) {
            packet.data.setUint8(packetOffset, frame.data.getUint8(frameOffset));
            packet.recievedLength++;
            frameOffset++;
            packetOffset++;
        }

        if (packet.recievedLength == packet.length) {
            // frame complete
            delete this.fastPackets[fastPacketSequence];
            return packet;
        } 
        // incomplete.
        return undefined;
    }

}

module.exports =  { 
    FastPacketHandler
};
