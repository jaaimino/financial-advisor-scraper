var request = require('request');
var cheerio = require('cheerio');

/**
* Scrape some data from the web
* @return void
*/
exports.scrape = function(username){
  url = 'http://udel.emoneyadvisor.com/SampleAccounts/AccountsSummary?User='+username;

  request(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);

      console.log($('h2'));
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
