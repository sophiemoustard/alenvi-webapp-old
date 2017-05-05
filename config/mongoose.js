"use strict";

const mongoose  = require('mongoose');
const db        = require('./database');

mongoose.Promise = require('bluebird');
mongoose.connect(db.database);

// When successfully connected
mongoose.connection.on('connected', function() {
    console.log('Mongoose default connection open :)');
});

// If the connection throws an error
mongoose.connection.on('error', function(err) {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function() {
    console.log('Mongoose default connection disconnected');
});

// Models
require('../models/User');
