const express = require('express');
const router = express.Router();
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const fetch = require('node-fetch');
// const queryString = require('query-string');
// const axios = require('axios');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = './token.json';
const googleConfig = {
    client_id: '1069743135615-ae2eo4fjifbb9j7sgs5icbvg85l5jdta.apps.googleusercontent.com',
    client_secret: '-60o9ua9_zjFvtF3R2Fr4C-Y',
    redirect: 'http://localhost:3000/user/callback', // this must match your google api settings
};

let access_token = '';
let mobile = '';
let client;
router.get('/auth', (req, res, next) => {
    mobile = req.query.mobile;
    client = createConnection();
    res.status(200).json({
        message: client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: SCOPES
        })
    });
});

router.get('/callback', async (req, res, next) => {
    console.log(req.query.code);
    const { code } = req.query;
    console.log(access_token);
    client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        client.setCredentials(token);
        listEvents(client);
        res.status(200).json({
            message: token
        });
    });
});

// router.post('/test', (req, res, next) => {
//     // Load client secrets from a local file.
//     fs.readFile('./credentials.json', (err, content) => {
//         if (err) return console.log('Error loading client secret file:', err);
//         // Authorize a client with credentials, then call the Google Calendar API.
//         authorize(JSON.parse(content), listEvents);
//     });
//     res.status(200).json({
//         message: 'Hello2'
//     });
// });




/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
    if (!callback) {
        return oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: SCOPES
        });
    }
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            if (callback) {
                callback(oAuth2Client);
            }
        });
    });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
    const calendar = google.calendar({ version: 'v3', auth });
    const minTime = new Date();
    minTime.setHours(0, 0, 0, 0);
    //   minTime.setDate(minTime.getDate()-1)
    const maxTime = new Date();
    maxTime.setHours(23, 59, 59, 0);
    let message = '';

    calendar.events.list({
        calendarId: 'primary',
        timeMin: minTime.toISOString(),
        timeMax: maxTime.toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const events = res.data.items;
        if (events.length) {
            events.map((event, i) => {
                const start = event.start.dateTime || event.start.date;
                message = message + `${start} - ${event.summary}\n`;
            });
        } else {
            message = 'No upcoming events found.';
        }
        const data = {
            'source': 'ShoutDEMO',
            'destinations': [mobile],
            'content': {
                'sms': message
            },
            'transports': ['sms']
        };
        fetch('http://mi:8290/api/messages', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(resp => resp.json())
            .then(data => console.log(data))
            .catch(e => console.error(e));
    });


    return message;
}

function createConnection() {
    return new google.auth.OAuth2(
        googleConfig.client_id,
        googleConfig.client_secret,
        googleConfig.redirect,
    );
}
module.exports = router;