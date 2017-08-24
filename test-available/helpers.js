function after(artifacts, accounts) {
    return async () => {
        const FDC = await artifacts.require('FlightDelayController').deployed();
        await FDC.destructAll({
            from: accounts[0],
            gas: 4700000,
        });
    };
}

module.exports = {
    after,
};
