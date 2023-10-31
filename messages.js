"use strict";

const messages = {};

class NMEA2000MessageDecoder {
    static decode(frame) {
        if ( messages[frame.messageHeader.pgn] ) {

            return new messages[frame.messageHeader.pgn](frame.messageHeader, frame.data);
        } else {
            console.log("PGN Not found ", frame.messageHeader.pgn);
        }
    }
}

class PGN60928 {
    constructor(frame) {

    }    
}

class PGN127489 {
    constructor(frame) {

    }
}
class PGN127488 {
    constructor(frame) {

    }
}
class PGN130312 {
    constructor(frame) {

    }
}
class PGN127508 {
    constructor(frame) {

    }
}
class PGN127505 {
    constructor(frame) {

    }
}

messages[60928] = PGN60928;
messages[127489] = PGN127489;
messages[127488] = PGN127488;
messages[130312] = PGN130312;
messages[127508] = PGN127508;
messages[127505] = PGN127505;





module.exports =  { 
    NMEA2000MessageDecoder
};