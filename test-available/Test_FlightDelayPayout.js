const utils = require('../util/test-utils.js');

const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();


contract('FlightDelayPayout', async (accounts) => {
    let FD;

    before(async () => {
        FD = await utils.getDeployedContracts(artifacts);
    });

    // todo: checkConstants
    // ORACLIZE_STATUS_BASE_URL
    // ORACLIZE_STATUS_QUERY
    // ORACLIZE_GAS
    // MAX_PAYOUT

    /*
     * Initilization
     */
    it('controller should be set to FD.Controller', async () => {
        const controller = await FD.PY.controller.call();
        controller.should.be.equal(FD.C.address);
    });

    it('FD.Payout should be registered in FD.Controller', async () => {
        const addr = await FD.C.getContract.call('FD.Payout');
        addr.should.be.equal(FD.PY.address);
    });

    // todo: check onlyController

    // todo: test setContracts

    /*
     * setContracts tests
     */
    it('Should not be accessed from external account', async () => {
        await FD.PY.setContracts()
            .should.be.rejectedWith(utils.EVMThrow);
    });


    it('Access to `schedulePayoutOraclizeCall` should be limited', async () => {
        const permissions = utils.expectedPermissions(FD, accounts, {
            'FD.Underwrite': 101,
        });

        permissions.forEach(async (perm) => {
            const [ label, caller, access, ] = perm;

            assert.equal(
                await FD.DB.getAccessControl.call(
                    FD.PY.address,
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
                    FD.PY.address,
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
        const balanceBefore = web3.eth.getBalance(FD.PY.address);
        const value = web3.toWei(10, 'ether');

        try {
            await FD.PY.fund({ from: accounts[2], value, });
            assert.ok('should not be rejected');
        } catch (error) {
            utils.assertJump(error);
        }

        const balanceAfter = web3.eth.getBalance(FD.PY.address);

        Number(balanceAfter).should.be.greaterThan(Number(balanceBefore));
        Number(balanceAfter).should.be.equal(Number(value) + Number(balanceBefore));
    });

    it('Should not accept ETH from other accounts', async () => {
        try {
            await FD.PY.fund({ from: accounts[1], value: web3.toWei(10, 'ether'), });
            assert.fail('should be rejected');
        } catch (error) {
            utils.assertJump(error);
        }
    });

    /*
     * todo: schedulePayoutOraclizeCall tests
     */

    /*
     * todo: __callback tests
     */

    /*
     * todo: payOut tests
     */
});
