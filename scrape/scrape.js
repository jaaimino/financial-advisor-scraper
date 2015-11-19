//Include cheerio
var cheerio = require('cheerio');

//Set up requests
var request = require('request');
var globalJar = request.jar()
var request = request.defaults({jar:globalJar})

//Db models
var Account = require('../models/account.model');
var Client = require('../models/client.model');
var BankTransaction = require('../models/banktransaction.model');
var InvestmentAccount = require('../models/investmentaccount.model');
var BasicAccount = require('../models/basicaccount.model');
var Loan = require('../models/loan.model');

/**
* Scrape some data from the web
* @return void
*/
exports.scrapeAccount = function(targetAccount){
  url = 'http://udel.emoneyadvisor.com/SampleAccounts/AccountsSummary?User='+targetAccount.username;

  request(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);

      //Get basic accounts
      $('#basicAccountsTable').find('tr').slice(1).each(function(index, element){
        var accountName = $($(element).find('td').get(0)).text();
        var accountNumber = $($(element).find('td').get(1)).text();
        var accountDesc = $($(element).find('td').get(2)).text();
        var accountAvailBalance = $($(element).find('td').get(3)).text().substr(1);
        var accountTotalBalance = $($(element).find('td').get(4)).text().substr(1);
        var accountType = $($(element).find('td').get(5)).text();
        BasicAccount.find({account: targetAccount._id, account_number:accountNumber}, function(err, accounts){
          if(err){
            //console.log("ERROR: :O");
            return;
          }
          //If the account doesn't exist, create it
          if(accounts.length < 1){
            var newAccount = new BasicAccount({
              account : targetAccount._id,
              name            : accountName,
              account_number  : accountNumber,
              description     : accountDesc,
              available_balance : accountAvailBalance,
              total_balance   : accountTotalBalance,
              account_type    : accountType,
            });
            newAccount.save();
            //Otherwise, update the info
          } else {
            var oldAccount = accounts[0];
            oldAccount.account = targetAccount._id;
            oldAccount.name = accountName;
            oldAccount.account_number = accountNumber;
            oldAccount.description = accountDesc;
            oldAccount.available_balance = accountAvailBalance;
            oldAccount.total_balance = accountTotalBalance;
            oldAccount.account_type = accountType;
            oldAccount.save();
          }
        });
      });

      //Get loans
      $('#loanAccountsTable').find('tr').slice(1).each(function(index, element){
        var accountName = $($(element).find('td').get(0)).text();
        var accountNumber = $($(element).find('td').get(1)).text();
        var accountDesc = $($(element).find('td').get(2)).text();
        var accountBalance = $($(element).find('td').get(3)).text().substr(1);
        var accountType = $($(element).find('td').get(5)).text();
        Loan.find({account: targetAccount._id, account_number:accountNumber}, function(err, accounts){
          if(err){
            //console.log("ERROR: :O");
            return;
          }
          //If the account doesn't exist, create it
          //console.log("Target account id: " + targetAccount._id);
          if(accounts.length < 1){
            var newAccount = new Loan({
              account : targetAccount._id,
              name            : accountName,
              account_number  : accountNumber,
              description     : accountDesc,
              balance : accountBalance,
              account_type    : accountType,
            });
            newAccount.save();
            //Otherwise, update the info
          } else {
            var oldAccount = accounts[0];
            oldAccount.account = targetAccount._id;
            oldAccount.name = accountName;
            oldAccount.account_number = accountNumber;
            oldAccount.description = accountDesc;
            oldAccount.balaance = accountBalance;
            oldAccount.account_type = accountType;
            oldAccount.save();
          }
        });
      });

      //Get investments
      $('#investmentAccountsTable').find('tr').slice(1).each(function(index, element){
        var accountName = $($(element).find('td').get(0)).text();
        var accountNumber = $($(element).find('td').get(1)).text();
        var accountDesc = $($(element).find('td').get(2)).text();
        var accountBalance = $($(element).find('td').get(3)).text().substr(1);
        var accountType = $($(element).find('td').get(5)).text();
        InvestmentAccount.find({account: targetAccount._id, account_number:accountNumber}, function(err, accounts){
          if(err){
            //console.log("ERROR: :O");
            return;
          }
          //If the account doesn't exist, create it
          //console.log("Target account id: " + targetAccount._id);
          if(accounts.length < 1){
            var newAccount = new InvestmentAccount({
              account : targetAccount._id,
              name            : accountName,
              account_number  : accountNumber,
              description     : accountDesc,
              balance : accountBalance,
              account_type    : accountType,
            });
            newAccount.save();
            //Otherwise, update the info
          } else {
            var oldAccount = accounts[0];
            oldAccount.account = targetAccount._id;
            oldAccount.name = accountName;
            oldAccount.account_number = accountNumber;
            oldAccount.description = accountDesc;
            oldAccount.balaance = accountBalance;
            oldAccount.account_type = accountType;
            oldAccount.save();
          }
        });
      });
    }
  })
}

/**
* Does a test post request to a form
* @return void
*/
exports.login = function(){
  var url = 'http://udel.emoneyadvisor.com/';
  request.get(url, function(error, response, html){
    var $ = cheerio.load(html); //Load in html for parsing
    var token = $('#LoginForm').find('input')[0].attribs['value'];
    //console.log("Token: " + token);
    request.post(url, {
      formData:{
        Username:'Test',
        Password:'Test',
        __RequestVerificationToken:token
      }
    },
    function(err,httpResponse,body){
      //console.log("Cookie Jar: " + globalJar);
      //console.log(err);
      //console.log(body);
    })
  });
}
