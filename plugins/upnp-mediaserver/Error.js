/**
 * Based on node-upnp-device:
 * Copyright (c) 2011 Jacob Rask, <http://jacobrask.net>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 */

const http = require('http');

// Use http module's `STATUS_CODES` static to get error messages.
class HttpError extends Error {
    constructor(code) {
        super();
        this.code = code;
        this.message = http.STATUS_CODES[code];
    }
}

// Error object with predefined UPnP SOAP error code-message combinations.
class SoapError extends Error {
    constructor(code) {
        super();
        const STATUS_CODES = {
            401: "Invalid Action",
            402: "Invalid Args",
            404: "Invalid Var",
            501: "Action Failed",
            600: "Argument Value Invalid",
            601: "Argument Value Out of Range",
            602: "Optional Action Not Implemented",
            604: "Human Intervention Required",
            701: "No Such Object",
            709: "Invalid Sort Criteria",
            710: "No such container"
        };
        this.code = code;
        this.message = STATUS_CODES[code];
    }
}

module.exports = {
    HttpError, SoapError
};
