const Tester = require('./tester.js');
const config = require('./config.js');

(async function main() {

    // our custom tester class
    let t = new Tester(config.url);

    try {

        //#############################################################################
        t.start("Search Google"); // title of test

        // search on google
        await t.fillField("css", "input[type='text']", config.keyword);
        await t.submit("css", "input[type='submit']");

        // verify test        
        t.end(await t.waitUntilUrlHas('selenium'));
        //#############################################################################

        t.notify("Test Finished!");

    } catch (err) {
        console.error(err.stack);

        t.takeScreenshot();
        t.notify("Test Failed!");
    }

})();