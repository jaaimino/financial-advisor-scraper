'use strict';

var _ = require('lodash');
var Account = require('../../models/account.model');
var Client = require('../../models/client.model');
var BankTransaction = require('../../models/banktransaction.model');
var InvestmentAccount = require('../../models/investmentaccount.model');
var BasicAccount = require('../../models/basicaccount.model');
var Loan = require('../../models/loan.model');
var scrape = require('../../scrape/scrape');

// Scrape data for all clients/accounts
exports.index = function(req, res) {
  Account.find({}, function (err, accounts) {
    if(err) { return handleError(res, err); }
    scrape.login();
    for(var i=0; i < accounts.length; i++){
      var account = accounts[i];
      scrape.scrapeAccount(account);
    }
    return res.status(200).json(accounts);
  });
};

// Scrape data for single client
exports.singleclient = function(req, res) {
  Account.find({client: req.params.id}, function (err, accounts) {
    if(err) { return handleError(res, err); }
    if(!accounts) { return res.status(404).send('Not Found'); }
    scrape.login();
    for(var i=0; i < accounts.length; i++){
      var account = accounts[i];
      scrape.scrapeAccount(account);
    }
    return res.json(account);
  });
};

// Scrape data for single account
exports.singleaccount = function(req, res) {
  Account.findById(req.params.accId, function (err, account) {
    if(err) { return handleError(res, err); }
    if(!account) { return res.status(404).send('Not Found'); }
    scrape.login();
    scrape.scrapeAccount(account);
    return res.json(account);
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
