# aws-swf-toolkit

A Node.js Framework for building workflows on Amazon SWF

This toolkit provides a collection of command-line utilities to interact with the Amazon Simple Workflow (SWF) service. They form a framework for writing and running Amazon SWF activities & deciders in Javascript.

## See also

* [aws-swf](https://github.com/neyric/aws-swf): Node.js Library for Amazon SWF
* [aws-swf-activities](https://github.com/neyric/aws-swf-activities): A collection of Node.js activity workers for Amazon SWF


## swf-activity: Running Activity workers

pretty dumb, an activity is just a function call
EXCEPT: does not have to send a response right away ! ( very long tasks ! )

* config.example.js
* package.json
* activities run method
* SOON: something for input/output variables schema ? (json-schema ?)


## swf-deciders: Running the Workflow logic

IMPORTANT: fundamental difference with script: the decider is called many times through the workflow execution. It is STATELESS.
           Instead, we must inspect the event history of the workflow, and make our decisions (simplified using aws-swf decision task API)

* package.json
* JS description of the workflow
        

## CLI tools to play with swf from the command line


* swf-activity
* swf-decider
* swf-graph
  * DONE adding default results values for the swf-graph into graphOptions.json
* swf-register
* swf-start



* DONE in decompose-process: add a "condition" method in step configuration

## TODO

* swf-decider: add 'helpers' methods to the sandbox (by activity)
      ex: if the activityType: 'mturk' as been executed it loads activities/mturk


* Activity-Type-Configuration-Details when registering a new ActivityType ( using activityTypeOptions.json, if exists )

* options for default workflow parameters (workflowOptions.json, if exists) => no need to set them in start_childworkflow

## Documentation

* Run the demo with the [Quickstart Guide](https://github.com/neyric/aws-swf/wiki/Quickstart-Guide)
* [The Wiki](https://github.com/neyric/aws-swf/wiki) contains links to all the documentation
* [Write SWF deciders in javascript](https://github.com/neyric/aws-swf/wiki/Writing-deciders)
* [Write SWF activities in javascript](https://github.com/neyric/aws-swf/wiki/Create-new-activities)
* [A collection of ready-to-use activities](https://github.com/neyric/aws-swf/tree/master/activities)



## Installation


    $ [sudo] npm install -g aws-swf-toolkit


## Overview

![AWS-SWF Overview](/neyric/aws-swf-toolkit/raw/master/diagram.png "AWS-SWF Overview")


## License

[MIT License](https://raw.github.com/neyric/aws-swf/master/LICENSE.txt)


