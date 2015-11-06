/**
 * This module is an abstraction on top of PhantomJS for easy scraping
 * @class Scraper API
 */
var scraper = {};

/**
 * Scraper mode
 */
scraper.mode = "start";

function amazon_first() {
    browser.render("tmp.pdf");
    var title = browser.evaluate(
        function() {
            return document.querySelector("#result_0 a[title]")
                            .getAttribute("title");
        });
    console.log("The first amazon entry is: " + title);
    phantom.exit();
}

scraper.demo = function() {
    browser.open("http://amazon.com",
        function(status) {
            if (status === "success") {
                browser.onLoadFinished = amazon_first;
                browser.evaluate(
                    function() {
                        document.querySelector("#twotabsearchtextbox")
                                .value = "usb drive";
                        document.querySelector("[name='site-search']")
                                .submit();
                    });
            }
            else {
                return;
            }
        });
};

/**
 * Go back to the home page of the site
 */
scraper.goHome = function() {
    switch(scraper.mode) {
    case "start":
        console.log("opening site page!");
        scraper.mode = "logout";
        browser.open("http://udel.emoneyadvisor.com", scraper.goHome);
        break;
    case "logout":
        console.log("clicking logout button");
        scraper.mode = "athome";
        browser.onLoadFinished = scraper.callback;
	browser.evaluate(
            function() {
                window.location.href = document.querySelector("#loginLink").href;
            });
        break;
    }
};

/**
 * Log in to the site
 */
scraper.login = function() {
    switch(scraper.mode) {
    case "start":
	scraper.callback = scraper.login;
        console.log("calling goHome!");
        scraper.goHome();
	break;
    case "athome":
        scraper.mode = "loggedin"
        browser.onLoadFinished = scraper.login;
        browser.evaluate(
            function(user, passwd) {
                document.querySelector("#Username").value = user;
                document.querySelector("#Password").value = passwd;
                document.querySelector("#LoginForm").submit();
            }, scraper.username, scraper.password);
        break;
    case "loggedin":
        scraper.postLogin();
        break;
    }
};

scraper.loginAuth = function() {
    // fill in credentials
};

/**
 * Do prelogin tasks
 */
scraper.preLogin = function(username, password, callback, answers) {
    scraper.mode = "start";
    scraper.username = username;
    scraper.password = password;
    scraper.postLogin = callback;
    scraper.mfCreds = answers;
};

/**
 * Scrape basic accounts
 */
scraper.scrapeEmoneyBasicAccounts = function() {
    console.log("basic accounts scrape");
    data = browser.evaluate(
        function() {
            var data = {};
            data.names = [];
            data.numbers = [];
            data.descriptions = [];
            data.availBalances = [];
            data.totalBalances = [];
            data.types = [];
            var table = document.getElementById("basicAccountsTable");
	    if (table != null){
            for (var i=1, row; row=table.rows[i]; i++) {
                data.names.push(row.cells[0].innerText);
                data.numbers.push(row.cells[1].innerText);
                data.descriptions.push(row.cells[2].innerText);
                data.availBalances.push(row.cells[3].innerText);
                data.totalBalances.push(row.cells[4].innerText);
                data.types.push(row.cells[5].innerText);
            }
            return data;
        }
	else {phantom.exit();}
	});
	console.log(data.table+"=====\n\n");
    for (var i=0; i<data.names.length; i++) {
        console.log(data.names[i] + ", " + data.numbers[i] + ", " +
                    data.descriptions[i] + ", " + data.availBalances[i] + ", " +
                    data.totalBalances[i] + ", " + data.types[i]);
    }
	console.log("==============================\n");
};

/**
 * Scrape loans
 */
scraper.scrapeEmoneyLoans = function() {
    console.log("loans scrape");
    data = browser.evaluate(
        function() {
		console.log("1");
            var data = {};
            data.names = [];
            data.numbers = [];
            data.descriptions = [];
            data.balances = [];
            data.types = [];
            var table = document.getElementById("loanAccountsTable");
	    if (table != null){
            for (var i=1, row; row=table.rows[i]; i++) {
                data.names.push(row.cells[0].innerText);
                data.numbers.push(row.cells[1].innerText);
                data.descriptions.push(row.cells[2].innerText);
                data.balances.push(row.cells[3].innerText);
                data.types.push(row.cells[4].innerText);
            }
            return data;
        }
	else {phantom.exit();}
	});
    for (var i=0; i<data.names.length; i++) {
        console.log(data.names[i] + ", " + data.numbers[i] + ", " +
                    data.descriptions[i] + ", " + data.balances[i] + ", " +
                    data.types[i]);
    }
	console.log("==============================\n");

};

/**
 * Scrape investments
 */
scraper.scrapeEmoneyInvestments = function() {
    console.log("investments scrape");
    /* same as loans table but add a condition to check if
    this table exist then scrape */

    data = browser.evaluate(
    function() {
        var data = {};
        data.names = [];
        data.numbers = [];
        data.descriptions = [];
        data.balance = [];
        data.types = [];
        var table = document.getElementById("investmentAccountsTable");
	if (table == null) {return null;}
        else{
	for (var i=1, row; row=table.rows[i]; i++) {
            data.names.push(row.cells[0].innerText);
            data.numbers.push(row.cells[1].innerText);
            data.descriptions.push(row.cells[2].innerText);
            data.balance.push(row.cells[3].innerText);
            data.types.push(row.cells[4].innerText);
        }
        return data;
	}
	});
	if (data == null) {return null;}
	for (var i=0; i<data.names.length; i++) {
    	console.log(data.names[i] + ", " + data.numbers[i] + ", " +
                data.descriptions[i] + ", " + data.balance[i] + ", " +
		data.types[i]);
}
    	/* Should also be able to click on hyperlinks on name and scrape
    	the bank transaction table */
        console.log("==============================\n");
};

/**
 * Scrape all accounts
 */
scraper.emoneyAccountsScrape = function()
{
	scraper.scrapeEmoneyBasicAccounts();
	scraper.scrapeEmoneyLoans();
	scraper.scrapeEmoneyInvestments();
	phantom.exit();
};

module.exports = scraper;
