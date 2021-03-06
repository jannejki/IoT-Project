'use strict';
/** Express router providing user related routes
 * @module Routes
 * @requires express
 */
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const util = require('util');
const mqtt = require('mqtt');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const pbkdf2 = util.promisify(crypto.pbkdf2);
const app = express();
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const home = path.resolve(__dirname, '', "home.ejs");
const userpage = path.resolve(__dirname, '', "user.ejs");
const client = path.resolve(__dirname, '', "client.js");
const accounts = path.join(__dirname, "users/accounts.json");
const logs = path.join(__dirname, "users/usersLogins.json");
const database = path.join(__dirname, "fan_data/pressure.db");


app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');



//--------------------------------------------------------------------//
//-------------------------VARIABLES----------------------------------//
/**
 * Global variables
 * @module Variables
 */

/**
 * @property {int} mode var used to render home.ejs --> avoid errors about undefined var
 * @memberOf module:Variables
 * @desc we save the mode that way if we reload the page we don't go back to the default mode.
 * 0 for automatic mode and 1 for manual mode
 */
var mode = 0;

/**
 * @property {string} log var used to render home.ejs --> avoid errors about undefined var
 * @memberOf module:Variables
 * @brief var used to render home.ejs --> avoid errors about undefined var
 */
var log = '';

/**
 * @property {string} F  var used to render home.ejs --> avoid errors about undefined var
 * @memberOf module:Variables
 * @desc sentence with the average of time between connection for each user (or the user selected)
 */
var F = '';

/**
 * @property {string} data  var used to render home.ejs --> avoid errors about undefined var
 * @memberOf module:Variables
 * @desc javascript code to .ejs file, creates new chart from the saved fan data.
 */
var data = '';

/**
 *
 * @property {number} userconnect  if user is not authentified connected = 0, else connected = 1
 * @memberOf module:Variables
 * @desc if user is not authentified, = 0, if connected = 1
 */
var userconnect = 0;



//--------------------------------------------------------------------//
//-------------------------MQTT SETUP---------------------------------//
/**
 * @module objects
 */
/**
 *  @memberOf module:objects
 * @property device
 * Creating the MQTT object and connecting to the broker
 */
const device = mqtt.connect('mqtt://192.168.1.254:1883');     // MQTT object for classroom broker.

/**
 * subscribing to the topic where embedded device publishes data
 * @memberOf property:device
 * @inner
 * @object
 */
device.subscribe("controller/status");

/**
 * receiving messages from the topic
 * @property {int}  pressure pressure value that is parsed from received message
 * @property {int} speed speed value that is parsed from received message
 * @property {} date current date and time
 * @memberOf property:device
 */
device.on("message", async (topic, message) => {
    try {
        //we sometimes receive a message with garbage at the beginning because of which we cannot parse the message
        //so we split the message at the first '{' be then it is deleted so we need to add it back in order to parse it
        //we have a var which the first caracter is the '{' then we add the message with the data and then parse it
        var temp = [];
        temp = message.toString().split('{');
        var msg = '{' + temp[1];
        var pressure = JSON.parse(msg).pressure;
        var speed = JSON.parse(msg).speed;
        var dateTime = GetTime();
    } catch {
        console.log("Error while parsing message");
    }
    await mqttDB.run('INSERT INTO mqtt VALUES (?, ?, ?)', pressure, speed, dateTime, async function (err, row) {
        if (err)
            console.log(err);
    });
});



//--------------------------------------------------------------------//
//-----------------------DATABASE SETUP-------------------------------//
/**
 * @memberOf module:objects
 *  @property mqttDB
 * database object that will save and read from database
 */
const mqttDB = new sqlite3.Database(database);

/**
 * Create the columns in the database
 * @memberOf property:mqttDB
 */
mqttDB.serialize(function () {
    mqttDB.run('CREATE TABLE IF NOT EXISTS mqtt (pressure NUMBER, speed NUMBER, time TEXT)');
});



//--------------------------------------------------------------------//
//---------------------------ROUTES-----------------------------------//
/**
  * @name get/
 * @summary Route serving front page.
 * @function
 * @memberof module:Routes
 * @desc when localhost:3000 is asked it'll come here and ask the user to authenticate
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @property {string} authheader - get the authorization part of the headers
 * @property {string} auth - putting var authheader in a readable way
 * @property {string} login - get the login entered by the user
 * @property {string} key - get the password entered by the user
 * @property {string} users - read the file that contains all the users' id and password
 * @property {string} result -
 * @property {string} D - date in a nice way
 * @property {} T - Time in a nice way
 * @property {} array - read and parse the file of log connections in an array
 */
