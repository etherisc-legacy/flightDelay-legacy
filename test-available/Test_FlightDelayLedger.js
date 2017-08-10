/**
 * Unit tests for FlightDelayController
 *
 * @author Christoph Mussenbrock
 * @description t.b.d
 * @copyright (c) 2017 etherisc GmbH
 *
 */

contract('FlightDelayLedger', () => {
  it('should have a balance of 0 in all accounts at startup', () => {
    const FD_LG = FlightDelayLedger.deployed();

    return FD_LG.ledger(0).then((balance) => {
      assert.equal(balance.valueOf(), 0, '0 wasnt in the first account');
    });
  }); // it

  it('should throw on invalid index', () => {
    const FD_LG = FlightDelayLedger.deployed();
    let itPasses = false;

    return FD_LG.ledger(6).then(() => {
      itPasses = true;
      assert.fail();
    }).catch(() => {
      return;
    }).then(() => {
      if (itPasses) {
        assert.fail('should throw, but doesn`t');
      } else {
        assert.isOk('it throws as expected');
      }
    });
  }); // it

  it('should have equal balances in accounts after booking', () => {
    const FD_LG = FlightDelayLedger.deployed();
    const ether_5 = web3.toWei(5, 'ether');

    return FD_LG.bookkeeping(0, 1, ether_5).then(() => {
      return FD_LG.ledger(0).then((balance_0) => {
        assert.equal(-balance_0.valueOf(), ether_5);
        return FD_LG.ledger(1).then((balance_1) => {
          assert.equal(balance_1.valueOf(), ether_5);
          assert.equal(-balance_0.valueOf(), balance_1.valueOf(), 'balances are not equal');
        });
      });
    });
  });

  it('should throw on overflow', () => {
    const FD_LG = FlightDelayLedger.deployed();
    // TODO: check if safeMath for various overflows in bookkeeping works.
  }); // it
}); // contract
