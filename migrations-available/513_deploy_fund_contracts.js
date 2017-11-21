/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploy FlightDelayController
 * @copyright (c) 2017 etherisc GmbH
 *
 */
const log = require('../util/logger');

const FlightDelayPayout = artifacts.require('FlightDelayPayout.sol');
const FlightDelayUnderwrite = artifacts.require('FlightDelayUnderwrite.sol');
const FlightDelayLedger = artifacts.require('FlightDelayLedger.sol');

module.exports = (deployer, network, accounts) => {

    log.info('Fund contracts');

    const fundAddress = '0x6f692c070f3263d1c3400367832faf5ccc6cd2f2';

    deployer.then(async () => {

        log.info('Fund Payout');
        await web3.eth.sendTransaction({ from: fundAddress, to: FlightDelayPayout.address, value: web3.toWei(0.5, 'ether'), });
        log.info('Fund Underwrite');
        await web3.eth.sendTransaction({ from: fundAddress, to: FlightDelayUnderwrite.address, value: web3.toWei(0.5, 'ether'), });
        log.info('Fund Ledger');
        await web3.eth.sendTransaction({ from: fundAddress, to: FlightDelayLedger.address, value: web3.toWei(5, 'ether'), });


    });
};
