


activity({
	name: 'step1',
	activity: 'sleep'
})(function(err, results) {

	timer({
		name: 'step2',
		delay: 10
	}, { timerId: '12345' })(function(err, data) {

		stop({
			result: 'Everything is good !'
		});

	});

});


// step1 -> timer (step2) -> step3

/*if( has_workflow_just_started() ) {

	schedule({
        name: 'step1',
        activity: 'sum',
        input: {
            a: 4,
            b: 6
        }
    });

}


// Use a SWF Timer
if( completed('step1') && !timer_scheduled('step2') ) {
   start_timer({
      name: 'step2',
      delay: 10
   });
}



if( completed('step2') && !scheduled('step3') ) {
   schedule({
        name: 'step3',
        activity: 'sum',
        input: function() {
        	return {
            	a: results('step1'),
            	b: 6
        	};
        }
    });
}

if( completed('step3') ) {
   stop({
      result: 'Everything is good !'
   });
}
*/
