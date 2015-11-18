'use strict';

var _ = require('lodash');
var Account = require('../../models/account.model');
var Client = require('../../models/client.model');
var BankTransaction = require('../../models/banktransaction.model');
var InvestmentAccount = require('../../models/investmentaccount.model');
var BasicAccount = require('../../models/basicaccount.model');
var Loan = require('../../models/loan.model');
var scrape = require('../../scrape/scrape');

// Get list of accounts
exports.index = function(req, res) {
  scrape.scrape();
  Client.find(function (err, clients) {
    if(err) { return handleError(res, err); }
    //console.log(clients);
    return res.status(200).json(clients);
  });
};

// Get a single account
exports.show = function(req, res) {
  Account.findById(req.params.id, function (err, account) {
    if(err) { return handleError(res, err); }
    if(!account) { return res.status(404).send('Not Found'); }
    return res.json(account);
  });
};

// Creates a new account in the DB.
exports.create = function(req, res) {
  Account.create(req.body, function(err, account) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(account);
  });
};

// Updates an existing account in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Account.findById(req.params.id, function (err, account) {
    if (err) { return handleError(res, err); }
    if(!account) { return res.status(404).send('Not Found'); }
    var updated = _.merge(account, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(account);
    });
  });
};

// Deletes a account from the DB.
exports.destroy = function(req, res) {
  Account.findById(req.params.id, function (err, account) {
    if(err) { return handleError(res, err); }
    if(!account) { return res.status(404).send('Not Found'); }
    account.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
