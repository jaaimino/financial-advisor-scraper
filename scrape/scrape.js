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

      scrapeBasicAccounts(targetAccount, $);
      scrapeLoans(targetAccount, $);
      scrapeInvestmentAccounts(targetAccount, $);
    }
  })
}

/**
* Scrape basic accounts and put into database
* @param  {account} targetAccount
* @param  {cheerio object} $
* @return {void}
*/
function scrapeBasicAccounts(targetAccount, $){
  //Get basic accounts
  $('#basicAccountsTable').find('tr').slice(1).each(function(index, element){
    var accountName = $($(element).find('td').get(0)).text();
    var accountNumber = $($(element).find('td').get(1)).text();
    var accountDesc = $($(element).find('td').get(2)).text();
    var accountAvailBalance = $($(element).find('td').get(3)).text();
    if(accountAvailBalance.indexOf("$") > -1){
      accountAvailBalance = accountAvailBalance.slice(1);
    }
    var accountTotalBalance = $($(element).find('td').get(4)).text();
    if(accountTotalBalance.indexOf("$") > -1){
      accountTotalBalance = accountTotalBalance.slice(1);
    }
    var accountType = $($(element).find('td').get(5)).text();

    //Check for available transactions
    var link = $($(element).find('td').find('a'));

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

        //If we have a link, get that data
        if(link.attr('href')){
          scrapeTransactions(newAccount, link.attr('href'));
        }

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

        //If we have a link, get that data
        if(link.attr('href')){
          //console.log("Link: " + link.attr('href'));
          scrapeTransactions(oldAccount, link.attr('href'));
        }
      }
    });
  });
}

function scrapeTransactions(targetBasicAccount, subUrl){
  url = 'http://udel.emoneyadvisor.com'+subUrl;

  request(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);

      $('#BankTransTable').find('div .Row').slice(1).each(function(index, element){

        var transactionDate = $($(element).find('div .Cell').get(0)).children().text();
        var transactionDesc = $($(element).find('div .Cell').get(1)).children().text();
        var transactionAmount = $($(element).find('div .Cell').get(2)).children().text();
        var transactionAmountNumber = transactionAmount.slice(2);
        var transactionPositive = !(transactionAmount.slice(0,1) === "-");
        var transactionCurrencyCode = $($(element).find('div .Cell').get(3)).children().text();
        var transactionMerchantName = $($(element).find('div .Cell').get(4)).children().text();
        var transactionMerchantCategory = $($(element).find('div .Cell').get(5)).children().text();

        //console.log(transactionDate + " " + transactionDesc + " " + transactionAmount + " " + transactionCurrencyCode + " " + transactionMerchantName + " " + transactionMerchantCategory);

        BankTransaction.find({
          account : targetBasicAccount._id,
          description     : transactionDesc,
          amount          : transactionAmountNumber,
          currency_codes  : transactionCurrencyCode,
          positive        : transactionPositive,
          merchant_name   : transactionMerchantName,
          merchant_category   : transactionMerchantCategory,
        },
        function(err, transactions){
          if(err){
            //console.log("ERROR: " + err);
            return;
          }
          //If the transaction doesn't exist, create it
          if(transactions.length < 1){
            var newTransaction = new BankTransaction({
              account         : targetBasicAccount._id,
              date            : transactionDate,
              positive        : transactionPositive,
              description     : transactionDesc,
              amount          : transactionAmountNumber,
              currency_codes  : transactionCurrencyCode,
              merchant_name   : transactionMerchantName,
              merchant_category   : transactionMerchantCategory,
            });
            newTransaction.save();

            //Otherwise, update the info
          } else {
            var oldTransaction = transactions[0];
            oldTransaction.account = targetBasicAccount._id;
            oldTransaction.date = transactionDate;
            oldTransaction.positive = transactionPositive;
            oldTransaction.description = transactionDesc;
            oldTransaction.amount = transactionAmountNumber;
            oldTransaction.currency_codes = transactionCurrencyCode;
            oldTransaction.merchant_name = transactionMerchantName;
            oldTransaction.merchant_category = transactionMerchantCategory;
            oldTransaction.save();
          }
        });
      });
    }
  })
}