app.get('/', async (req, res) => {
    try {
        var authheader = req.headers.authorization;

        // if the authorization part of the headers is not set, set the header's authentication on Basic
        if (!authheader) {
            res.setHeader('WWW-Authenticate', 'Basic');

            // return unauthorized status and tell the user that he needs to log to access the page and allow him to log with a link
            return res.status(401).send('You are not authenticated! <a href="/">Click here to log again</a>');
        }

        var auth = new Buffer.from(authheader.split(' ')[1], 'base64').toString().split(':');
        var login = auth[0];
        var key = Password(auth[1]);
        const users = JSON.parse(await readFile(accounts));

        // search for the login entered in the accounts file and return it
        var result = users.filter(function (i) {
            return i.user == login;
        });

        // if no similar login in the accounts file or wrong password, send unauthorized status and allow the user to try again with a link
        if ((result == '') || (key != result[0].pass)) {
            res.status(401).send('Wrong username or password! <a href="/">Click here to log again</a>');
        }
        // if right login and password, create a log connection for the user with the time and send the page
        if (key == result[0].pass) {
            log = '';
            F = '';
            data = '';
            userconnect = 1;
            const d = new Date();
            const D = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
            var T = '';
            for (var i = 16; i < 24; i++) {
                T += (d.toString())[i];
            }

            // parse the date and time to save it in the log
            const P = Date.parse(d);
            const array = JSON.parse(await readFile(logs));
            array.splice(array.length, 0, {user: login, date: D, time: T, parse: P});
            writeFile(logs, JSON.stringify(array));

            // send the page to the user (and the different values if not empty)
            res.render(home, {logs: log, frequencies: F, datas: data, mode: mode});
        }
    } catch (e) {
        // if an error occurs, the 404 status will be set and the error will be send
        res.status(404).send(e);
    }
});

/**
 * @name get/users
 * @summary Route serving user information page.
 * @function
 * @memberof module:Routes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.get('/users', (req, res) => {
    if (userconnect == 1) {
        // empty all the var rendered in the page so that when a new user logs everything is back to zero.
        log = '';
        F = '';
        data = '';

        // send the page with log and F that we just defined (and the data if not empty)
        res.render(userpage, {logs: log, frequencies: F, datas: data});
    } else
        //send to the page with all users' data
        res.redirect('/');
});

/**
 * @name get/logout
 * @summary Route serving unauthorized status.
 * @function
 * @memberof module:Routes
 * @desc when the user click on the log out button it'll set the status as unauthorized and show the message and allow the user to log again with a link
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.get('/logout', (req, res) => {
    userconnect = 0;
    res.status(401).send('You\'ve been logged out successfully! <a href="/">Click here to log again</a>');
});

/**
 * @name post/users
 * @summary Route posting user log information.
 * @function
 * @memberof module:Routes
 * @desc when the user ask to see the log connections it'll come here and send the page with the logs
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @property {array} cFreq - Array for user Chloe's login data
 * @property {array} jFreq - Array for user Janne's login data
 * @property {array} mFreq - Array for user Madeline's login data
 * @property {array} tFreq - Array for user teacher's login data
 * @property {int} c - Variable for user Chloe's average time between connections
 * @property {int} j - Variable for user Janne's average time between connections
 * @property {int} m -  Variable for user Madeline's average time between connections
 * @property {int} t -  Variable for user teacher's average time between connections
 * @property {int} value - used if we only need the average time between connections for one user
 * @property {string} user - user selected to see the log connections
 * @property {array} array - parsed log connections in an array
 */
