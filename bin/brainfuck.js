#!/usr/bin/env node

"use strict";

var fs = require ("fs");
var path = require ("path");
var argp = require ("argp");
var brainfuck = require ("../lib");

var argv = argp.createParser ({ once: true })
		.allowUndefinedArguments ()
		.readPackage (__dirname + "/../package.json")
		.usages (["brainfuck [options] <input_file>"])
		.on ("argument", function (argv, argument, ignore){
			if (argv.file) this.fail ("Too many arguments.");
			argv.file = argument;
			ignore ();
		})
		.on ("end", function (argv){
			if (!argv.file) this.fail ("An input file is required");
		})
		.body ()
				.option ({ short: "i", long: "input", metavar: "STRING",
						description: "STRING to read during the program execution" })
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
				brainfuck (data, argv.input);
			});
		}else{
			console.error ("Error: " + err.message);
		}
		return;
	}
	brainfuck (data, argv.input);
});