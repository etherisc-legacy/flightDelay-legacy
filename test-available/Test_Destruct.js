/**
 * Unit tests for FlightDelayNewPolicy
 *
 * @author Christoph Mussenbrock
 * @description t.b.d
 * @copyright (c) 2017 etherisc GmbH
 *
 */

const log = require('../util/logger');

const FlightDelayAccessController = artifacts.require('FlightDelayAccessController');
const FlightDelayController = artifacts.require('FlightDelayController');
const FlightDelayDatabase = artifacts.require('FlightDelayDatabase');
const FlightDelayLedger = artifacts.require('FlightDelayLedger');
const FlightDelayNewPolicy = artifacts.require('FlightDelayNewPolicy');
const FlightDelayUnderwrite = artifacts.require('FlightDelayUnderwrite');
const FlightDelayPayout = artifacts.require('FlightDelayPayout');


contract('Test group: Destruct all contracts', (accounts) => {
    it('should destroy all contracts and refund to owner', async () => {
        const instances = {};
        let grandTotal = 0;

        instances.CT = await FlightDelayController.deployed();
        instances.AC = await FlightDelayAccessController.deployed();
        instances.DB = await FlightDelayDatabase.deployed();
        instances.LG = await FlightDelayLedger.deployed();
        instances.NP = await FlightDelayNewPolicy.deployed();
        instances.UW = await FlightDelayUnderwrite.deployed();
        instances.PY = await FlightDelayPayout.deployed();

        const accountBalance = web3.fromWei(await web3.eth.getBalance(accounts[1]), 'ether').toFixed(2);
        grandTotal += Number(accountBalance);
        log.info(`Acc Balance before: ${grandTotal}`);

        const CTBalance = web3.fromWei(await web3.eth.getBalance(instances.CT.address), 'ether').toFixed(2);
        grandTotal += Number(CTBalance);
        log.info(`CT Balance: ${CTBalance}`);

        const LGBalance = web3.fromWei(await web3.eth.getBalance(instances.LG.address), 'ether').toFixed(2);
        grandTotal += Number(LGBalance);
        log.info(`LG Balance: ${LGBalance}`);

        const UWBalance = web3.fromWei(await web3.eth.getBalance(instances.UW.address), 'ether').toFixed(2);
        grandTotal += Number(UWBalance);
        log.info(`UW Balance: ${UWBalance}`);

        const PYBalance = web3.fromWei(await web3.eth.getBalance(instances.PY.address), 'ether').toFixed(2);
        grandTotal += Number(PYBalance);
        log.info(`PY Balance: ${PYBalance}`);

        const { logs, } = await instances.CT.destructAll({
            from: accounts[1],
            gas: 4700000,
        });

        console.log(logs);

        const newBalance = web3.fromWei(await web3.eth.getBalance(accounts[1]), 'ether').toFixed(2);
        grandTotal -= newBalance;
        log.info(`Acc. Balance after: ${newBalance}`);
        log.info(`Diff              : ${grandTotal.toFixed(2)}`);

        assert(grandTotal < 0.1, 'Diff should be less than 0.01 ETH');
    });
});
