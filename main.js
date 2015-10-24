// phantomjs init
var system = require("system");
var browser = require("webpage").create();
browser.viewportSize = {
    width: 1920,
    height: 1080
    /* 4k is for chumps */
};

/*
// phantomjs debugging
browser.onError = function (msg, trace) {
    console.log(msg);
    trace.forEach(function(item) {
        console.log("  ", item.file, ":", item.line);
    });
};
browser.onResourceError = function(resourceError) {
    browser.reason = resourceError.errorString;
    browser.reason_url = resourceError.url;
};

// DEBUG print command line args
system.args.forEach(function(elem) {
    console.log(elem);
});
console.log("");
*/

var scraper = require("./scraper");

// DEBUG
function post() {
    console.log("postLogin called!");
    browser.render("screenshot.jpg");
    phantom.exit();
}

// login
answers = [];
scraper.preLogin("Test", "Test", scraper.emoneyAccountsScrape, answers);
scraper.login();

// goto different sites
    // scrape data
    // store in DB
