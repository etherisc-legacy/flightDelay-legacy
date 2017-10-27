const utils = require('../util/test-utils.js');

const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('FlightDelayController', async (accounts) => {
    let FD;

    before(async () => {
        FD = await utils.getDeployedContracts(artifacts);
    });

    /*
     * Initialization
     */

    it('owner should be set correctly', async () => {
        const owner = await FD.C.owner.call();

        owner.should.be.equal(accounts[1]);
    });

    it('FD.Owner should be set correctly', async () => {
        const owner = await FD.C.contractIds.call(0);

        web3.toUtf8(owner).should.be.equal('FD.Owner');

        const ownerContract = await FD.C.contracts.call('FD.Owner');

        assert.equal(
            ownerContract[0],
            accounts[1],
            'FD.Owner should be set to accounts[1]'
        );

        assert.equal(
            ownerContract[1],
            false,
            'FD.Owner should not be controlled'
        );

        // todo: check isInitialized
    });

    it('FD.Controller should be set correctly', async () => {
        const controller = await FD.C.contractIds.call(1);

        web3.toUtf8(controller).should.be.equal('FD.Controller');

        const controllerContract = await FD.C.contracts.call('FD.Controller');

        assert.equal(
            controllerContract[0],
            FD.C.address,
            'FD.Controller should be set conrrectly'
        );

        assert.equal(
            controllerContract[1],
            false,
            'FD.Controller should not be ControlledContract'
        );

        // todo: check isInitialized
    });

    /*
     * transferOwnership test
     */
    it('transferOwnership should change owner and FD.Owner', async () => {
        try {
            await FD.C.transferOwnership(accounts[5]);
            assert.fail('only owner could transfer ownership');
        } catch (error) {
            utils.assertJump(error);
        }

        try {
            await FD.C.transferOwnership(accounts[5], { from: accounts[1], });
            assert.ok('only owner could transfer ownership');
        } catch (error) {
            utils.assertJump(error);
        }

        const owner = await FD.C.owner.call();
        owner.should.be.equal(accounts[5]);

        const ownerContract = await FD.C.contracts.call('FD.Owner');
        assert.equal(
            ownerContract[0],
            accounts[5],
            'FD.Owner should be set to accounts[5]'
        );

        // transferOwnership back to accounts[1]
        try {
            await FD.C.transferOwnership(accounts[1], { from: accounts[5], });
            assert.ok('only owner could transfer ownership');
        } catch (error) {
            utils.assertJump(error);
        }
    });


    // todo: test setContract

    /*
     * getContract test
     */
    it('getContract should return address of contract by id', async () => {
        const addr = await FD.C.getContract.call('FD.AccessController');

        addr.should.be.equal(FD.AC.address);
    });

    // todo: test registerContract

    // todo: test deregisterContract

    // todo: test setAllContracts

    // todo: test setOneContract

    // todo: test destructOne

    after(async () => {
        if (web3.version.network < 1000) {
            await FD.C.destructAll({ from: accounts[1], gas: 4700000, });
        }
    });
});
