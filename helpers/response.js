"use strict";

module.exports = {
    success: function(res, message, data) {
        res.json({
            success: true,
            msg: message,
            data: data
        });
    },
    error: function(res, statusCode, message) {
        res.status(statusCode).json({
            success: false,
            msg: message
        });
    }
};
