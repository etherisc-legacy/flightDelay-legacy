/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploy FlightDelayController
 * @copyright (c) 2017 etherisc GmbH
 *
 */

const log = require('../util/logger');

const FlightDelayController = artifacts.require('FlightDelayController.sol');
const FlightDelayAccessController = artifacts.require('FlightDelayAccessController.sol');
const FlightDelayDatabase = artifacts.require('FlightDelayDatabase.sol');
const FlightDelayLedger = artifacts.require('FlightDelayLedger.sol');
const FlightDelayNewPolicy = artifacts.require('FlightDelayNewPolicy.sol');
const FlightDelayUnderwrite = artifacts.require('FlightDelayUnderwrite.sol');
const FlightDelayPayout = artifacts.require('FlightDelayPayout.sol');

module.exports = (deployer) => {
    deployer.deploy(FlightDelayController, { value: web3.toWei(50, 'ether'), })
        .then(() => deployer.deploy(FlightDelayAccessController, FlightDelayController.address))
        .then(() => deployer.deploy(FlightDelayDatabase, FlightDelayController.address))
        .then(() => deployer.deploy(FlightDelayLedger, FlightDelayController.address, { value: web3.toWei(500, 'ether'), }))
        .then(() => deployer.deploy(FlightDelayNewPolicy, FlightDelayController.address))
        .then(() => deployer.deploy(FlightDelayUnderwrite, FlightDelayController.address, { value: web3.toWei(50, 'ether'), }))
        .then(() => deployer.deploy(FlightDelayPayout, FlightDelayController.address, { value: web3.toWei(50, 'ether'), }))
        .then(() => {
            // finish, call setAllContracts on each
            FlightDelayController.deployed()
                .then(instance => instance.setAllContracts({ gas: 3000000, }))
                .then(result => log(result));
        });
};
