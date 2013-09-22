/**
 * Default decider process for swf-decider
 * This process is spawned for each new decision task received.
 * It will look in the working directory for a Node.JS module that has the same name as the workflow
 */
var vm = require('vm'),
    fs = require('fs'),
    path = require('path'),
    swf = require('aws-swf');

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
            }
        };

        // Expose all methods available on the DecisionTask as methods in the sandbox
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
        if (!dt.responseSent) {
            if (dt.decisions) {
                console.log("sending decisions...");
                console.log(JSON.stringify(dt.decisions, null, 3));
                dt.respondCompleted(dt.decisions);
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
