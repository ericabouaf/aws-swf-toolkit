# aws-swf-toolkit

A Node.js Framework for workflows on Amazon SWF



This toolkit provides a collection of [command-line tools](https://github.com/neyric/aws-swf/wiki/Command-Line-Tools) to interact with the Amazon Simple Workflow (SWF) service.
    
framework for writing and running Amazon SWF activities & deciders in Javascript

## Activities
         
pretty dumb, an activity is just a function call
EXCEPT: does not have to send a response right away ! ( very long tasks ! )

* config.example.js
* package.json
* activities run method
* SOON: something for input/output variables schema ? (json-schema ?)

(TODO: fetch_config_file unecessary complexity)


## Workflows

IMPORTANT: fundamental difference with script: the decider is called many times through the workflow execution. It is STATELESS.
           Instead, we must inspect the event history of the workflow, and make our decisions (simplified using aws-swf decision task API)

* package.json
* JS description of the workflow


(TODO: remove the fetch_code_file unecessary complexity)
        

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


* swf-project : start n swf-decider processes and n swf-activity processes from the current folder (default directories: activities/ & workflows/)

* swf-activity-test: creates a workflow which can execute any activity given a file

* swf-server (TODO: DA swf console !)



## Documentation

* Run the demo with the [Quickstart Guide](https://github.com/neyric/aws-swf/wiki/Quickstart-Guide)
* [The Wiki](https://github.com/neyric/aws-swf/wiki) contains links to all the documentation
* [Write SWF deciders in javascript](https://github.com/neyric/aws-swf/wiki/Writing-deciders)
* [Write SWF activities in javascript](https://github.com/neyric/aws-swf/wiki/Create-new-activities)
* [A collection of ready-to-use activities](https://github.com/neyric/aws-swf/tree/master/activities)



## Installation

For more detailed installation instructions, check the [Installation Wiki Page](https://github.com/neyric/aws-swf/wiki/Installation)

## Overview

![AWS-SWF Overview](/neyric/aws-swf/raw/master/diagram.png "AWS-SWF Overview")


