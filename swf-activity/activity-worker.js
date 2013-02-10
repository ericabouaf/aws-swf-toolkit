/**
 * Default worker process for swf-activity
 * This process is spawned for each new activity task received.
 * It will look in the working directory for a Node.JS module that has the same name as the activity-type
 */
var path = require('path'),
    fs = require('fs'),
    swf = require('aws-swf');

// The task is given to this process as a command line argument in JSON format :
var taskConfig = JSON.parse(process.argv[2]);

// Create the ActivityTask
var task = new swf.ActivityTask(taskConfig);

function activityFailed(reason, details) {
    task.respondFailed(reason, details, function (err) {
        if (err) { console.error(err); return; }
        console.log("respond failed !");
    });
}

var workerName = taskConfig.activityType.name;

var activitiesDirectory = path.join(process.cwd(),'activities');
if(!fs.existsSync(activitiesDirectory)) {
    activitiesDirectory = process.cwd();
}

try {

    // Load the worker module 
    //  Simple module : 'soap' -> require('soap').worker
    //  or multiple activities package: 'ec2_runInstances' -> require('ec2').runInstances
    console.log("Trying to load worker : " + workerName);

    var split = workerName.split('_');
    var packageName = split[0],
        workerName = "worker";
    if(split.length > 1) {
        workerName = split[1];
    }
    var worker = require(path.join(activitiesDirectory, packageName))[workerName];

    console.log("module loaded !");

    // Use the asynchronous method to get the config for this module
    var config = {};
    try {
        config = require(path.join(activitiesDirectory, workerName, 'config.js'));
    } catch(ex) {}

    try {
        worker(task, config);
    } catch (ex) {
        console.log(ex);
        activityFailed("Error executing " + workerName, "");
    }

} catch (ex) {
    console.log(ex);
    activityFailed("Unable to load module " + workerName, "");
}
