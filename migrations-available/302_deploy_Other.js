/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploy FlightDelayController
 * @copyright (c) 2017 etherisc GmbH
 *
 */
const truffle = require('../truffle.js');
const log = require('../util/logger');

const FlightDelayAddressResolver = artifacts.require('FlightDelayAddressResolver.sol');
const FlightDelayController = artifacts.require('FlightDelayController.sol');
const FlightDelayAccessController = artifacts.require('FlightDelayAccessController.sol');
const FlightDelayDatabase = artifacts.require('FlightDelayDatabase.sol');
const FlightDelayLedger = artifacts.require('FlightDelayLedger.sol');
const FlightDelayNewPolicy = artifacts.require('FlightDelayNewPolicy.sol');
const FlightDelayUnderwrite = artifacts.require('FlightDelayUnderwrite.sol');
const FlightDelayPayout = artifacts.require('FlightDelayPayout.sol');


module.exports = (deployer, network, accounts) => {
    let controller;
    let database;

    const fund = value =>
        web3.toWei(value, 'ether');

    log.info('Deploy FlightDelayController contract');

    return deployer
        // Deploy contracts
        .deploy(FlightDelayController)
        .then(() => log.info('Deploy contracts'))
        .then(() => deployer.deploy(FlightDelayAccessController, FlightDelayController.address))
        .then(() => deployer.deploy(FlightDelayDatabase, FlightDelayController.address))
        .then(() => deployer.deploy(FlightDelayLedger, FlightDelayController.address))
        .then(() => deployer.deploy(FlightDelayNewPolicy, FlightDelayController.address))
        .then(() => deployer.deploy(FlightDelayUnderwrite, FlightDelayController.address))
        .then(() => deployer.deploy(FlightDelayPayout, FlightDelayController.address))

        // Get controller instance
        .then(() => FlightDelayController.deployed())
        .then((_i) => { controller = _i; return Promise.resolve(); })

        // Register contracts
        .then(() => log.info('Register administators'))
        .then(() => controller.registerContract(network === 'mainnet' ? truffle.networks[network].funder : accounts[0], 'FD.Funder', false))

        .then(() => controller.registerContract(accounts[1], 'FD.CustomersAdmin', false))
        .then(() => controller.registerContract(accounts[0], 'FD.Emergency', false))

        .then(() => log.info('Register contracts'))
        .then(() => controller.registerContract(FlightDelayAccessController.address, 'FD.AccessController', true))
        .then(() => controller.registerContract(FlightDelayDatabase.address, 'FD.Database', true))
        .then(() => controller.registerContract(FlightDelayLedger.address, 'FD.Ledger', true))
        .then(() => controller.registerContract(FlightDelayNewPolicy.address, 'FD.NewPolicy', true))
        .then(() => controller.registerContract(FlightDelayUnderwrite.address, 'FD.Underwrite', true))
        .then(() => controller.registerContract(FlightDelayPayout.address, 'FD.Payout', true))

        // Set new owner
        .then(() => log.info('Transfer ownership'))
        .then(() => controller.transferOwnership(accounts[0]))

        // Setup contracts
        .then(() => log.info('Setup contracts'))
        .then(() => controller.setAllContracts({from: accounts[0]}))

        .then(() => FlightDelayDatabase.deployed())
        .then((_d) => { database = _d; return Promise.resolve(); })
        // Setup valid origin airports
        // .then(() => {
        //     if (network === 'development') {
        //         return database.addOrigin('"JFK"', { from: accounts[1], })
        //     }
        //     return Promise.resolve();
        // })
        // .then(() => database.addOrigin('"ZRH"', { from: accounts[1], }))
        // .then(() => database.addOrigin('"SFO"', { from: accounts[1], }))
        // .then(() => database.addOrigin('"SJC"', { from: accounts[1], }))
        // .then(() => database.addOrigin('"OAK"', { from: accounts[1], }))
        // // Setup valid destination airports
        // .then(() => {
        //     if (network === 'development') {
        //         return database.addDestination('"JFK"', { from: accounts[1], })
        //     }
        //     return Promise.resolve();
        // })
        // .then(() => database.addDestination('"ZRH"', { from: accounts[1], }))
        // .then(() => database.addDestination('"SFO"', { from: accounts[1], }))
        // .then(() => database.addDestination('"SJC"', { from: accounts[1], }))
        // .then(() => database.addDestination('"OAK"', { from: accounts[1], }))
        // Setup min and max departure timestamps
        .then(() => database.setMinDepartureLim(1512950400, { from: accounts[0], }))
        .then(() => database.setMaxDepartureLim(1986422400, { from: accounts[0], }))

        // Fund Contracts
        .then(() => {
            if (network !== 'mainnet') {
                return FlightDelayController.deployed()

                    // Fund FD.Ledger
                    .then(() => log.info('Fund FD.Ledger'))
                    .then(() => FlightDelayLedger.deployed())
                    .then(FD_LG => FD_LG.sendTransaction({from: accounts[0], value: fund(6)}))

                    // Fund FD.Underwrite
                    .then(() => log.info('Fund FD.Underwrite'))
                    .then(() => FlightDelayUnderwrite.deployed())
                    .then(FD_UW => FD_UW.sendTransaction({from: accounts[0], value: fund(2)}))

                    // Fund FD.Payout
                    .then(() => log.info('Fund FD.Payout'))
                    .then(() => FlightDelayPayout.deployed())
                    .then(FD_PY => FD_PY.sendTransaction({from: accounts[0], value: fund(2)}))
            }

            return Promise.resolve();
        })

        // Deploy AddressResolver on Testrpc
        .then(() => {
            if (network === 'development') {
                // todo: check the account nonce, determine if we really need to deploy AR
                return deployer.deploy(FlightDelayAddressResolver)
                    .then(() => FlightDelayAddressResolver.deployed())
                    .then(AR => AR.setAddress(FlightDelayNewPolicy.address));
            } else if (network === 'kovan') {
                const { addressResolver, } = truffle.networks[network];
                FlightDelayAddressResolver.at(addressResolver)
                    .setAddress(FlightDelayNewPolicy.address);

                return Promise.resolve();
            }
            return Promise.resolve();
        })

        .then(() => {
            log.info(`Deployer: ${accounts[0]}`);
            log.info(`FD.Owner: ${accounts[0]}`);
            log.info(`FD.Funder: ${network === 'mainnet' ? truffle.networks[network].funder : accounts[0]}`);
            log.info(`FD.CustomersAdmin: ${accounts[1]}`);
            log.info(`FD.Emergency: ${accounts[0]}`);
            log.info(`FD.Controller: ${FlightDelayController.address}`);
            log.info(`FD.AccessController: ${FlightDelayAccessController.address}`);
            log.info(`FD.Database: ${FlightDelayDatabase.address}`);
            log.info(`FD.Ledger: ${FlightDelayLedger.address}`);
            log.info(`FD.NewPolicy: ${FlightDelayNewPolicy.address}`);
            log.info(`FD.Underwrite: ${FlightDelayUnderwrite.address}`);
            log.info(`FD.Payout: ${FlightDelayPayout.address}`);
            log.info(`FD.AddressResolver: ${FlightDelayAddressResolver.address}`);
        });
};
