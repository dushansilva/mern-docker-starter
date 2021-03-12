const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const config = require('./config');

// const db = mongoose.connection;

// db.on('connecting', function () {
//     console.log('connecting to MongoDB...');
// });

// db.on('error', function (error) {
//     console.error('Error in MongoDb connection: ' + error);
//     mongoose.disconnect();
// });
// db.on('connected', function () {
//     console.log('MongoDB connected!');
// });
// db.once('open', function () {
//     console.log('MongoDB connection opened!');
// });
// db.on('reconnected', function () {
//     console.log('MongoDB reconnected!');
// });
// db.on('disconnected', function () {
//     console.log('MongoDB disconnected!');
// });

const isDevMode = process.env.NODE_ENV === 'development' || false;
const isProdMode = process.env.NODE_ENV === 'production' || false;

// let mongoUrl = config.MONGO_DOCKER_URL;
// if (isDevMode) {
//     mongoUrl = config.MONGO_LOCAL_URL;
// }
// mongoose.connect(mongoUrl, config.MONGO_OPTIONS)
//     .then(() => {
//         console.log('Connected to Database');
//     }).catch((err) => {
//         console.log('Not Connected to Database ERROR! ', err);
//     });
// mongoose.Promise = global.Promise;

// routes
const userRoutes = require('./api/routes/user');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//handling cross origin requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
        'Origin,X-Requested-With,Content-Type,Accept,Authorization');
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,PATCH,DELETE');
    next();
});

//middleware
app.use('/user', userRoutes);

//error handling
app.use((req, res, next) => {
    const error = Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;