app.post('/users', async (req, res) => {

    // creating arrays for different parsed dates and times for each user
    var cFreq = [];
    var jFreq = [];
    var mFreq = [];
    var tFreq = [];

    // creating variables to add the parsed values to calculate the average time between connections for each user
    var c = 0;
    var j = 0;
    var m = 0;
    var t = 0;

    var value = 0;
    log = '';

    const user = req.body.users;
    const array = JSON.parse(await readFile(logs));

    // for loop to add the parsed values of each user in their array
    for (var i = 0; i < array.length; i++) {
        if (array[i].user == "chloe") {
            cFreq.splice(cFreq.length, 0, array[i].parse);
        } else if (array[i].user == "janne") {
            jFreq.splice(jFreq.length, 0, array[i].parse);
        } else if (array[i].user == "madeline") {
            mFreq.splice(mFreq.length, 0, array[i].parse);
        } else if (array[i].user == "teacher") {
            tFreq.splice(tFreq.length, 0, array[i].parse);
        }

        // add different detailed ligns about which user connected when in the var log depending on which log connections the user wants to see
        if (user == "all users") {
            log += array[i].user + " connected the " + array[i].date + " at " + array[i].time + "</br>";
        } else {
            if (array[i].user == user) {
                log += array[i].user + " connected the " + array[i].date + " at " + array[i].time + "</br>";
            }
        }
    }

    // get the time difference between each connections in miliseconds with the array of parsed values of each user and add it to their var
    for (var i = 1; i < cFreq.length; i++) {
        c += Math.floor((cFreq[i] - cFreq[i - 1]) / 1000);
    }
    for (var i = 1; i < jFreq.length; i++) {
        j += Math.floor((jFreq[i] - jFreq[i - 1]) / 1000);
    }
    for (var i = 1; i < mFreq.length; i++) {
        m += Math.floor((mFreq[i] - mFreq[i - 1]) / 1000);
    }
    for (var i = 1; i < tFreq.length; i++) {
        t += Math.floor((tFreq[i] - tFreq[i - 1]) / 1000);
    }

    // create a sentence with the average of time between connection for each user (or the user selected)
    if (user == "all users") {
        F = "chloe connected every " + GetFrequency(c / cFreq.length) +
            "</br>janne connected every " + GetFrequency(j / jFreq.length) +
            "</br>madeline connected every " + GetFrequency(m / mFreq.length) +
            "</br>teacher connected every " + GetFrequency(t / tFreq.length) + "</br>";
    } else {
        if (user == "chloe") {
            value = c / cFreq.length;
        } else if (user == "janne") {
            value = j / jFreq.length;
        } else if (user == "madeline") {
            value = m / mFreq.length;
        } else if (user == "teacher") {
            value = t / tFreq.length;
        }
        F = user + " connected every " + GetFrequency(value) + "</br>";
    }
    // send the page with log and F that we just defined (and the data if not empty)
    res.render(userpage, {logs: log, frequencies: F, datas: data, mode: mode});
});


/**
 * @name post/datas
 * @summary Route serving embedded device data from database.
 * @function
 * @memberof module:Routes
 * @desc  when the user ask to see the data logs it'll come here, get the data logs and send it to the page
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @property {string} datas - selected period of time for the data logs
 * @property {array} Xtime - array for the different times logged
 * @property {array} Yspeed - array for the differnet speeds logged
 * @property {array} Ypressure - array for the different pressures logged
 * @property {object} now - current date and time object
 * @property {array} week - calculate a week in milliseconds
 * @property {array} fiveDay - calculate five days in milliseconds
 * @property {array} threeDays - calculate three days in milliseconds
 * @property {array} tenHours - calculate ten hours in milliseconds
 * @property {array} hour - calculate hour in milliseconds
 * @property {array} half - calculate half an hour in milliseconds
 * @property {array} quarter - caluclate 15 minutes in milliseconds
 */
