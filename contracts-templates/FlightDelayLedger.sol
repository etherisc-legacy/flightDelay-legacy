/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description	Ledger contract. 
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock
 *
 */

@@include('./templatewarning.txt')

pragma solidity @@include('./solidity_version_string.txt');

import "./FlightDelayControlledContract.sol";
import "./FlightDelayAccessControllerInterface.sol";
import "./FlightDelayDatabaseInterface.sol";
import "./FlightDelayLedgerInterface.sol";
import "./FlightDelayConstants.sol";

contract FlightDelayLedger is 

	FlightDelayControlledContract,
	FlightDelayLedgerInterface,
	FlightDelayConstants

	{

	FlightDelayDatabaseInterface FD_DB;
	FlightDelayAccessControllerInterface FD_AC;

	function FlightDelayLedger(address _controller) payable {

		setController(_controller, 'FD.Ledger');

	}

	function setContracts() onlyController {

		FD_AC = FlightDelayAccessControllerInterface(getContract('FD.AccessController'));
		FD_DB = FlightDelayDatabaseInterface(getContract('FD.Database'));

		FD_AC.setPermissionById(101, 'FD.NewPolicy');
		FD_AC.setPermissionById(101, 'FD.Owner');
		FD_AC.setPermissionById(102, 'FD.Payout');
		FD_AC.setPermissionById(102, 'FD.Owner');
		FD_AC.setPermissionById(103, 'FD.NewPolicy');
    FD_AC.setPermissionById(102, 'FD.Underwrite');
		FD_AC.setPermissionById(103, 'FD.Underwrite');
		FD_AC.setPermissionById(103, 'FD.Payout');
		FD_AC.setPermissionById(103, 'FD.Ledger');

		bookkeeping(Acc.Balance, Acc.RiskFund, this.balance); 
	}

	function receiveFunds(Acc _to) payable {

		if (!FD_AC.checkPermission(101, msg.sender)) throw;

		LOG_ReceiveFunds(msg.sender, uint8(_to), msg.value);

		bookkeeping(Acc.Balance, _to, msg.value); 

	}

	function sendFunds(address _recipient, Acc _from, uint _amount) returns (bool _success) {
		
		if (!FD_AC.checkPermission(102, msg.sender)) return false;
		if (this.balance < _amount) return false; // unsufficient funds

		LOG_SendFunds(_recipient, uint8(_from), _amount);

		bookkeeping(_from, Acc.Balance, _amount);      // cash out payout

		if (!_recipient.send(_amount))  {
			bookkeeping(Acc.Balance, _from, _amount);
			_success = false;
		} else {
			_success = true;
		}
	}

	// invariant: acc_Premium + acc_RiskFund + acc_Payout
	//						+ acc_Balance + acc_Reward == 0

	function bookkeeping(Acc _from, Acc _to, uint _amount) {

		if (!FD_AC.checkPermission(103, msg.sender)) return;

		// check against type cast overflow
		if (int(_amount) < 0) {
			throw;
		}

		// overflow check is done in FD_DB
		FD_DB.setLedger(uint8(_from), -int(_amount));
		FD_DB.setLedger(uint8(_to  ),  int(_amount));

	}

}


