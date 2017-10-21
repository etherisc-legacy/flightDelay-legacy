/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploy FlightDelayController
 * @copyright (c) 2017 etherisc GmbH
 *
 */
const deployment = require('../deployment.js');
const log = require('../util/logger');

const FlightDelayController = artifacts.require('FlightDelayController.sol');
const FlightDelayAccessController = artifacts.require('FlightDelayAccessController.sol');
const FlightDelayDatabase = artifacts.require('FlightDelayDatabase.sol');
const FlightDelayLedger = artifacts.require('FlightDelayLedger.sol');
const FlightDelayNewPolicy = artifacts.require('FlightDelayNewPolicy.sol');
const FlightDelayUnderwrite = artifacts.require('FlightDelayUnderwrite.sol');
const FlightDelayPayout = artifacts.require('FlightDelayPayout.sol');

module.exports = (deployer, network) =>

    deployer.then(async () => {

        const controller = await FlightDelayController.deployed();

        log.info('Register Admin Addresses');
        await controller.registerContract(deployment.networks[network].FD.funder, 'FD.Funder', false);
        await controller.registerContract(deployment.networks[network].FD.CustomersAdmin, 'FD.CustomersAdmin', false);
        await controller.registerContract(deployment.networks[network].FD.Emergency, 'FD.Emergency', false);

        log.info('Register contracts');
        await controller.registerContract(FlightDelayAccessController.address, 'FD.AccessController', true);
        await controller.registerContract(FlightDelayDatabase.address, 'FD.Database', true);
        await controller.registerContract(FlightDelayLedger.address, 'FD.Ledger', true);
        await controller.registerContract(FlightDelayNewPolicy.address, 'FD.NewPolicy', true);
        await controller.registerContract(FlightDelayUnderwrite.address, 'FD.Underwrite', true);
        await controller.registerContract(FlightDelayPayout.address, 'FD.Payout', true);

    });
