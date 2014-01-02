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



var known_callexpressions = ["file", "stop", "schedule", "scheduled", "completed", "results"];




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


    var scheduled_if = {
        "type": "IfStatement",
        "test": {
            "type": "UnaryExpression",
            "operator": "!",
            "argument": h.fct_call("scheduled", [h.literal(uniqueName)])
        },
        "consequent": {
            "type": "BlockStatement",
            "body": [
                new_fct_node
            ]
        },
        "alternate": null
    };


	return {
		new_fct_node: scheduled_if,
		return_node: return_node,
		completed_if: completed_if
	};
}



function transform(tree) {
    

    var parentObj = tree;
    var statementsAttribute = "body";


	var statements = parentObj[statementsAttribute];



	// Handles a VariableDeclaration :

    var statement_to_transform_index = 1;


    /*
    // For a variable assignment (1-src)
    var var_declartion_stmt = statements[statement_to_transform_index];
	var fct_call = var_declartion_stmt.declarations[0].init;
    var r = transformActivityCall(fct_call);
    var_declartion_stmt.declarations[0].init = r.return_node;
    var other_statements = statements.slice(statement_to_transform_index+1);
    r.completed_if.consequent.body = [
        statements[statement_to_transform_index]
    ].concat(other_statements);
    var new_statements = statements.slice(0,statement_to_transform_index).concat([
        r.new_fct_node,
        r.completed_if
    ]);
    */


    // Without variable => just an expression statement (2-src)
    var expr_stmt = statements[statement_to_transform_index];
    var fct_call = expr_stmt.expression;
    var r = transformActivityCall(fct_call);
    r.completed_if.consequent.body = statements.slice(statement_to_transform_index+1);
    var new_statements = statements.slice(0,statement_to_transform_index).concat([
        r.new_fct_node,
        r.completed_if
    ]);




    parentObj[statementsAttribute] = new_statements;


    return tree;

};    



var code = fs.readFileSync('examples/2-src.js').toString();
var tree = esprima.parse(code, { /*range: true, tokens: true, comment: true*/ });
console.log(JSON.stringify(tree, null, 3));
var tree_ret = transform(tree);
var ret = escodegen.generate(tree_ret, {
    comment: true,
    format: {
        safeConcatenation: true,
        quotes: "double" // make it easier to export to json
    }
});
fs.writeFileSync('examples/2-out.js', ret);


