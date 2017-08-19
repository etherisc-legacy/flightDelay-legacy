/**
 * Unit tests for FlightDelayController
 *
 * @author Christoph Mussenbrock
 * @description t.b.d
 * @copyright (c) 2017 etherisc GmbH
 *
 */

const FlightDelayController = artifacts.require('FlightDelayController');
const contractName = contract => web3.toUtf8(contract);


contract('FlightDelayController', () => {
    let FDC;
    before(async () => {
        FDC = await FlightDelayController.deployed();
    });

    it('should have FD.Owner registered', async () => {
        const contract = await FDC.contractIds(0);
        assert.equal('FD.Owner', contractName(contract));
    });

    it('should have FD.AccessController registered', async () => {
        const contract = await FDC.contractIds(1);
        assert.equal('FD.AccessController', contractName(contract));
    });

    it('should have FD.Database registered', async () => {
        const contract = await FDC.contractIds(2);
        assert.equal('FD.Database', contractName(contract));
    });

    it('should have FD.Ledger registered', async () => {
        const contract = await FDC.contractIds(3);
        assert.equal('FD.Ledger', contractName(contract));
    });

    it('should have FD.NewPolicy registered', async () => {
        const contract = await FDC.contractIds(4);
        assert.equal('FD.NewPolicy', contractName(contract));
    });

    it('should have FD.Underwrite registered', async () => {
        const contract = await FDC.contractIds(5);
        assert.equal('FD.Underwrite', contractName(contract));
    });

    it('should have FD.Payout registered', async () => {
        const contract = await FDC.contractIds(6);
        assert.equal('FD.Payout', contractName(contract));
    });
});
