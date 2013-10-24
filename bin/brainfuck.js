#!/usr/bin/env node

"use strict";

var fs = require ("fs");
var path = require ("path");
var brainfuck = require ("../lib");

var argv = require ("argp")
		.allowUndefinedArguments ()
		.readPackage (__dirname + "/../package.json")
		.usages (["brainfuck <input_file> [options]"])
		.on ("argument", function (argv, argument, ignore){
			if (argv.file) this.fail ("Too many arguments");
			argv.file = argument;
			ignore ();
		})
		.on ("end", function (argv, printHelp, printUsage, printVersion, fail){
			if (!argv.file) fail ("An input file is required");
		})
		.body ()
				.option ({ long: "stdin", metavar: "STRING",
						description: "STRING to read during the program execution" })
				.option ({ short: "f", long: "finish", description: "Finish the " +
						"program execution when all the --stdin STRING has been consumed " +
						"and a new read operation it's done. The flag is ignored if the " +
						"--stdin option is not used. This is typically used when the " +
						"program loops indefinitely reading the --stdin STRING without " +
						"knowning its length" })
				.help ()
		.argv ();

fs.readFile (argv.file, { encoding: "utf8" }, function (err, data){
	if (err){
		if (path.extname (argv.file) === ""){
			fs.readFile (argv.file + ".bf", { encoding: "utf8" },
					function (error, data){
				if (error){
					//If <file>.bf doesn't exist, show <file>'s error
					return console.error ("Error: " +
							(error.code !== "ENOENT" ? error : err).message);
				}
				brainfuck (data, argv.stdin, { finishOnInputConsumed: argv.finish });
			});
		}else{
			console.error ("Error: " + err.message);
		}
		return;
	}
	brainfuck (data, argv.stdin, { finishOnInputConsumed: argv.finish });
});