#!/usr/bin/env node

const os = require('os');
const crypto = require('crypto');
const fs = require('fs-jetpack');
const execSync = require('child_process').execSync;
const log = require('../util/logger');

const compilerVersion = JSON.parse(fs.read('package.json')).config['solidity-compiler'];

/**
 * Preprocess input data with solidity compiler version
 *
 * @param {any} raw file input
 * @returns
 */
function setCompilerVersion(data) {
    return data.replace(/pragma solidity +.*;/, `pragma solidity ${compilerVersion};`);
}


/**
 * Preprocess input data for defined mode
 *
 * @param {any} source raw file input
 * @param {any} regexp regular expression for mode block lookup
 * @param {any} mode on/off defined mode
 * @param {any} label mode label
 * @returns
 */
function setMode(source, regexp, mode, label) {
    let output = source;
    const matches = source.match(regexp);

    if (matches) {
        matches.forEach((match) => {
            const particle = match.split(os.EOL).slice(1, -1);
            const comment = `//${' '.repeat(4)}`;

            let lines;
            if (mode === 'on') {
                lines = particle.map(line => line.replace(comment, ''));
            } else {
                lines = particle.map(line => `${comment}${line.replace(comment, '')}`);
            }

            const newLines = lines.join(os.EOL);

            output = output.replace(match, `--> ${label}-mode${os.EOL}${newLines}${os.EOL}// <-- ${label}-mode`);
        });
    }

    return output;
}

/**
 * Replace source particles with encrypted query for oraclize
 *
 * @param {any} data raw file input
 * @param {any} mode defined mode
 * @returns
 */
function setEncryptedQuery(data, mode) {
    let output = data;
    const regexp = /{\[decrypt\][\s\S]+?}/g;
    const matches = data.match(regexp);

    if (matches) {
        matches.forEach((match) => {
            let encryptedQuery;
            if (mode === 'commit-mode') {
                encryptedQuery = '<!--PUT ENCRYPTED_QUERY HERE--> ';
            } else {
                if(!process.env.APP_ID || !process.env.APP_KEY) {
                    console.log('APP_ID or APP_KEY is not specified');
                    process.exit(1);
                }
                encryptedQuery = execSync('./external/encryptedQuery/createEncryptedQuery.sh').toString().trim();
            }
            output = output.replace(match, `{[decrypt] ${encryptedQuery}}`);
        });
    }

    return output;
}

/**
 * Preprocess source with defined set of deplacements
 *
 * @param {any} input raw file input
 * @returns
 */
function preprocessData(input) {
    let data = input;
    const mode = process.argv[2];
    const debug = process.argv[3] || false;

    const debugRegexp = /--> debug-mode[\s\S]+?<-- debug-mode/g;
    const devRegexp = /--> test-mode[\s\S]+?<-- test-mode/g;
    const prodRegexp = /--> prod-mode[\s\S]+?<-- prod-mode/g;

    // Set solc version
    data = setCompilerVersion(data);

    if (process.env.COMMIT_MODE) {
        data = setEncryptedQuery(data, 'commit-mode');
    }

    // Set defined mode
    if (mode === 'test') {
        data = setMode(data, devRegexp, 'on', 'test');
        data = setMode(data, prodRegexp, 'off', 'prod');
    } else if (mode === 'prod') {
        // Encrypt query
        if (!process.env.COMMIT_MODE) {
            data = setEncryptedQuery(data);
        }

        data = setMode(data, devRegexp, 'off', 'test');
        data = setMode(data, prodRegexp, 'on', 'prod');
    }

    if (debug) {
        data = setMode(data, debugRegexp, 'on', 'debug');
    } else {
        data = setMode(data, debugRegexp, 'off', 'debug');
    }

    return data;
}

/**
 * Preprocess directory with solidity contracts
 *
 * @param {any} dir
 */
function preprocess(dir) {
    fs.find(dir, { matching: '*.sol', })
        .forEach((contract) => {
            const input = fs.read(contract, 'utf8');
            const inputHash = crypto.createHash('md5').update(input).digest('hex');

            const output = preprocessData(input);
            const outputHash = crypto.createHash('md5').update(output).digest('hex');

            if (inputHash !== outputHash) {
                fs.write(contract, output);
                log.info(`${contract} preprocessed`);
            }

            fs.write(contract, output);
        });
}

preprocess('contracts');
preprocess('test-available');
