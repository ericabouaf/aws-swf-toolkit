var esprima = require('esprima');


   var tree = esprima.parse("if( completed('localtask_1') ) { var a = 3; }", { /*range: true, tokens: true, comment: true*/ });

console.log(JSON.stringify(tree, null, 3));