# metacoin_ethereum

This is an ethereum based smart contract written in Solidity

---

Besides basic coinbase funcationality, the following function and modifier is implemented:

1.function setJoinedAccount(address addr)

2.function sendCoinJoined(address receiver, uint amount) public notZero(amount) notSelf(receiver) returns(bool sufficient)

3.modifier onlyOwner()

4.modifier notZero(uint amount)

5.modifier notSelf(address receiver)

---

The following unit test is add to unit testing:

1.sendCoinJoined should not send coin when amount is zero

2.sendCoinJoined should not send coin when receiver is self

3.sendCoinJoined should send coin correctly when sender's account has sufficient coins

4.sendCoinJoined should send coin correctly when sender's account and joined account has sufficient coins

5.sendCoinJoined should not send coin when sender's account and joined account don't have sufficient coins

6.sendCoinJoined should not send coin when sender's account is NOT joined and don't have sufficient coins
