var esprima = require('esprima'),
    escodegen = require('escodegen'),
    fs = require('fs'),
    path = require('path');


Array.prototype.insert = function(index) {
    this.splice.apply(this, [index, 0].concat(
        Array.prototype.slice.call(arguments, 1)));
    return this;
};



/**
 * Helpers to create simple AST structures
 */
var h = {
	property: function(name, value) {
		return {
			"type": "Property",
	      	"key": {
	         	"type": "Literal",
	         	"value": name
	      	},
	      	"value": value
		};
	},

	literal: function(name) {
		return {
      		"type": "Literal",
         	"value": name
		};
	},

	object: function(properties) {
		return {
			"type": "ObjectExpression",
			"properties": properties
		};
	},

	fct_call: function(name, args) {
		return {
			"type": "CallExpression",
        	"callee": {
            	"type": "Identifier",
            	"name": name
        	},
        	"arguments": args
        };
	}
};



var known_callexpressions = ["file", "stop", "schedule"]




function transformActivityCall(fct_call) {

	var callee_name = fct_call.callee.name;
	var uniqueName = callee_name + "_1";

	var new_fct_node = {
         "type": "ExpressionStatement",
         "expression": fct_call
    };

    fct_call.callee.name = "schedule";

	fct_call.arguments[0] = h.object([
		h.property("name", h.literal(uniqueName) ),
		h.property("activity", h.literal(callee_name) ),
		h.property("input", fct_call.arguments[0] )
	]);


	var return_node = h.fct_call("results", [ h.literal(uniqueName) ]);

	var completed_if = {
    	"type": "IfStatement",
     	"test": h.fct_call("completed", [h.literal(uniqueName)]),
     	"consequent": {
        	"type": "BlockStatement",
        	"body": []
     	},
     	"alternate": null
  	};


	return {
		new_fct_node: new_fct_node,
		return_node: return_node,
		completed_if: completed_if
	};
}



function transform(tree) {
    


	var statements = tree.body;


	// Handles a VariableDeclaration :
	var fct_call = statements[0].declarations[0].init;



	var r = transformActivityCall(fct_call);

	statements[0].declarations[0].init = r.return_node;
	statements.insert(0, r.new_fct_node);
	statements.insert(1, r.completed_if);



    return tree;

};    



var code = fs.readFileSync('src_test.js').toString();
var tree = esprima.parse(code, { /*range: true, tokens: true, comment: true*/ });
var tree_ret = transform(tree);
var ret = escodegen.generate(tree_ret, {
    comment: true,
    format: {
        safeConcatenation: true,
        quotes: "double" // make it easier to export to json
    }
});
fs.writeFileSync('out_test.js', ret);


