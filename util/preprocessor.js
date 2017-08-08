#!/usr/bin/env node

/**
 * simple text preprocessor for solidity files
 * extends https://www.npmjs.com/package/preprocessor with inline includes.
 */

/* eslint no-console: 0 */

var fs = require('fs');
var Preprocessor = require('preprocessor');

var sol_processor = function(inputfile, outputfile, defines) {


	var content = fs.readFileSync(inputfile).toString();

	var matches = content.match(/@@include\(\'[^\)]*\'\)/g);
	var includes = [];
	for (var idx in matches) {
		var filename = matches[idx].slice(11,-2);
		if (typeof includes[filename] == 'undefined') includes[filename] =  fs.readFileSync(filename).toString();
		content = content.replace(matches[idx], includes[filename]);
	}

	fs.writeFileSync(outputfile, new Preprocessor(content).process(defines));

};

var preprocess_contracts = function(sourceDir, destinationDir, defines) {

	var contracts = fs.readdirSync(sourceDir)
		.filter(function(elem) {return elem.match(/.sol$/);});
	// var defines = {};
	// defines[network] = true;
	console.log('Defines: ' + JSON.stringify(defines));
	for (var idx in contracts) {
		console.log('Processing ' + contracts[idx] + ' ...');
		sol_processor(
			sourceDir + contracts[idx], 
			destinationDir + contracts[idx], 
			defines
			);
	}
};

var cmdline = function () {

	var argv = require('optimist')
		.usage('Simple text preprocessor. \nUsage: $0')
		.options('s', {
			alias: 'source',
			description: 'Source Dir',
			demand: true
		})
		.options('d', {
			alias: 'destination',
			description: 'Destination Dir',
			demand: true
		})
		.argv;

	var sourceDir = argv.source;
	if (sourceDir.slice(-1) !== '/' ) sourceDir += '/';
	var destinationDir = argv.destination;
	if (destinationDir.slice(-1) !== '/') destinationDir += '/';
	delete argv._;
	delete argv.$0; 
	delete argv.source;
	delete argv.destination;
	console.log(argv);
	preprocess_contracts(sourceDir, destinationDir, argv);

};

if (typeof process.argv != 'undefined') cmdline();