app.post('/datas', (req, res) => {
    const datas = req.body.datas;
    var Xtime = [];
    var Yspeed = [];
    var Ypressure = [];

    //save the current mode
    mode = req.body.mode;

    // put all the wished times, speeds and pressures in their array depending on the selected period of time
    const now = new Date();
    const week = Date.parse(now) - Date.parse('08 Jan 1970 00:00:00 GMT');
    const fiveDays = Date.parse(now) - Date.parse('06 Jan 1970 00:00:00 GMT');
    const threeDays = Date.parse(now) - Date.parse('04 Jan 1970 00:00:00 GMT');
    const yesterday = Date.parse(now) - Date.parse('02 Jan 1970 00:00:00 GMT');
    const tenHours = Date.parse(now) - Date.parse('01 Jan 1970 10:00:00 GMT');
    const fiveHours = Date.parse(now) - Date.parse('01 Jan 1970 05:00:00 GMT');
    const hour = Date.parse(now) - Date.parse('01 Jan 1970 01:00:00 GMT');
    const half = Date.parse(now) - Date.parse('01 Jan 1970 00:30:00 GMT');
    const quarter = Date.parse(now) - Date.parse('01 Jan 1970 00:15:00 GMT');


    // select all the values in the table mqtt
    mqttDB.all('SELECT PRESSURE, SPEED, TIME FROM mqtt', [], (err, rows) => {

        // if an error occurs, the 404 status will be set and the error will be send
        if (err) {
            res.status(404).send(err);
        }
        if (datas == "All") {
            rows.forEach((row) => {
                Xtime.push(Count(row.time));
                Ypressure.push(row.pressure);
                Yspeed.push(row.speed);
            });
        } else if (datas == "From last week") {
            rows.forEach((row) => {
                if (Date.parse(row.time) >= week) {
                    Xtime.push(Count(row.time));
                    Ypressure.push(row.pressure);
                    Yspeed.push(row.speed);
                }
            });
        } else if (datas == "From 5d ago") {
            rows.forEach((row) => {
                if (Date.parse(row.time) >= fiveDays) {
                    Xtime.push(Count(row.time));
                    Ypressure.push(row.pressure);
                    Yspeed.push(row.speed);
                }
            });
        } else if (datas == "From 3d ago") {
            rows.forEach((row) => {
                if (Date.parse(row.time) >= threeDays) {
                    Xtime.push(Count(row.time));
                    Ypressure.push(row.pressure);
                    Yspeed.push(row.speed);
                }
            });
        } else if (datas == "From yesterday") {
            rows.forEach((row) => {
                if (Date.parse(row.time) >= yesterday) {
                    Xtime.push(Count(row.time));
                    Ypressure.push(row.pressure);
                    Yspeed.push(row.speed);
                }
            });
        } else if (datas == "Last 10h") {
            rows.forEach((row) => {
                if (Date.parse(row.time) >= tenHours) {
                    Xtime.push(Count(row.time));
                    Ypressure.push(row.pressure);
                    Yspeed.push(row.speed);
                }
            });
        } else if (datas == "Last 5h") {
            rows.forEach((row) => {
                if (Date.parse(row.time) >= fiveHours) {
                    Xtime.push(Count(row.time));
                    Ypressure.push(row.pressure);
                    Yspeed.push(row.speed);
                }
            });
        } else if (datas == "Last hour") {
            rows.forEach((row) => {
                if (Date.parse(row.time) >= hour) {
                    Xtime.push(Count(row.time));
                    Ypressure.push(row.pressure);
                    Yspeed.push(row.speed);
                }
            });
        } else if (datas == "Last 30min") {
            rows.forEach((row) => {
                if (Date.parse(row.time) >= half) {
                    Xtime.push(Count(row.time));
                    Ypressure.push(row.pressure);
                    Yspeed.push(row.speed);
                }
            });
        } else if (datas == "Last 15min") {
            rows.forEach((row) => {
                if (Date.parse(row.time) >= quarter) {
                    Xtime.push(Count(row.time));
                    Ypressure.push(row.pressure);
                    Yspeed.push(row.speed);
                }
            });
        }

        // create the client's javascript to realize the graphical data
        data = '<script>' +
            'new Chart("myChart", {' +									                // create a new chart where the id is myChart in home.ejs
            'type: "line",' +										                    // define the chart as a lign chart
            'data: {' +
            'labels: ' + JSON.stringify(Xtime) + ',' +				                    // get all the time values from the array for the abscissa
            'datasets: [{' +										                    // create a line chart for the pressure and another for the speed
            'label: "Pressure",' +
            'data: [' + Ypressure + '],' +						                        // get all the pressure values from the array for the ordered
            'borderColor: "red",' +							                            // set the color red for the line chart of pressure
            'fill: false' +									                            // avoid the line chart to be filled
            '},{' +
            'label: "Speed",' +
            'data: [' + Yspeed + '],' +							                        // get all the speed values from the array for the ordered
            'borderColor: "blue",' +							                        // set the color blue for the line chart of pressure
            'fill: false' +									                            // avoid the line chart to be filled
            '}]' +
            '},' +
            'options: {' +
            'legend: {display: true},' +							                    // allow the display of the legend
            'elements: { point: {radius: 0} },' +				                        // hide the points for each value on the chart
            'scales: { xAxes: [{ ticks: {display: false} }] }' +	                    // hide the time values from the xAxes
            '}' +
            '});' +
            '</script>';

        // send the page with the html code (and the other values if not empty)
        res.render(home, {logs: log, frequencies: F, datas: data, mode: mode});
    });
});

