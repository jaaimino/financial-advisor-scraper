'use strict';

var _ = require('lodash');
var Account = require('../../models/account.model');
var Client = require('../../models/client.model');
var BankTransaction = require('../../models/banktransaction.model');
var InvestmentAccount = require('../../models/investmentaccount.model');
var BasicAccount = require('../../models/basicaccount.model');
var Loan = require('../../models/loan.model');
var scrape = require('../../scrape/scrape');

// Scrape data for all accounts
exports.index = function(req, res) {

  Account.find(function (err, accounts) {
    if(err) { return handleError(res, err); }
    for(var i=0; i < accounts.length; i++){
      var account = accounts[i];
      scrape.scrapeAccount(account.username, account.password);
    }
    return res.status(200).json(accounts);
  });
};

// Scrape data for single account
exports.show = function(req, res) {
  Account.findById(req.params.id, function (err, account) {
    if(err) { return handleError(res, err); }
    if(!account) { return res.status(404).send('Not Found'); }
    return res.json(account);
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
