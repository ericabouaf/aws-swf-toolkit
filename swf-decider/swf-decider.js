#!/usr/bin/env node

// Start a DeciderPoller which spawns decider-worker.js for each new decisionTask

var colors = require('colors'),
    optimist = require('optimist'),
    spawn = require('child_process').spawn,
    os = require('os'),
    path = require('path'),
    fs = require('fs'),
    swf = require('aws-swf');

var argv = optimist
    .usage('Start a decider-poller for AWS SWF.\nUsage: swf-decider decider-file.js')
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
        'default' : 'Decider-' + os.hostname() + '-' + process.pid,
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


// Start a decider poller
var myDecider = new swf.Decider({
    domain: argv.d,
    taskList: {"name": argv.t},
    identity: argv.i,
    maximumPageSize: 500,
    reverseOrder: false // IMPORTANT: must replay events in the right order, ie. from the start
});


myDecider.on('decisionTask', function (decisionTask) {

    // If we receive an event "ScheduleActivityTaskFailed", we should fail the workflow and display why...
    var failedEvent = decisionTask.eventList.has_schedule_activity_task_failed();
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
    var p = spawn('node', [ path.join(__dirname, 'decider-worker.js'), JSON.stringify(decisionTask.config)/*, argv.accessKeyId, argv.secretAccessKey, argv.c */]);

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
    console.log("polling for tasks...", d);
});

myDecider.poll();

// on SIGINT event, close the poller properly
process.on('SIGINT', function () {
    console.log('Got SIGINT ! Stopping decider poller after this request...please wait...');
    myDecider.stop();
});