/**
 * @name get/client.js
 * @summary Route serving client.js file.
 * @function
 * @memberof module:Routes
 * @inner
 * @desc sending the file handler the client side
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.get('/client.js', (req, res) => {
    res.sendFile(client);
});

/**
 * @name get/pressureLvl
 * @summary Route serving latest saved pressuredata from database.
 * @function
 * @memberof module:Routes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @property {array} data -    save the row data in a variable
 */
app.get('/pressureLvl', async (req, res) => {
    // we connect to the database and retrieve pressure and speed
    mqttDB.all('SELECT PRESSURE, SPEED FROM mqtt', async function (err, row) {
        if (err)
            console.log(err);
        var data = row;

        //send the data to the client through fetch
        res.send(data[data.length - 1]);
    });
});


/**
 * @name post/speed
 * @summary Route for sending manual mode controller settings to embedded device using MQTT.
 * @function
 * @memberof module:Routes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.post('/speed', (req, res) => {
    // we save the current mode
    mode = parseInt(req.body.mode);

    // we publish the input data to the chosen topic
    device.publish('controller/settings', `{"auto": false, "speed": ` + req.body.speed_value + `}`);

    // send the page to the user (and the different values if not empty)
    //res.render(home, { logs: log, frequencies: F, datas: data, mode: mode });
    res.status(204).send();
});


/**
 * @name post/autoMode
 * @summary Route for sending automode and wanted pressure to MQTT broker
 * @function
 * @memberof module:Routes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
app.post('/autoMode', (req, res) => {
    //save the current mode
    mode = parseInt(req.body.mode);

    setPressure(req.body.wantedPressure);
    res.status(204).send();
})


//--------------------------------------------------------------------//
//------------------------FUNCTIONS-----------------------------------//
/** Functions
 * @module Functions
 */

/**
 * Sends a wanted pressure value to embedded device over MQTT.
 * @memberOf module:Functions
 * @param pressure {int} value of the wanted pressure.
 * @returns nothing
 */
function setPressure(pressure) {
    console.log("set pressure to: ", pressure);
    device.publish('controller/settings', `{"auto": true, "pressure": ` + pressure + `}`);
}

/**
 * @desc This function calculate the time from the average of miliseconds given.
 * @memberOf module:Functions
 * @param time the speed and/or pressure change
 * @returns {string} If the time given is defined correctly and different from 0 it returns the time.
 * @property {number} seconds - Get the seconds from the microseconds and keep the rest
 * @property {number} minutes - Get the minutes from the sconds and keep the rest

 */
function GetFrequency(time) {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor((time / 60) % 60);

    // If the time given is not defined correctly or equal to 0 it returns a message instead of the time
    if ((isNaN(time) == true) || (time <= 0)) {
        return "<B>no (or not enough) connection for now</B>";
    } else {
        // If the time given is defined correctly and different from 0 it returns the time
        return minutes + "m " + seconds + "s";
    }
}

/**
 * Calculates the time between now and the chosen time.
 * @memberOf module:Functions
 * @param time the speed and/or pressure change
 * @returns {string} the days, hours and minutes calculated
 * @property {number} total - parse the times (put in microseconds) to substract them
 * @property {number} seconds - Get the seconds from milliseconds and keep the rest
 * @property {number} minutes - Get the minutes from the seconds and keep the rest
 * @property {number} hours - Get the hours from minutes and keep the rest
 * @property {number} days - Get the days from the hours and keep the rest
 */
function Count(time) {
    const total = Date.parse(new Date()) - Date.parse(time);
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return days + "d " + hours + "h " + minutes + "m ago";
}

/**
 * Uses javascript Date instance to get current date and time.
 * @memberOf module:Functions
 * @returns {string} date and time in string
 * @property {object} today - date object
 * @property {string} date - get the date
 * @property {string} time - get the time
 */
function GetTime() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + (today.getMinutes() < 10 ? '0' : '') + today.getMinutes() +
        ":" + (today.getSeconds() < 10 ? '0' : '') + today.getSeconds();
    return date + ' ' + time;
}

/**
 * @param {string} pwd password to be encrypted
 * @returns {string} synchronous encrypted (with sha152) password of 64 bytes
 * @memberOf module:Functions
 */
function Password(pwd) {
    return (crypto.pbkdf2Sync(pwd, 'salt', 100000, 64, 'sha512')).toString('hex');
}

app.listen(3000);