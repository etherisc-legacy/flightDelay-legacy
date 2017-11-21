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

const FlightDelayAddressResolver = artifacts.require('FlightDelayAddressResolver');
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
        log.info('FD.Funder', deployment.networks[network].FD.funder);
        await controller.registerContract(deployment.networks[network].FD.funder, 'FD.Funder', false);
        log.info('FD.CustomersAdmin', deployment.networks[network].FD.CustomersAdmin);
        await controller.registerContract(deployment.networks[network].FD.CustomersAdmin, 'FD.CustomersAdmin', false);
        log.info('FD.Emergency', deployment.networks[network].FD.Emergency);
        await controller.registerContract(deployment.networks[network].FD.Emergency, 'FD.Emergency', false);

        log.info('Register contracts');
        log.info('FD.AccessController');
        await controller.registerContract(FlightDelayAccessController.address, 'FD.AccessController', true);
        log.info('FD.Database');
        await controller.registerContract(FlightDelayDatabase.address, 'FD.Database', true);
        log.info('FD.Ledger');
        await controller.registerContract(FlightDelayLedger.address, 'FD.Ledger', true);
        log.info('FD.NewPolicy');
        await controller.registerContract(FlightDelayNewPolicy.address, 'FD.NewPolicy', true);
        log.info('FD.Underwrite');
        await controller.registerContract(FlightDelayUnderwrite.address, 'FD.Underwrite', true);
        log.info('FD.Payout');
        await controller.registerContract(FlightDelayPayout.address, 'FD.Payout', true);
        log.info('controller.setAllContracts');
        await controller.setAllContracts();
        log.info('AddressResolver setAddress');
        await FlightDelayAddressResolver.at('0x63338bB37Bc3A0d55d2E9505F11E56c613b51494').setAddress(FlightDelayNewPolicy.address);

    });
