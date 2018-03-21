var MetaCoin = artifacts.require("./MetaCoin.sol");

contract('MetaCoin', function(accounts) {
  it("should put 10000 MetaCoin in the first account", function() {
    return MetaCoin.deployed().then(function(instance) {
      return instance.getBalance.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
    });
  });

  it("should send coin correctly", function() {
    var meta;

    // Get initial balances of first and second account.
    var account_one = accounts[0];
    var account_two = accounts[1];

    var account_one_starting_balance;
    var account_two_starting_balance;
    var account_one_ending_balance;
    var account_two_ending_balance;

    var amount = 10;

    return MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance.call(account_one);
    }).then(function(balance) {
      account_one_starting_balance = balance.toNumber();
      return meta.getBalance.call(account_two);
    }).then(function(balance) {
      account_two_starting_balance = balance.toNumber();
      return meta.sendCoin(account_two, amount, {from: account_one});
    }).then(function() {
      return meta.getBalance.call(account_one);
    }).then(function(balance) {
      account_one_ending_balance = balance.toNumber();
      return meta.getBalance.call(account_two);
    }).then(function(balance) {
      account_two_ending_balance = balance.toNumber();

      assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
      assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
    });
  });

  it("should allow owner to mint coins", function() {
    //call the mint function on behalf of the owner and check that owner's account balance increased correctly
    var meta;
    var owner = accounts[0];
    var starting_balance;
    var ending_balance;
    var amount = 10;

    return MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance.call(owner);
    }).then(function(balance) {
      starting_balance = balance.toNumber();
      return meta.mint(amount, {from: owner});
    }).then(function() {
      return meta.getBalance.call(owner);
    }).then(function(balance) {
      ending_balance = balance.toNumber();

      assert.equal(ending_balance, starting_balance + amount, "Amount wasn't correctly minted to the owner");
    });
  });

  it("should not allow a non-owner address to mint coins", function() {
    //call the mint function on behalf of a non-owner address and check that the non-owner address balance stays the same
    var meta;
    var notOwner = accounts[1];
    var starting_balance;
    var ending_balance;
    var amount = 10;

    return MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance.call(notOwner);
    }).then(function(balance) {
      starting_balance = balance.toNumber();
      return meta.mint(amount, {from: notOwner});
    }).catch(function(err) {
      console.log("not owner!"); //it should catch the err
    }).then(function() {
      return meta.getBalance.call(notOwner);
    }).then(function(balance) {
      ending_balance = balance.toNumber();

      assert.equal(ending_balance, starting_balance, "Non-owner allowed to mint coins");
    });
  });


  it("sendCoinJoined should not send coin when amount is zero", function() {
    var meta;

    var account_one = accounts[0];
    var account_two = accounts[1];

    var amount = 0; //set amount to zero

    var flag = false;

    return MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.sendCoinJoined(account_two, amount, {from: account_one}); //sendCoinJoined should not send coin when amount is zero
    }).catch(function(err) {
      console.log("zero amount!"); //it should catch the err
      flag = true
    }).then(function() {
      assert.equal(flag, true, "zero amount!, it should catch the error")
    });
  });

  it("sendCoinJoined should not send coin when receiver is self", function() {
    var meta;

    var sender = accounts[0];
    var receiver = accounts[0]; //set receiver the same account as sender

    var amount = 10;

    var flag = false;

    return MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.sendCoinJoined(receiver, amount, {from: sender}); //sendCoinJoined should not send coin when receiver is self
    }).catch(function(err) {
      console.log("receiver is self!"); //it should catch the err
      flag = true
    }).then(function() {
      assert.equal(flag, true, "receiver is self!, it should catch the error")
    });
  });

  it("sendCoinJoined should send coin correctly when sender's account has sufficient coins", function() {
    var meta;

    var account_one = accounts[0];
    var account_two = accounts[1];

    var account_one_starting_balance;
    var account_two_starting_balance;
    var account_one_ending_balance;
    var account_two_ending_balance;

    var amount = 10;

    return MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance.call(account_one);
    }).then(function(balance) {
      account_one_starting_balance = balance.toNumber();
      return meta.getBalance.call(account_two);
    }).then(function(balance) {
      account_two_starting_balance = balance.toNumber();
      return meta.sendCoinJoined(account_two, amount, {from: account_one}); //sendCoinJoined should have the same behavior as sendCoin when sender's account has sufficient coins
    }).then(function() {
      return meta.getBalance.call(account_one);
    }).then(function(balance) {
      account_one_ending_balance = balance.toNumber();
      return meta.getBalance.call(account_two);
    }).then(function(balance) {
      account_two_ending_balance = balance.toNumber();

      assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
      assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
    });
  });

