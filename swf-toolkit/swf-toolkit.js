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
    .usage('Start both activity-poller & decider-poller for AWS SWF.\nUsage: swf-toolkit')
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
    .options('h', {
        'alias' : 'help',
        'describe': 'show this help'
    })
    .argv;

if (argv.help) {
    optimist.showHelp();
    process.exit(0);
}


/***********
 * Decider
 ************/


// Start the activity poller
var activityPoller = new swf.ActivityPoller({
    domain: argv.d,
    taskList: {name: argv.t},
    identity: 'ActivityPoller-' + os.hostname() + '-' + process.pid,
});


activityPoller.on('activityTask', function (activityTask) {

    // Spawn child process
    var p = spawn('node', [ path.join(__dirname, '..', 'swf-activity', 'activity-worker.js'), JSON.stringify(activityTask.config) /*, argv.accessKeyId, argv.secretAccessKey, argv.c, argv.fetchConfigData*/]);

    p.stdout.on('data', function (data) {
        console.log(data.toString().blue);
    });

    p.stderr.on('data', function (data) {
        console.log(data.toString().red);
    });

    p.on('exit', function (code) {
        console.log('child process exited with code ' + code);
        
        activityPoller.poll();
    });

});


activityPoller.on('poll', function(d) {
    console.log("polling for activity tasks...", d);
});

activityPoller.poll();

// on SIGINT event, close the poller properly
process.on('SIGINT', function () {
    console.log('Got SIGINT ! Stopping activity poller after this request...please wait...');
    activityPoller.stop();
});





/***********
 * Decider
 ************/


// Start a decider poller
var myDecider = new swf.Decider({
    domain: argv.d,
    taskList: {"name": argv.t},
    identity: 'Decider-' + os.hostname() + '-' + process.pid,
    maximumPageSize: 500,
    reverseOrder: false // IMPORTANT: must replay events in the right order, ie. from the start
});


myDecider.on('decisionTask', function (decisionTask) {

    // If we receive an event "ScheduleActivityTaskFailed", we should fail the workflow and display why...
    var failedEvent = decisionTask.has_schedule_activity_task_failed();
    if (failedEvent) {
        var failedAttrs = failedEvent.scheduleActivityTaskFailedEventAttributes;
        console.error(("Received a ScheduleActivityTaskFailed: " + failedAttrs.cause + "  " + JSON.stringify(failedAttrs)).red);
        decisionTask.fail_workflow_execution(failedAttrs.cause, JSON.stringify(failedAttrs), function (err, results) {
            if (err) { console.log(err, results); return; }
            console.error("Workflow marked as failed !".red);
        });
        
        // to continue polling
        myDecider.poll();

        return;
    }

    console.log("new decisionTask received ! spawning...");

    // Spawn child process
    var p = spawn('node', [ path.join(__dirname, '..', 'swf-decider', 'decider-worker.js'), JSON.stringify(decisionTask.config)/*, argv.accessKeyId, argv.secretAccessKey, argv.c */]);

    p.stdout.on('data', function (data) {
        console.log(data.toString().blue);
    });

    p.stderr.on('data', function (data) {
        console.log(data.toString().red);
    });

    p.on('exit', function (code) {
        console.log(('child process exited with code ' + code));
        
        myDecider.poll();
    });

});


myDecider.on('poll', function(d) {
    //console.log(_this.config.identity + ": polling for decision tasks...");
    console.log("polling for decision tasks...", d);
});

myDecider.poll();

// on SIGINT event, close the poller properly
process.on('SIGINT', function () {
    console.log('Got SIGINT ! Stopping decider poller after this request...please wait...');
    myDecider.stop();
});

