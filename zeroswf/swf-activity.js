#!/usr/bin/env node

// Start a ActivityPoller which spawns the given activity worker file

var colors = require('colors'),
    optimist = require('optimist'),
    spawn = require('child_process').spawn,
    os = require('os'),
    path = require('path'),
    fs = require('fs');

var config, configFilePath = path.join(__dirname, '..', 'config.js');
try {
    config = require(configFilePath);
} catch (ex) {
    config = {};
}

var argv = optimist
    .usage('Start an activity-poller for AWS SWF.\nUsage: swf-activity worker-file.js')
    .options('d', {
        'alias' : 'domain',
        'default' : config.domain || 'aws-swf-test-domain',
        'describe': 'SWF domain'
    })
    .options('t', {
        'alias' : 'tasklist',
        'default' : config.tasklist || 'aws-swf-tasklist',
        'describe': 'tasklist'
    })
    .options('i', {
        'alias' : 'identity',
        'default' : 'ActivityPoller-' + os.hostname() + '-' + process.pid,
        'describe': 'identity of the poller'
    })
    .options('h', {
        'alias' : 'help',
        'describe': 'show this help'
    })
    .options('c', {
        'alias' : 'fetchconfigfile',
        'default' : path.join(__dirname, 'fetch_config_file.js'),
        'describe': 'js file which exports the fetch_config method'
    })
    .options('accessKeyId', {
        'default': config.accessKeyId,
        'describe': 'AWS accessKeyId'
    })
    .options('secretAccessKey', {
        'default': config.secretAccessKey,
        'describe': 'AWS secretAccessKey'
    })
    .options('fetchConfigData', {
        'describe': 'Data passed to fetch_config'
    })
    .argv;

if (argv.help) {
    optimist.showHelp();
    process.exit(0);
}

// Check presence of accessKeyId and secretAccessKey
if (!argv.accessKeyId || !argv.secretAccessKey) {
    console.error(("accessKeyId or secretAccessKey not configured !\nSet the --accessKeyId and --secretAccessKey parameters or call 'swf-set-credentials'.").red);
    process.exit(1);
}


// Create SWF client
var swf = require('../index');
var swfClient = swf.createClient({
    accessKeyId: argv.accessKeyId,
    secretAccessKey: argv.secretAccessKey
});









var zeromq = require('zmq')
    , port = 'tcp://127.0.0.1:12345';

var socket = zeromq.socket('push');

socket.identity = 'activity-poller-' + process.pid;

socket.bind(port, function(err) {

    socket.connect(port);

    if (err) throw err;

    console.log('bound!');

    /*setInterval(function() {
        var value = Math.floor(Math.random()*100);

        console.log(socket.identity + ': asking ' + value);
        socket.send(value);
    }, 1000);


    socket.on('message', function(data) {
        console.log(socket.identity + ': answer data ' + data);
    });*/


    // Start the activity poller
    var activityPoller = new swf.ActivityPoller(swfClient, {
        domain: argv.d,
        taskList: {name: argv.t},
        identity: argv.i
    }, function (activityTask, cb) {

        console.log("received activityTask !")

        socket.send( JSON.stringify(activityTask.config) );

        // Spawn child process
        /*var p = spawn('node', [ argv.f, JSON.stringify(activityTask.config), argv.accessKeyId, argv.secretAccessKey, argv.c, argv.fetchConfigData]);

        p.stdout.on('data', function (data) {
            console.log(data.toString().blue);
        });

        p.stderr.on('data', function (data) {
            console.log(data.toString().red);
        });

        p.on('exit', function (code) {
            console.log('child process exited with code ' + code);
            cb(true); // continue polling  
        });*/

        cb(true); // continue polling

    });

    activityPoller.start();


    // on SIGINT event, close the poller properly
    process.on('SIGINT', function () {
        console.log('Got SIGINT ! Stopping activity poller after this request...please wait...');
        activityPoller.stop();
    });


});




