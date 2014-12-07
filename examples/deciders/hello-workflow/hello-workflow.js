
// step1 -> step2 -> terminate


// step1
if( has_workflow_just_started() && !scheduled('step1') ) {
   schedule({
      name: 'step1',
      activity: 'hello-activity'
   });
}


// step2
if( !scheduled('step2') && completed('step1') ) {
   schedule({
      name: 'step2',
      activity: 'echo',
      input: results('step1')
   });
}

// end
if( completed('step2') ) {
   stop({
      result: "finished !"
   });
}
