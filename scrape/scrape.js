var request = require('request');
var cheerio = require('cheerio');

/**
* Scrape some data from the web
* @return void
*/
exports.scrapeAccount = function(username, password){
  url = 'http://udel.emoneyadvisor.com/SampleAccounts/AccountsSummary?User='+username;

  request(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);

      //console.log(html);
      var basicaccounts = [];

      //Get basic accounts
      $('#basicAccountsTable').find('tr').slice(1).each(function(index, element){
        var accountName = $($(element).find('td').get(0)).text();
        var accountNumber = $($(element).find('td').get(1)).text();
        var accountDesc = $($(element).find('td').get(2)).text();
        var accountAvailBalance = $($(element).find('td').get(3)).text().substr(1);
        var accountTotalBalance = $($(element).find('td').get(4)).text().substr(1);
        var accountType = $($(element).find('td').get(5)).text();
        console.log(
          "Basic account: " +
          accountName + " " +
          accountNumber + " " +
          accountDesc + " " +
          accountAvailBalance + " " +
          accountTotalBalance + " " +
          accountType
        );
      });

      //Get loans
      $('#loanAccountsTable').find('tr').slice(1).each(function(index, element){
        var accountName = $($(element).find('td').get(0)).text();
        var accountNumber = $($(element).find('td').get(1)).text();
        var accountDesc = $($(element).find('td').get(2)).text();
        var accountBalance = $($(element).find('td').get(3)).text().substr(1);
        var accountType = $($(element).find('td').get(5)).text();
        console.log(
          "Loan: " +
          accountName + " " +
          accountNumber + " " +
          accountDesc + " " +
          accountBalance + " " +
          accountType
        );
      });

      //Get investments
      $('#investmentAccountsTable').find('tr').slice(1).each(function(index, element){
        var accountName = $($(element).find('td').get(0)).text();
        var accountNumber = $($(element).find('td').get(1)).text();
        var accountDesc = $($(element).find('td').get(2)).text();
        var accountBalance = $($(element).find('td').get(3)).text().substr(1);
        var accountType = $($(element).find('td').get(5)).text();
        console.log(
          "Investment: " +
          accountName + " " +
          accountNumber + " " +
          accountDesc + " " +
          accountBalance + " " +
          accountType
        );
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
    console.log("Token: " + token);
    request.post(url, {
      formData:{
        Username:'Test',
        Password:'Test',
        __RequestVerificationToken:token
      }
    },
    function(err,httpResponse,body){
      console.log(err);
      console.log(body);
    })
  });
}
