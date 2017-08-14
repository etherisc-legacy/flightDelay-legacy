function after(artifacts, accounts) {
  return async () => {
    const FDC = await artifacts.require('FlightDelayController').deployed();
    await FDC.destruct_all({
      from: accounts[0],
      gas: 4700000,
    });
  };
}

module.exports = {
  after,
};
