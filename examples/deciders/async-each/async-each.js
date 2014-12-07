


var collection = [9, 3, 5, 8, 7];
var i = 1;

async.each(collection, function(item, cb) {

	activity({
        name: 'step_'+(i++),
        activity: 'sum',
        input: { a: item, b: item }
    })(cb);

}, function() {

	var r = [];
	for(var i = 1 ; i <= collection.length ; i++) {
		r.push( results('step_'+i) );
	}

	stop({
        result: {
            "double": r
        }
    });

});