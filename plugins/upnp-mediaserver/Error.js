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
