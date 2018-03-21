pragma solidity ^0.4.4;

contract MetaCoin {
	mapping (address => uint) balances;
	address owner;

	mapping (address => address) joined_account; //The map for jointed account, if no joined account for the sender it is 0

	event Transfer(address indexed _from, address indexed _to, uint256 _value);

	function MetaCoin() {
		balances[msg.sender] = 10000;
		owner = msg.sender;
	}

	function sendCoin(address receiver, uint amount) returns(bool sufficient) {
		if (balances[msg.sender] < amount) return false;
		balances[msg.sender] -= amount;
		balances[receiver] += amount;
		Transfer(msg.sender, receiver, amount);
		return true;
	}

	function getBalance(address addr) returns(uint) {
		return balances[addr];
	}

	modifier onlyOwner() {
		require (msg.sender == owner);
		_;
	}

	function mint(uint amount) public onlyOwner {
		balances[msg.sender] += amount;
	}

	function setJoinedAccount(address addr) {
		joined_account[msg.sender] = addr; //set to 0 for unlink
	}

	modifier notZero(uint amount) {
		require (amount != 0);
		_;
	}

	modifier notSelf(address receiver) {
		require (msg.sender != receiver);
		_;
	}

	function sendCoinJoined(address receiver, uint amount) public notZero(amount) notSelf(receiver) returns(bool sufficient) {
		if (balances[msg.sender] >= amount) { //Sender's balance is sufficient
			balances[msg.sender] -= amount;
			balances[receiver] += amount;
			Transfer(msg.sender, receiver, amount);
			return true;
		} else if (joined_account[msg.sender] == 0) { //No jointed account
			return false;
		} else if (balances[msg.sender] + balances[joined_account[msg.sender]] >= amount) { //Sender + joined account is sufficient
			var amount1 = balances[msg.sender];
			var amount2 = amount - balances[msg.sender];
			balances[joined_account[msg.sender]] -= amount2;
			balances[msg.sender] -= amount1;
			balances[receiver] += amount;
			Transfer(msg.sender, receiver, amount1);
			Transfer(joined_account[msg.sender], receiver, amount2);
			return true;
		} else { //Sender + joined account is not sufficient
			return false;
		}
	}
}
