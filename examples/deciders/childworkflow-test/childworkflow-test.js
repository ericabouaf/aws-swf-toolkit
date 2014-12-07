


if( has_workflow_just_started() ) {
   schedule({
      name: 'step1',
      activity: 'sleep',
      input: {
         delay: 2000
      }
   });
}


// THIS IS A CHILD WORKFLOW !!!
if( completed('step1') && !childworkflow_scheduled('step2') ) {
   start_childworkflow({
      name: 'step2',
      workflow: 'parallel-test'
   }, {
      taskStartToCloseTimeout: "3600",
      executionStartToCloseTimeout: "3600",
      childPolicy: "TERMINATE",
      taskList: {
         name: 'aws-swf-tasklist'
      }
   });
}

if( childworkflow_scheduled('step2') && !completed('step2') ) {
   wait();
}


if( completed('step2') ) {
   stop({
      result: function() {
         return childworkflow_results('step2').step2;
      }
   });
}

