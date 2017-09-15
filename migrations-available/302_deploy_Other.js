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


module.exports = (deployer, networks, accounts) => {
    let controller;
    let MultiSigWallet;

    log.info('Deploy FlightDelayController contract');

    return deployer
    // Deploy contracts
        .deploy(FlightDelayController)
        .then(() => log.info('Deploy other contracts'))
        .then(() => deployer.deploy(FlightDelayAccessController, FlightDelayController.address))
        .then(() => deployer.deploy(FlightDelayDatabase, FlightDelayController.address))
        .then(() => deployer.deploy(FlightDelayLedger, FlightDelayController.address))
        .then(() => deployer.deploy(FlightDelayNewPolicy, FlightDelayController.address))
        .then(() => deployer.deploy(FlightDelayUnderwrite, FlightDelayController.address))
        .then(() => deployer.deploy(FlightDelayPayout, FlightDelayController.address))
        .then(() => log.info(`Deploy MultiSigWallet with owner ${accounts[1]}`))
        .then(() => require('../ci-cd/MultiSigWallet')([accounts[1]], 1, networks))
        .then((w) => MultiSigWallet = w)


        // Save link to controller instance
        .then(() => log.info('Save link to controller instance'))
        .then(() => FlightDelayController.deployed())
        .then((_i) => { controller = _i; return Promise.resolve(); })

        // Register contracts
        .then(() => log.info('Register contracts'))
        .then(() => controller.registerContract(accounts[2], 'FD.Funder', false))
        .then(() => controller.registerContract(accounts[3], 'FD.CustomersAdmin', false))
        .then(() => controller.registerContract(accounts[4], 'FD.Emergency', false))

        .then(() => log.info('Register other contracts'))
        .then(() => controller.registerContract(FlightDelayAccessController.address, 'FD.AccessController', true))
        .then(() => controller.registerContract(FlightDelayDatabase.address, 'FD.Database', true))
        .then(() => controller.registerContract(FlightDelayLedger.address, 'FD.Ledger', true))
        .then(() => controller.registerContract(FlightDelayNewPolicy.address, 'FD.NewPolicy', true))
        .then(() => controller.registerContract(FlightDelayUnderwrite.address, 'FD.Underwrite', true))
        .then(() => controller.registerContract(FlightDelayPayout.address, 'FD.Payout', true))

        // Setup contracts
        .then(() => log.info('Setup contracts'))
        .then(() => controller.setAllContracts())

        // Set new owner
        .then(() => log.info(`Set new owner to ${MultiSigWallet.options.address}`))
        .then(() => controller.transferOwnership(MultiSigWallet.options.address))

        // Fund FD.Ledger
        .then(() => log.info('Fund FD.Ledger'))
        .then(() => FlightDelayLedger.deployed())
        .then(FD_LG => FD_LG.fund({ from: accounts[2], value: web3.toWei(0.1, 'ether'), }))

        // Fund FD.Underwrite
        .then(() => log.info('Fund FD.Underwrite'))
        .then(() => FlightDelayUnderwrite.deployed())
        .then(FD_UW => FD_UW.fund({ from: accounts[2], value: web3.toWei(0.1, 'ether'), }))

        // Fund FD.Payout
        .then(() => log.info('Fund FD.Payout'))
        .then(() => FlightDelayPayout.deployed())
        .then(FD_PY => FD_PY.fund({ from: accounts[2], value: web3.toWei(0.1, 'ether'), }))

        .then(() => {
            log.info(`FD.Owner: ${MultiSigWallet.options.address}`);
            log.info(`FD.Funder: ${accounts[2]}`);
            log.info(`FD.CustomersAdmin: ${accounts[3]}`);
            log.info(`FD.Emeregency: ${accounts[4]}`);
            log.info(`FD.Controller: ${FlightDelayController.address}`);
            log.info(`FD.AccessController: ${FlightDelayAccessController.address}`);
            log.info(`FD.Database: ${FlightDelayDatabase.address}`);
            log.info(`FD.Ledger: ${FlightDelayLedger.address}`);
            log.info(`FD.NewPolicy: ${FlightDelayNewPolicy.address}`);
            log.info(`FD.Underwrite: ${FlightDelayUnderwrite.address}`);
            log.info(`FD.Payout: ${FlightDelayPayout.address}`);
        });
};
