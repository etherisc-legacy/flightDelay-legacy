const utils = require('../util/test-utils.js');

const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();


contract('FlightDelayUnderwrite', (accounts) => {
    let FD;

    before(async () => {
        FD = await utils.getDeployedContracts(artifacts);
    });


    // todo: check Constants
    // ORACLIZE_RATINGS_BASE_URL
    // ORACLIZE_RATINGS_QUERY
    // MIN_OBSERVATIONS
    // WEIGHT_PATTERN
    // CHECK_PAYOUT_OFFSET
    // ORACLIZE_GAS

    /*
     * Initilization
     */
    it('Controller should be set to FD.Controller', async () => {
        const controller = await FD.UW.controller.call();
        controller.should.be.equal(FD.C.address);
    });

    it('FD.Underwrite should be registered in FD.Controller', async () => {
        const addr = await FD.C.getContract.call('FD.Underwrite');
        addr.should.be.equal(FD.UW.address);
    });

    /*
     * setContracts tests
     */
    it('Should not be accessed from external account', async () => {
        await FD.UW.setContracts()
            .should.be.rejectedWith(utils.EVMThrow);
    });

    it('Access to `scheduleUnderwriteOraclizeCall` should be limited', async () => {
        const permissions = utils.expectedPermissions(FD, accounts, {
            'FD.NewPolicy': 101,
        });

        permissions.forEach(async (perm) => {
            const [ label, caller, access, ] = perm;

            assert.equal(
                await FD.DB.getAccessControl.call(
                    FD.UW.address,
                    caller,
                    access
                ),
                !!perm[2],
                `Access from ${label} should be set to ${access}`);
        });
    });

    it('Access to `fund` should be limited', async () => {
        const permissions = utils.expectedPermissions(FD, accounts, {
            'FD.Funder': 102,
        });

        permissions.forEach(async (perm) => {
            const [ label, caller, access, ] = perm;

            assert.equal(
                await FD.DB.getAccessControl.call(
                    FD.UW.address,
                    caller,
                    access
                ),
                !!perm[2],
                `Access from ${label} should be set to ${access}`);
        });
    });

    /*
     * fund tests
     */
    it('Should accept ETH from FD.Funder', async () => {
        const balanceBefore = web3.eth.getBalance(FD.UW.address);
        const value = web3.toWei(10, 'ether');

        try {
            await FD.UW.fund({ from: accounts[2], value, });
            assert.ok('should not be rejected');
        } catch (error) {
            utils.assertJump(error);
        }

        const balanceAfter = web3.eth.getBalance(FD.UW.address);

        Number(balanceAfter).should.be.greaterThan(Number(balanceBefore));
        Number(balanceAfter).should.be.equal(Number(value) + Number(balanceBefore));
    });

    it('Should not accept ETH from other accounts', async () => {
        try {
            await FD.UW.fund({ from: accounts[1], value: web3.toWei(10, 'ether'), });
            assert.fail('should be rejected');
        } catch (error) {
            utils.assertJump(error);
        }
    });

    // todo: test scheduleUnderwriteOraclizeCall

    // todo: test __callback

    // todo: test decline

    // todo: test underwrite

    // todo: check onlyController

    // todo: test setContracts

    // tood: test getContract

    // it('should schedule Oraclize Call', async () => {
    //     const FD_UW = await FlightDelayUnderwrite.deployed();

    //     const policyId = 0;
    //     const carrierFlightNumber = 'LH/410';

    //     return FD_UW.scheduleUnderwriteOraclizeCall(policyId, carrierFlightNumber,
    //         {
    //             gas: 4700000,
    //         }
    //     );
    // });

    after(async () => {
        if (web3.version.network < 1000) {
            await FD.C.destructAll({ from: accounts[1], gas: 4700000, });
        }
    });
});
