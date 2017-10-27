/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploys all the contracts and
 * @copyright (c) 2017 etherisc GmbH
 *
 */

const fs = require('fs');
const log = require('../util/logger');

const FlightDelayController = artifacts.require('FlightDelayController.sol');
const FlightDelayAccessController = artifacts.require('FlightDelayAccessController.sol');
const FlightDelayDatabase = artifacts.require('FlightDelayDatabase.sol');
const FlightDelayLedger = artifacts.require('FlightDelayLedger.sol');
const FlightDelayNewPolicy = artifacts.require('FlightDelayNewPolicy.sol');
const FlightDelayUnderwrite = artifacts.require('FlightDelayUnderwrite.sol');
const FlightDelayPayout = artifacts.require('FlightDelayPayout.sol');

const scanChain = {};
scanChain.contracts = [];

const getBlockTxR = bn =>
    web3.eth.getBlock(bn, true)
        .transactions
        .map((elem) => {
            const txr = web3.eth.getTransactionReceipt(elem.hash);
            if (typeof txr.contractAddress !== 'undefined' && txr.contractAddress !== '' && txr.contractAddress !== null) {
                // log(txr.contractAddress, ' : ', txr.gasUsed);
                scanChain.contracts[txr.contractAddress] = txr.gasUsed;
            }
            return txr;
        });

scanChain.getAllBlocks = () => {
    const lastBlock = JSON.parse(fs.readFileSync('blockNumber.json')).blockNumber;

    for (let i = 302; i <= lastBlock; i += 1) {
        getBlockTxR(i);
    }
};

module.exports = (deployer) => { // eslint-disable-line
    scanChain.getAllBlocks();

    log('!!!!FlightDelayController      : ', scanChain.contracts[FlightDelayController.address]);
    log('FlightDelayAccessController: ', scanChain.contracts[FlightDelayAccessController.address]);
    log('FlightDelayDatabase        : ', scanChain.contracts[FlightDelayDatabase.address]);
    log('FlightDelayLedger          : ', scanChain.contracts[FlightDelayLedger.address]);
    log('FlightDelayNewPolicy       : ', scanChain.contracts[FlightDelayNewPolicy.address]);
    log('FlightDelayUnderwrite      : ', scanChain.contracts[FlightDelayUnderwrite.address]);
    log('FlightDelayPayout          : ', scanChain.contracts[FlightDelayPayout.address]);

    log('BlockNumber: ', web3.eth.blockNumber);
};
