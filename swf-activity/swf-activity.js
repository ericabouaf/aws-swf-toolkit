#!/usr/bin/env node

// Start a ActivityPoller which spawns the given activity worker file

var colors = require('colors'),
    optimist = require('optimist'),
    spawn = require('child_process').spawn,
    os = require('os'),
    path = require('path'),
    fs = require('fs'),
    swf = require('aws-swf');


var argv = optimist
    .usage('Start an activity-poller for AWS SWF.\nUsage: swf-activity worker-file.js')
    .options('d', {
        'alias' : 'domain',
        'default' : 'aws-swf-test-domain',
        'describe': 'SWF domain'
    })
    .options('t', {
        'alias' : 'tasklist',
        'default' : 'aws-swf-tasklist',
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
    .argv;

if (argv.help) {
    optimist.showHelp();
    process.exit(0);
}


// Start the activity poller
var activityPoller = new swf.ActivityPoller({
    domain: argv.d,
    taskList: {name: argv.t},
    identity: argv.i
});


activityPoller.on('activityTask', function (activityTask) {

    // Spawn child process
    var p = spawn('node', [ path.join(__dirname, 'activity-worker.js'), JSON.stringify(activityTask.config) ]);

    p.stdout.on('data', function (data) {
        console.log(data.toString().blue);
    });

    p.stderr.on('data', function (data) {
        console.log(data.toString().red);
    });

    p.on('exit', function (code) {
        console.log('child process exited with code ' + code);
    });

});


activityPoller.on('poll', function(d) {
    console.log("polling for activity tasks...", d);
});

activityPoller.start();

// on SIGINT event, close the poller properly
process.on('SIGINT', function () {
    console.log('Got SIGINT ! Stopping activity poller after this request...please wait...');
    activityPoller.stop();
});
