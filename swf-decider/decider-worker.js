/**
 * Default decider process for swf-decider
 * This process is spawned for each new decision task received.
 * It will look in the working directory for a Node.JS module that has the same name as the workflow
 */
var vm = require('vm'),
    fs = require('fs'),
    path = require('path'),
    swf = require('aws-swf'),
    async = require('async');

// The task is given to this process as a command line argument in JSON format :
var decisionTaskConfig = JSON.parse(process.argv[2]);

// Re-Create the Decision task
var dt = new swf.DecisionTask(decisionTaskConfig);

function workflowFailed(reason, details) {
    dt.response.fail_workflow_execution(reason, details, function (err) {
        if (err) { console.error(err); return; }
        console.log("Workflow marked as failed ! (decider-worker)");
    });
}


var workflowsDirectory = path.join(process.cwd(),'workflows');
if(!fs.existsSync(workflowsDirectory)) {
    workflowsDirectory = process.cwd();
}

var workflowName = decisionTaskConfig.workflowType.name;

try {

    fs.readFile(path.join(workflowsDirectory, workflowName, workflowName + '.js'), function (err, deciderCode) {

        if(err) {
            console.log(err);
            workflowFailed("Error in fetch_code", err);
            return;
        }

        var sandbox = {
            COMPLETED: 1,
            FAILED: 2,
            TIMEDOUT: 4,

            // TODO: method to load external js files

            // TODO
            // read content of a file from the decider code
            file: function(path) {
                return fs.readFileSync(path).toString();
            },

            // Expose the async library
            async: async,

            // Method to wrap a "schedule" call in a closure, which returns immediatly if it has results
            // This prevents a lot of the inspection of the event list in the decider code
            activity: function(scheduleAttributes, swfAttributes) {
                return function(cb) {
                    if( dt.eventList.is_activity_scheduled(scheduleAttributes.name) ) {
                        if( dt.eventList.has_activity_completed(scheduleAttributes.name) ) {
                            cb(null, dt.eventList.results(scheduleAttributes.name) );
                        }
                        else {
                            console.log("waiting for "+scheduleAttributes.name+" to complete.");
                            dt.response.wait();
                        }
                    }
                    else {
                        console.log("scheduling "+scheduleAttributes.name);
                        dt.response.schedule(scheduleAttributes, swfAttributes);
                    }
                };
            },

            timer: function (startAttributes, swfAttributes) {
                return function (cb) {
                        if(dt.eventList.timer_scheduled(swfAttributes.timerId)) {
                            if( dt.eventList.timer_fired(swfAttributes.timerId) ) {
                                cb(null);
                            }
                            else {
                                console.log("waiting for timer "+swfAttributes.timerId+" to complete");
                            }
                        }
                        else {
                            console.log("starting timer "+swfAttributes.timerId);
                            dt.response.start_timer(startAttributes, swfAttributes);
                        }
                };
            },

            childworkflow: function (startAttributes, swfAttributes) {
                return function (cb) {
                        if(dt.eventList.childworkflow_scheduled(startAttributes.control)) {
                            if(childworkflow_completed(control) ) {
                                cb(null, childworkflow_results(control) );
                            }
                            else {
                                console.log("waiting for childworkflow "+" to complete");
                            }
                        }
                        else {
                            console.log("starting childworkflow "+startAttributes.control);
                            dt.response.start_childworkflow(startAttributes, swfAttributes);
                        }
                };
            }

        };

        // Expose all methods available on the DecisionTask as methods in the sandbox
        // TODO: cleanup :
        var dtResponseFactory = function(fctName) {
            return function () {
                return dt.response[fctName].apply(dt.response, arguments);
            };
        };
        for(var k in dt.response) {
            if(typeof dt.response[k] === "function") {
                sandbox[k] = dtResponseFactory(k);
            }
        }

        var dtEventListFactory = function(fctName) {
            return function () {
                return dt.eventList[fctName].apply(dt.eventList, arguments);
            };
        };
        for(k in dt.eventList) {
            if(typeof dt.eventList[k] === "function") {
                sandbox[k] = dtEventListFactory(k);
            }
        }

        // Run the decider code
        try {
            vm.runInNewContext(deciderCode, sandbox, workflowName + '.vm');
        } catch (ex) {
            console.log(ex);
            workflowFailed("Error executing workflow decider " + workflowName, "");
        }

        // Send the decisions back to SWF
        if (!dt.response.responseSent) {
            if (dt.response.decisions) {
                console.log("sending decisions...");

                dt.response.send(function(err, results) {

                    if (err) {
                        console.error("RespondDecisionTaskCompleted error : ", err, results);
                    }
                    else {
                        console.log(dt.response.decisions.length + " decisions sent !");
                        console.log(JSON.stringify(dt.response.decisions, null, 3));
                    }

                });
            } else {
                console.log("No decision sent and no decisions scheduled !");
                dt.response.fail("Don't know what to do...");
            }
        }

    });

} catch (ex) {
    console.log(ex);
    workflowFailed("Error running the fetch_code method for workflowName : "+workflowName, "");
}
