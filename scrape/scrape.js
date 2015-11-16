var request = require('request');
var cheerio = require('cheerio');

/**
* Scrape some data from the web
* @return void
*/
exports.scrape = function(){
  url = 'http://www.imdb.com/title/tt1229340/';

  request(url, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);

      var title, release, rating;
      var json = { title : "", release : "", rating : ""};

      $('.header').filter(function(){
        var data = $(this);
        title = data.children().first().text();

        release = data.children().last().children().text();

        json.title = title;
        json.release = release;
      })

      // Since the rating is in a different section of the DOM, we'll have to write a new jQuery filter to extract this information.

      $('.star-box-giga-star').filter(function(){
        var data = $(this);

        // The .star-box-giga-star class was exactly where we wanted it to be.
        // To get the rating, we can simply just get the .text(), no need to traverse the DOM any further

        rating = data.text();

        json.rating = rating;
      })
      console.log(json);
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