/**
* Scrape loans and put into database
* @param  {account} targetAccount
* @param  {cheerio object} $
* @return {void}
*/
function scrapeLoans(targetAccount, $){
  //Get loans
  $('#loanAccountsTable').find('tr').slice(1).each(function(index, element){
    var accountName = $($(element).find('td').get(0)).text();
    var accountNumber = $($(element).find('td').get(1)).text();
    var accountDesc = $($(element).find('td').get(2)).text();
    var accountBalance = $($(element).find('td').get(3)).text().slice(1);
    var accountType = $($(element).find('td').get(4)).text();
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
}

/**
* Scrape investment accounts and put into database
* @param  {account} targetAccount
* @param  {cheerio object} $
* @return {void}
*/
function scrapeInvestmentAccounts(targetAccount, $){
  //Get investments
  $('#investmentAccountsTable').find('tr').slice(1).each(function(index, element){
    var accountName = $($(element).find('td').get(0)).text();
    var accountNumber = $($(element).find('td').get(1)).text();
    var accountDesc = $($(element).find('td').get(2)).text();
    var accountBalance = $($(element).find('td').get(3)).text().slice(1);
    var accountType = $($(element).find('td').get(4)).text();

    //Check for available holdings
    var link = $($(element).find('td').find('a'));

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
        //If we have a link, get that data
        if(link.attr('href')){
          //console.log("Link: " + link.attr('href'));
          scrapeTransactions(newAccount, link.attr('href'));
        }
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
        //If we have a link, get that data
        if(link.attr('href')){
          //console.log("Link: " + link.attr('href'));
          scrapeHoldings(oldAccount, link.attr('href'));
        }
      }
    });
  });
}

function scrapeHoldings(targetBasicAccount, subUrl){
  url = 'http://udel.emoneyadvisor.com'+subUrl;

  //console.log("Getting holdings: " + subUrl);

  request(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);
      $('#HoldingsTable').find('div .Row').slice(1).each(function(index, element){

        var transTicker = $($(element).find('div .Cell').get(0)).children().text();
        var transCusip = $($(element).find('div .Cell').get(1)).children().text();
        var transDesc = $($(element).find('div .Cell').get(2)).children().text();
        var transUnits = $($(element).find('div .Cell').get(3)).children().text();
        var transPrice = $($(element).find('div .Cell').get(4)).children().text();
        var transCB = $($(element).find('div .Cell').get(5)).children().text();
        var transAq = $($(element).find('div .Cell').get(6)).children().text();

        //console.log(transactionDate + " " + transactionDesc + " " + transactionAmount + " " + transactionCurrencyCode + " " + transactionMerchantName + " " + transactionMerchantCategory);
        Holdings.find({
            account     : targetBasicAccount._id,
            ticker      : transTicker,
            cusip       : transCusip,
            description     : transDesc,
        },
        function(err, holdings){
          if(err){
            //console.log("ERROR: " + err);
            return;
          }
          //If the transaction doesn't exist, create it
          if(holdings.length < 1){
            var newHoldings = new Holdings({
                account         : targetBasicAccount._id,
                ticker          : transTicker,
                cusip           : transCusip,
                description     : transDesc,
                units           : transUnits,
                price           : transPrice,
                cost_basis      : transCB,
                aquired         : transAq,
            });
            newHoldings.save();

            //Otherwise, update the info
          } else {
            var oldHoldings = holdings[0];
            oldHoldings.account = targetBasicAccount._id;
            oldHoldings.ticker = transTicker;
            oldHoldings.cusip = transCusip;
            oldHoldings.description = transDesc;
            oldHoldings.units = transUnits;
            oldHoldings.price = transPrice;
            oldHoldings.cost_basis = transCB;
            oldHoldings.aquired = transAq;

            oldHoldings.save();
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