/*
    This is a test for sendCoinJoined, before sendCoinJoined the balance of accounts:
    account2: 10
    account3: 5
    account4: 0
    After sendCoinJoined(account4, 15, {from: account2}), where account3 is the joined account for account2
    account2: 0
    account3: 0
    account4: 15
*/
    it("sendCoinJoined should send coin correctly when sender's account and joined account has sufficient coins", function() {
      var meta;

      var account0 = accounts[0]; //The owner's account is used to send initial coins to accounts
      var account2 = accounts[2]; //Sender's account
      var account3 = accounts[3]; //Joined account
      var account4 = accounts[4]; //Receiver's account

      var account2_starting_balance;
      var account3_starting_balance;
      var account4_starting_balance;
      var account2_ending_balance;
      var account3_ending_balance;
      var account4_ending_balance;

      var amount = 15; //Total amount want to be sent
      var amount1 = 10; //Amount that sender has

      return MetaCoin.deployed().then(function(instance) {
        meta = instance;
        return meta.sendCoin(account2, amount1, {from: account0}); //Send amount1 coin to account2(Sender)
      }).then(function() {
        return meta.sendCoin(account3, amount - amount1, {from: account0}); //Send amount - amount1 coin to account3(Joined)
      }).then(function() {
        return meta.setJoinedAccount(account3, {from: account2}); //Set account3 as the joined account for account2
      }).then(function() {
        return meta.getBalance.call(account2);
      }).then(function(balance) {
        account2_starting_balance = balance.toNumber();
        return meta.getBalance.call(account3);
      }).then(function(balance) {
        account3_starting_balance = balance.toNumber();
        return meta.getBalance.call(account4);
      }).then(function(balance) {
        account4_starting_balance = balance.toNumber();
        return meta.sendCoinJoined(account4, amount, {from: account2}); //Send amount coin to account4(Receiver)
      }).then(function() {
        return meta.getBalance.call(account2);
      }).then(function(balance) {
        account2_ending_balance = balance.toNumber();
        return meta.getBalance.call(account3);
      }).then(function(balance) {
        account3_ending_balance = balance.toNumber();
        return meta.getBalance.call(account4);
      }).then(function(balance) {
        account4_ending_balance = balance.toNumber();
      }).then(function() {
        return meta.setJoinedAccount(0, {from: account2}); //Unlink account3 and account2, for next test
      }).then(function() {
        return meta.sendCoin(account0, amount, {from: account4}); //Send coin back to account0, for next test


        assert.equal(account2_ending_balance, account2_starting_balance - amount1, "Amount wasn't correctly taken from the sender1");
        assert.equal(account3_ending_balance, account3_starting_balance - amount + amount1, "Amount wasn't correctly taken from the sender2");
        assert.equal(account4_ending_balance, account4_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
      });
    });

/*
    This is a test for sendCoinJoined, before sendCoinJoined the balance of accounts:
    account2: 10
    account3: 4
    account4: 0
    After sendCoinJoined(account4, 15, {from: account2}), where account3 is the joined account for account2
    account2: 10
    account3: 4
    account4: 0
*/
    it("sendCoinJoined should not send coin when sender's account and joined account don't have sufficient coins", function() {
      var meta;

      var account0 = accounts[0];
      var account2 = accounts[2];
      var account3 = accounts[3];
      var account4 = accounts[4];

      var account2_starting_balance;
      var account3_starting_balance;
      var account4_starting_balance;
      var account2_ending_balance;
      var account3_ending_balance;
      var account4_ending_balance;

      var amount = 15;
      var amount1 = 10;

      return MetaCoin.deployed().then(function(instance) {
        meta = instance;
        return meta.sendCoin(account2, amount1, {from: account0});
      }).then(function() {
        return meta.sendCoin(account3, amount - amount1 - 1, {from: account0}); //This time we sent 1 coin less, so the sum of sender and joined is not sufficient
      }).then(function() {
        return meta.setJoinedAccount(account3, {from: account2});
      }).then(function() {
        return meta.getBalance.call(account2);
      }).then(function(balance) {
        account2_starting_balance = balance.toNumber();
        return meta.getBalance.call(account3);
      }).then(function(balance) {
        account3_starting_balance = balance.toNumber();
        return meta.getBalance.call(account4);
      }).then(function(balance) {
        account4_starting_balance = balance.toNumber();
        return meta.sendCoinJoined(account4, amount, {from: account2});
      }).then(function() {
        return meta.getBalance.call(account2);
      }).then(function(balance) {
        account2_ending_balance = balance.toNumber();
        return meta.getBalance.call(account3);
      }).then(function(balance) {
        account3_ending_balance = balance.toNumber();
        return meta.getBalance.call(account4);
      }).then(function(balance) {
        account4_ending_balance = balance.toNumber();
      }).then(function() {
        return meta.setJoinedAccount(0, {from: account2}); //Unlink account3 and account2, for next test
      }).then(function() {
        return meta.sendCoin(account0, amount - amount1 - 1, {from: account3}); //Send coin back to account0, for next test
      }).then(function() {
        return meta.sendCoin(account0, amount1, {from: account2}); //Send coin back to account0, for next test

        assert.equal(account2_ending_balance, account2_starting_balance, "Sender's amount should not change");
        assert.equal(account3_ending_balance, account3_starting_balance, "Joined Account's amount should not change");
        assert.equal(account4_ending_balance, account4_starting_balance, "Receiver's amount should not change");


      });
    });

/*
    This is a test for sendCoinJoined, before sendCoinJoined the balance of accounts:
    account2: 10
    account3: 5
    account4: 0
    After sendCoinJoined(account4, 15, {from: account2}), where account3 is NOT the joined account for account2
    account2: 10
    account3: 5
    account4: 0
*/
    it("sendCoinJoined should not send coin when sender's account is NOT joined and don't have sufficient coins", function() {
      var meta;

      var account0 = accounts[0];
      var account2 = accounts[2];
      var account3 = accounts[3];
      var account4 = accounts[4];

      var account2_starting_balance;
      var account3_starting_balance;
      var account4_starting_balance;
      var account2_ending_balance;
      var account3_ending_balance;
      var account4_ending_balance;

      var amount = 15;
      var amount1 = 10;

      return MetaCoin.deployed().then(function(instance) {
        meta = instance;
        return meta.sendCoin(account2, amount1, {from: account0});
      }).then(function() {
        return meta.sendCoin(account3, amount - amount1, {from: account0});
      }).then(function() {  //This time we don't set account3 as the joined account for account2
        return meta.getBalance.call(account2);
      }).then(function(balance) {
        account2_starting_balance = balance.toNumber();
        return meta.getBalance.call(account3);
      }).then(function(balance) {
        account3_starting_balance = balance.toNumber();
        return meta.getBalance.call(account4);
      }).then(function(balance) {
        account4_starting_balance = balance.toNumber();
        return meta.sendCoinJoined(account4, amount, {from: account2});
      }).then(function() {
        return meta.getBalance.call(account2);
      }).then(function(balance) {
        account2_ending_balance = balance.toNumber();
        return meta.getBalance.call(account3);
      }).then(function(balance) {
        account3_ending_balance = balance.toNumber();
        return meta.getBalance.call(account4);
      }).then(function(balance) {
        account4_ending_balance = balance.toNumber();
      }).then(function() {
        return meta.sendCoin(account0, amount - amount1, {from: account3}); //Send coin back to account0, for next test
      }).then(function() {
        return meta.sendCoin(account0, amount1, {from: account2}); //Send coin back to account0, for next test

        assert.equal(account2_ending_balance, account2_starting_balance, "Sender's amount should not change");
        assert.equal(account3_ending_balance, account3_starting_balance, "Joined Account's amount should not change");
        assert.equal(account4_ending_balance, account4_starting_balance, "Receiver's amount should not change");
      });
    });
});
