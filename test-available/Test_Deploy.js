/**
 * Unit tests for deploy
 *
 * @author Christoph Mussenbrock
 * @description t.b.d
 * @copyright (c) 2017 etherisc GmbH
 *
 */

const utils = require('../util/test-utils.js');

const FlightDelayController = artifacts.require('FlightDelayController');
const FlightDelayAccessController = artifacts.require('FlightDelayAccessController');
const FlightDelayDatabase = artifacts.require('FlightDelayDatabase');
const FlightDelayLedger = artifacts.require('FlightDelayLedger');
const FlightDelayNewPolicy = artifacts.require('FlightDelayNewPolicy');
const FlightDelayUnderwrite = artifacts.require('FlightDelayUnderwrite');
const FlightDelayPayout = artifacts.require('FlightDelayPayout');
const MultiSigWallet = artifacts.require('MultiSigWallet');

const contractLabel = contract => web3.toUtf8(contract);

contract('After deploy', (accounts) => {
    let FDC;
    let FD_DB;
    let MS_W;

    const contracts = {
        'FD.Owner': MultiSigWallet,
        'FD.Controller': FlightDelayController,
        'FD.Funder': accounts[2],
        'FD.CustomersAdmin': accounts[3],
        'FD.Emergency': accounts[4],
        'FD.AccessController': FlightDelayAccessController,
        'FD.Database': FlightDelayDatabase,
        'FD.Ledger': FlightDelayLedger,
        'FD.NewPolicy': FlightDelayNewPolicy,
        'FD.Underwrite': FlightDelayUnderwrite,
        'FD.Payout': FlightDelayPayout,
    };

    const ledger = {
        Premium: 0,
        RiskFund: 50000000000000000000,
        Payout: 0,
        Balance: -50000000000000000000,
        Reward: 0,
        OraclizeCosts: 0,
    };

    before(async () => {
        FDC = await FlightDelayController.deployed();
        FD_DB = await FlightDelayDatabase.deployed();
        MS_W = await MultiSigWallet.deployed();
    });

    Object.keys(contracts).forEach((key, i) =>
        it(`should have ${key} registered properly`, async () => {
            const label = contractLabel(await FDC.contractIds(i));
            const address = await FDC.contracts(label);

            assert.equal(key, label);
            assert.equal(address[1], contracts[key].address || contracts[key]);
        })
    );

    Object.keys(ledger).forEach((key, i) => {
        it(`${key} in FD.Database should be set to ${ledger[key]}`, async () => {
            const value = await FD_DB.ledger(i);
            assert.equal(ledger[key], value.valueOf());
        });
    });

    it('should throw on invalid index in ledger', async () => {
        try {
            await FD_DB.ledger(6);
            assert.fail('should have thrown before');
        } catch (error) {
            utils.assertJump(error);
        }
    });

    after(async () => {
        if (web3.version.network > 1000) {
            // await FDC.destructAll({ from: accounts[1], gas: 4700000, });
            const data = web3.eth.contract(FDC.abi).at(FDC.address).destructAll.getData();
            web3.eth.defaultAccount = accounts[1];
            web3.eth.contract(MS_W.abi).at(MS_W.address).submitTransaction(FlightDelayNewPolicy.address, 0, data, 4700000, {
                from: accounts[1],
                gas: 600000
            });
        }
    });
});
