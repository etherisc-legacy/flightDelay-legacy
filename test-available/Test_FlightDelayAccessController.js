const utils = require('../util/test-utils.js');

const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();


contract('FlightDelayAccessController', async (accounts) => {
    let FD;

    before(async () => {
        FD = await utils.getDeployedContracts(artifacts);
    });

    /*
     * Initilization
     */
    it('controller should be set to FD.Controller', async () => {
        const controller = await FD.AC.controller.call();
        controller.should.be.equal(FD.C.address);
    });

    it('FD.Database should be registered in FD.Controller', async () => {
        const addr = await FD.C.getContract.call('FD.AccessController');
        addr.should.be.equal(FD.AC.address);
    });

    // todo: check onlyController

    /*
     * setContracts tests
     */
    it('setContracts should not be accessed from external account', async () => {
        await FD.AC.setContracts()
            .should.be.rejectedWith(utils.EVMThrow);
    });

    // tood: test getContract - internal ! no need of this function

    // todo: test setPermissionsById 1

    // todo: test setPermissionsById 2

    // todo: test setPermissionByAddress 1

    // todo: test setPermissionByAddress 2

    // todo: make this function modifier - checkPermission
    /*
     * checkPermission test
     */
    it('checkPermission should return corrent permissions', async () => {
        assert.equal(
            await FD.AC.checkPermission.call(104, accounts[2]),
            false
        );

        await FD.DB.setAccessControlTestOnly(accounts[0], accounts[2], 104, true);

        assert.equal(
            await FD.AC.checkPermission.call(104, accounts[2]),
            true
        );
    });

    after(async () => {
        if (web3.version.network < 1000) {
            await FD.C.destructAll({ from: accounts[1], gas: 4700000, });
        }
    });
});
