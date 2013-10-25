"use strict";

/*
Almost unlimited number of cells: ECMA, array length: unsigned 32-bit
integer, 2^31-1 = 4,294,967,295.

Negative pointer values are also valid, but they are stored in a separate
tape. This means that the total tape length is 2*2^32-1 = 8.589.934.590.

The state of the program when the pointer is outside these valid ranges is
undefined.

Each cell stores an IEEE 754 double-precision integer (64 bits), so negative
numbers and utf8 multibyte characters are allowed
*/

var readline = require ("readline");

var syntaxError = function (message, line, column){
	console.error ("SyntaxError: " + message + " line " + line + ", column " +
			column);
	process.exit (1);
};

module.exports = function (code, input){
	var stdin = typeof input !== "string";
	var tape = [0];
	var tapeNegative = [];
	var ptr = 0;
	var stack = [];
	var line = 1;
	var column = 1;
	var c;
	var resumeIndex;
	var skip;
	var stdout;
	var str = "";

	var prompt = function (){
		//Hack to wake up the stdout stream, otherwise it doesn't print messages
		if (prompt._called){
			console.log ();
		}else{
			prompt._called = true;
		}
		var rl = readline.createInterface({
		  input: process.stdin,
		  output: process.stdout
		});
		rl.setPrompt ("> ", 2);
		rl.on ("line", function (line){
			if (!line){
				//Empty line, prompt again
				rl.setPrompt ("> (again) ");
				rl.prompt ();
				return;
			}
			tape[ptr] = line.charCodeAt (0);
			this.close ();
		});
		rl.on ("close", function (){
			run (resumeIndex);
		});
		rl.on ("SIGINT", function (){
			process.stdout.write ("\n");
			process.exit ();
		});
		rl.prompt ();
	};

	var run = function (start){
		for (var i=start, ii=code.length; i<ii; i++, column++){
			c = code.charCodeAt (i);

			//Skip the tokens until ], this only applies when the loop is never
			//executed
			if (skip){
				if (c === 91){
					//[
					skip.depth++;
				}else if (c === 93){
					//]
					if (!skip.depth){
						skip = null;
					}else{
						skip.depth--;
					}
				}else if (c === 10){
					//\n
					line++;
					column = 0;
				}
				continue;
			}

			if (c === 43){
				//+
				if (ptr >= 0){
					tape[ptr]++;
				}else{
					tapeNegative[-ptr]++;
				}
			}else if (c === 45){
				//-
				if (ptr >= 0){
					tape[ptr]--;
				}else{
					tapeNegative[-ptr]--;
				}
			}else if (c === 62){
				//>
				//Set to 0 if it's the first access
				if (++ptr >= 0){
					if (tape[ptr] === undefined) tape[ptr] = 0;
				}else{
					if (tapeNegative[-ptr] === undefined) tapeNegative[-ptr] = 0;
				}
			}else if (c === 60){
				//<
				//Set to 0 if it's the first access
				if (--ptr < 0 && tapeNegative[-ptr] === undefined){
					tapeNegative[-ptr] = 0;
				}
			}else if (c === 91){
				//[
				var t;
				var p;
				if (ptr >= 0){
					t = tape;
					p = ptr;
				}else{
					t = tapeNegative;
					p = -ptr;
				}

				if (t[p]){
					stack.push ({ start: i, line: line, column: column });
				}else{
					//Skip to the closing ]
					skip = {
						line: line,
						column: i + 1,
						depth: 0
					};
				}
			}else if (c === 93){
				//]
				var el = stack.pop ();
				if (el === undefined){
					//Missing openning [
					syntaxError ("Missing openning '[' for matching ']' at", line,
							column);
				}else{
					var t;
					var p;
					if (ptr >= 0){
						t = tape;
						p = ptr;
					}else{
						t = tapeNegative;
						p = -ptr;
					}

					if (t[p]){
						//Jump back
						stack.push (el);
						i = el.start;
						line = el.line;
						column = el.column;
					}
				}
			}else if (c === 46){
				//.
				stdout = true;
				var t;
				var p;
				if (ptr >= 0){
					t = tape;
					p = ptr;
				}else{
					t = tapeNegative;
					p = -ptr;
				}
				process.stdout.write (String.fromCharCode (t[p]));
			}else if (c === 44){
				//,
				if (stdin){
					resumeIndex = i + 1;
					prompt ();
					return;
				}else if (input[0]){
					var t;
					var p;
					if (ptr >= 0){
						t = tape;
						p = ptr;
					}else{
						t = tapeNegative;
						p = -ptr;
					}
					t[p] = input[0].charCodeAt (0);
					input = input.slice (1);
				}
				//if there's no more input data to read this token is no-op
			}else if (c === 35){
				//#
				var msg = "";
				if (stdout) msg += "\n";
				stdout = true;
				process.stdout.write (msg +
						JSON.stringify ({
							pointer: ptr,
							tape: { p: tape, n: tapeNegative }
						}) + "\n");
			}else if (c === 10){
				//\n
				line++;
				column = 0;
			}
		}

		//Check missing ]
		if (skip){
			syntaxError ("Missing closing ']' for matching '[' at", skip.line,
					skip.column);
		}else if (stack.length){
			syntaxError ("Missing closing ']' for matching '[' at", stack[0].line,
					column);
		}
	};
	
	run (0);
};