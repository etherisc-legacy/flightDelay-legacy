/* eslint-disable no-underscore-dangle */
const utils = require('../util/test-utils.js');

const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();


contract('FlightDelayLedger', (accounts) => {
    let FD;

    before(async () => {
        FD = await utils.getDeployedContracts(artifacts);
    });

    /*
     * Initilization
     */
    it('Controller should be set to FD.Controller', async () => {
        const controller = await FD.LG.controller.call();
        controller.should.be.equal(FD.C.address);
    });

    it('FD.Ledger should be registered in FD.Controller', async () => {
        const addr = await FD.C.getContract.call('FD.Ledger');
        addr.should.be.equal(FD.LG.address);
    });

    /*
     * ConrollerContract functionality
     */
    // todo: check onlyController

    // todo: test setController

    // todo: test getContract

    /*
     * setContracts tests
     */
    it('Should not be accessed from external account', async () => {
        await FD.LG.setContracts()
            .should.be.rejectedWith(utils.EVMThrow);
    });

    // todo: check permission to methods

    /*
     * fund tests
     */
    it('Should accept ETH from FD.Funder', async () => {
        const balanceBefore = web3.eth.getBalance(FD.LG.address);
        const value = web3.toWei(10, 'ether');

        try {
            await FD.LG.fund({ from: accounts[2], value, });
            assert.ok('should not be rejected');
        } catch (error) {
            utils.assertJump(error);
        }

        const balanceAfter = web3.eth.getBalance(FD.LG.address);

        Number(balanceAfter).should.be.greaterThan(Number(balanceBefore));
        Number(balanceAfter).should.be.equal(Number(value) + Number(balanceBefore));
    });

    it('should not accept ETH from other accounts', async () => {
        try {
            await FD.LG.fund({ from: accounts[1], value: web3.toWei(10, 'ether'), });
            assert.fail('should be rejected');
        } catch (error) {
            utils.assertJump(error);
        }
    });

    /*
     * receiveFunds test
     */
    it('receiveFunds should receive funds and make bookkeeping', async () => {
        await FD.DB.setAccessControlTestOnly(FD.LG.address, accounts[0], 101, true);
        await FD.DB.setAccessControlTestOnly(FD.LG.address, accounts[0], 103, true);

        const value = web3.toWei(5, 'ether');

        const balanceBefore = web3.eth.getBalance(FD.LG.address);

        const l3before = await FD.DB.ledger(3);
        const l0before = await FD.DB.ledger(0);

        const { logs, } = await FD.LG.receiveFunds(0, { value, });

        const log = logs[0];

        log.event.should.be.equal('LogReceiveFunds');
        log.args._sender.should.be.equal(accounts[0]);
        Number(log.args._to).should.be.equal(0);
        Number(log.args.ethAmount).should.be.equal(Number(value));

        const balanceAfter = web3.eth.getBalance(FD.LG.address);

        (Number(balanceAfter) - Number(balanceBefore))
            .should.be.equal(Number(value));

        const l3after = await FD.DB.ledger(3);
        const l0after = await FD.DB.ledger(0);

        assert.equal(
            Number(l3before) - Number(value),
            Number(l3after)
        );

        assert.equal(
            Number(l0before) + Number(value),
            Number(l0after)
        );

        await FD.DB.setAccessControlTestOnly(FD.LG.address, accounts[0], 101, false);
        await FD.DB.setAccessControlTestOnly(FD.LG.address, accounts[0], 103, false);
    });

    // todo: test sendFunds

    /*
     * bookkeeping tests
     */
    it('should have equal balances in accounts after booking', async () => {
        await FD.DB.setAccessControlTestOnly(FD.LG.address, accounts[7], 103, true);

        const value = web3.toWei(5, 'ether');

        const balance0before = await FD.DB.ledger(3);
        const balance1before = await FD.DB.ledger(1);

        await FD.LG.bookkeeping(3, 1, value, { from: accounts[7], });

        const balance0after = await FD.DB.ledger(3);
        const balance1after = await FD.DB.ledger(1);

        assert.equal(
            -(Number(balance0after) - Number(balance0before)),
            Number(balance1after) - Number(balance1before),
            'balances are not equal'
        );

        await FD.DB.setAccessControlTestOnly(FD.LG.address, accounts[7], 103, false);
    });

    it('∑ of the ledger accounts should be zero', async () => {
        const b0 = await FD.DB.ledger(0);
        const b1 = await FD.DB.ledger(1);
        const b2 = await FD.DB.ledger(2);
        const b3 = await FD.DB.ledger(3);
        const b4 = await FD.DB.ledger(4);
        const b5 = await FD.DB.ledger(5);

        assert.equal(
            Number(b0) + Number(b1) + Number(b2) + Number(b3) + Number(b4) + Number(b5),
            0
        );
    });

    // todo: test bookkeeping (diffrent variants)
    // todo: should throw on overflow, check if safeMath for various overflows in bookkeeping works
});
