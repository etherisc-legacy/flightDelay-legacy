/* eslint-disable no-underscore-dangle */
const utils = require('../util/test-utils.js');

const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

const should = require('chai').should();

contract('FlightDelayDatabase', (accounts) => {
    let FD;
    let riskId;

    before(async () => {
        FD = await utils.getDeployedContracts(artifacts);
    });

    /*
     * Initilization
     */
    it('controller should be set to FD.Controller', async () => {
        const controller = await FD.DB.controller.call();
        controller.should.be.equal(FD.C.address);
    });

    it('FD.Database should be registered in FD.Controller', async () => {
        const addr = await FD.C.getContract.call('FD.Database');
        addr.should.be.equal(FD.DB.address);
    });

    // todo: check onlyController
    // todo: test setContracts - check permissions
    // todo: test setAccessControl 1
    // todo: test setAccessControl 2

    /*
     * setContracts tests
     */
    it('should not be accessed from external account', async () => {
        await FD.DB.setContracts()
            .should.be.rejectedWith(utils.EVMThrow);
    });

    /*
     * setLedger test
     */
    it('setLedger should change specified ledger account', async () => {
        await FD.DB.setAccessControlTestOnly(FD.DB.address, accounts[0], 101, true);

        // 1. +
        const balanceBefore1 = await FD.DB.ledger(0);
        const value1 = '1000000000000000000';
        await FD.DB.setLedger(0, value1);

        const balanceAfter1 = await FD.DB.ledger(0);

        assert.equal(
            Number(balanceAfter1) - Number(balanceBefore1),
            Number(value1)
        );

        assert.equal(
            Number(balanceAfter1),
            Number(value1)
        );

        // 2. -
        const balanceBefore2 = await FD.DB.ledger(4);
        const value2 = '-1000000000000000000';
        await FD.DB.setLedger(4, value2);

        const balanceAfter2 = await FD.DB.ledger(4);

        assert.equal(
            Number(balanceAfter2) - Number(balanceBefore2),
            Number(value2)
        );

        assert.equal(
            Number(balanceAfter2),
            Number(value2)
        );

        // 3. Overflows
        const a = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
        await FD.DB.setLedger(0, a)
            .should.be.rejectedWith(utils.EVMThow());

        const b = -115792089237316195423570985008687907853269984665640564039457584007913129639935;
        await FD.DB.setLedger(0, b)
            .should.be.rejectedWith(utils.EVMThow());

        await FD.DB.setAccessControlTestOnly(FD.DB.address, accounts[0], 101, false);
    });

    /*
     * getLedger test
     */
    it('getLedger should return ledger account by index', async () => {
        const b0 = await FD.DB.ledger(1);
        const balance0 = await FD.DB.getLedger.call(1);

        Number(balance0).should.be.equal(Number(b0));
    });

    /*
     * createUpdateRisk test
     */
    it('createUpdateRisk should store a risk', async () => {
        const dmy = '2017/01/25';
        const minute = 60;
        const hour = 60 * minute;
        const day = 24 * hour;
        const dmyUnix = new Date(dmy).valueOf() / 1000;
        const carrierFlightNumber = 'LH/410';
        const departureYearMonthDay = `/dep/${dmy}`;
        const arrivalTime = dmyUnix + day;

        await FD.DB.setAccessControlTestOnly(FD.DB.address, accounts[0], 101, true);

        const { logs, } = await FD.DB.createUpdateRisk(
            carrierFlightNumber,
            departureYearMonthDay,
            arrivalTime
        );

        should.exist(logs[0]);

        riskId = logs[0].args.hexBytes32;

        const risk = await FD.DB.risks.call(riskId);

        web3.toUtf8(risk[0]).should.be.equal(carrierFlightNumber);
        web3.toUtf8(risk[1]).should.be.equal(departureYearMonthDay);
        Number(risk[2]).should.be.equal(arrivalTime);

        await FD.DB.setAccessControlTestOnly(FD.DB.address, accounts[0], 101, false);
    });

    /*
     * createPolicy test
     */
    it('createPolicy should store a policy', async () => {
        await FD.DB.setAccessControlTestOnly(FD.DB.address, accounts[0], 101, true);

        const { logs, } = await FD.DB.createPolicy(
            accounts[0],
            web3.toWei(1, 'ether'),
            riskId
        );

        should.exist(logs[0]);
        logs[0].args._message.should.be.equal('_policyId');

        const policyId = Number(logs[0].args._uint);

        const policy = await FD.DB.policies.call(policyId);

        policy[0].should.be.equal(accounts[0]);
        policy[1].valueOf().should.be.equal(web3.toWei(1, 'ether'));
        policy[2].should.be.equal(riskId);

        const customerPolicy = await FD.DB.customerPolicies.call(accounts[0], 0);
        Number(customerPolicy).should.be.equal(0);

        await FD.DB.setAccessControlTestOnly(FD.DB.address, accounts[0], 101, false);
    });

    /*
     * getRiskId test
     */
    it('getRiskId should return riskId by policyId', async () => {
        // todo: should it throw if policyId not exist?
        await FD.DB.getRiskId.call(1)
            .should.be.rejectedWith(utils.EVMThow());

        await FD.DB.getRiskId.call(0)
            .should.not.be.rejectedWith(utils.EVMThow());

        const id = await FD.DB.getRiskId.call(0);
        (id.length).should.be.equal(66);
    });

    /*
     * setWeight test
     */
    it('setWeight should set policy weight by policyId', async () => {
        await FD.DB.setAccessControlTestOnly(FD.DB.address, accounts[0], 101, true);

        const policyId = 0;
        await FD.DB.setWeight(policyId, 1000, '123');

        const policy = await FD.DB.policies.call(policyId);

        assert(
            Number(policy[3]),
            1000,
            'Weight should be set'
        );

        assert(
            web3.toUtf8(policy[9]),
            123,
            'Proof should be set'
        );

        await FD.DB.setAccessControlTestOnly(FD.DB.address, accounts[0], 101, false);
    });

    /*
     * setPayouts test
     */
    it('setPayouts should set calculated and actual payouts', async () => {
        await FD.DB.setAccessControlTestOnly(FD.DB.address, accounts[0], 101, true);

        const policyId = 0;
        await FD.DB.setPayouts(policyId, 1, 2);

        const policy = await FD.DB.policies.call(policyId);

        assert(
            Number(policy[4]),
            1,
            'calculatedPayout should be set'
        );

        assert(
            Number(policy[5]),
            2,
            'actualPayout should be set'
        );

        await FD.DB.setAccessControlTestOnly(FD.DB.address, accounts[0], 101, false);
    });

    /*
     * getPolicyData test
     */
    it('getPolicyData should return customer, weight, premium for specified policy', async () => {
        const data = await FD.DB.getPolicyData.call(0);

        data[0].should.be.equal(accounts[0]);
        Number(data[1]).should.be.equal(1000);
        data[2].valueOf().should.be.equal(web3.toWei(1, 'ether'));
    });

    /*
     * setState test
     */
    it('setState shoud set policy state', async () => {
        await FD.DB.setAccessControlTestOnly(FD.DB.address, accounts[0], 101, true);

        const { logs, } = await FD.DB.setState(0, 2, 1504719597917, 'message')
            .should.not.be.rejectedWith(utils.EVMThow());

        const policy = await FD.DB.policies(0);

        policy[6].valueOf().should.be.equal('2');
        policy[7].valueOf().should.be.equal('1504719597917');
        web3.toUtf8(policy[8]).should.be.equal('message');

        const log = logs[0];

        log.event.should.be.equal('LogSetState');
        log.args._policyId.valueOf().should.be.equal('0');
        log.args._policyState.valueOf().should.be.equal('2');
        log.args._stateTime.valueOf().should.be.equal('1504719597917');
        web3.toUtf8(log.args._stateMessage).should.be.equal('message');

        await FD.DB.setAccessControlTestOnly(FD.DB.address, accounts[0], 101, false);
    });

    /*
     * setDelay test
     */
    it('setDelay should set delay info to the risk', async () => {
        await FD.DB.setAccessControlTestOnly(FD.DB.address, accounts[0], 101, true);

        const policyId = 0;
        const delay = 2;
        const delayMinutes = 55;

        await FD.DB.setDelay(policyId, delay, delayMinutes)
            .should.not.be.rejectedWith(utils.EVMThow());

        const policy = await FD.DB.policies(policyId);
        const rId = policy[2];

        const risk = await FD.DB.risks(rId);

        // delay
        risk[3].valueOf().should.be.equal('55');

        // delay minutes
        risk[4].valueOf().should.be.equal('2');

        await FD.DB.setAccessControlTestOnly(FD.DB.address, accounts[0], 101, false);
    });

    // todo: test getCustomerPremium

    // todo: test setPremiumFactors

    // todo: getRiskParameters

    // todo: test getPremiumFactors

    // todo: test getAccessControl

    // todo: test getOraclizeCallback

    // todo: test getOraclizePolicyId

    // todo: test createOraclizeCallback

    // todo: test checkTime
});
