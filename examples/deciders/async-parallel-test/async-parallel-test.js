
async.series([

    activity({
        name: 'step1',
        activity: 'sleep'
    }),

    function(cb) {
        async.parallel([

            activity({
                name: 'step2',
                activity: 'sum',
                input: { a: 1, b: 2 }
            }),

            activity({
                name: 'step3',
                activity: 'sum',
                input: { a: 3, b: 4 }
            })

            ], cb);
        },

        activity({
            name: 'step4',
            activity: 'sum',
            input: function() {
                return {
                    a: results('step2'),
                    b: results('step3')
                };
            }
        })

        ], function() {

            stop({
                result: {
                    "step4": results('step4')
                }
            });

        });
