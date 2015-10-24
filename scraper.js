/*
 * This module assumes 'browser' (phantomjs WebPage)
 * and 'phantom' (phantomjs Phantom) objects are
 * defined as global variables.
 */

var scraper = {};

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
                phantom.exit();
            }
        });
};

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

scraper.preLogin = function(username, password, callback, answers) {
    scraper.mode = "start";
    scraper.username = username;
    scraper.password = password;
    scraper.postLogin = callback;
    scraper.mfCreds = answers;
};

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
            for (var i=1, row; row=table.rows[i]; i++) {
                data.names.push(row.cells[0].innerText);
                data.numbers.push(row.cells[1].innerText);
                data.descriptions.push(row.cells[2].innerText);
                data.availBalances.push(row.cells[3].innerText);
                data.totalBalances.push(row.cells[4].innerText);
                data.types.push(row.cells[5].innerText);
            }
            return data;
        });
    for (var i=0; i<data.names.length; i++) {
        console.log(data.names[i] + ", " + data.numbers[i] + ", " +
                    data.descriptions[i] + ", " + data.availBalances[i] + ", " +
                    data.totalBalances[i] + ", " + data.types[i]);
    }
};

scraper.scrapeEmoneyLoans = function() {
    console.log("loans scrape");
};

scraper.scrapeEmoneyInvestments = function() {
    console.log("investments scrape");
};

scraper.emoneyAccountsScrape = function() {
    scraper.scrapeEmoneyBasicAccounts();
    scraper.scrapeEmoneyLoans();
    scraper.scrapeEmoneyInvestments();
    phantom.exit();
};

module.exports = scraper;
