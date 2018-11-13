/**
 * Custom Tester Class / Functions
 * 
 * Each test needs start() and end() function calls.
 * 
 * The start() function simply sets title of test in console.
 * 
 * The end() function decides whether or not test was successful based on
 * condition given to it.
 * 
 * More functions can be added to this class as needed.
 * 
 * @author Sarfraz Ahmed
 * 
 */

/////////////////////////////////////////////
// needed packages
/////////////////////////////////////////////

require('chromedriver');

const {
    Builder,
    By,
    Key,
    until
} = require('selenium-webdriver');

const fs = require('fs');
const path = require('path');
const notifier = require('node-notifier');
const chalk = require('chalk');
const logSymbols = require('log-symbols');
const boxen = require('boxen');
/////////////////////////////////////////////

const timeout = 60000;

module.exports = class Tester {

    constructor(url) {

        if (!url) {
            this.print(logSymbols.error, chalk.red("url is required!"));
            return;
        }

        let capabilities = {
            browserName: 'chrome',
            loggingPrefs: {
                'driver': 'OFF',
                'server': 'OFF',
                'browser': 'OFF'
            },
            chromeOptions: {
                args: [
                    //'headless', // enabling this will hide this.browser window and tests will still run
                    '--disable-infobars',
                    '--disable-gpu',
                    '--disable-extensions',
                    '--log-level=3', // fatal only
                    '--ignore-certificate-errors',
                    '--ignore-certificate-errors-spki-list'
                ]
            }
        };

        this.testTitle = "";
        this.print = console.log;

        this.key = Key;
        this.by = By;
        this.until = until;

        this.browser = new Builder().withCapabilities(capabilities).build();

        // maximize window        
        this.browser.manage().window().maximize();

        // go to url
        this.browser.get(url);

        // branding
        this.print(boxen('Test Flow Started', {
            padding: 1,
            borderStyle: 'double',
            borderColor: 'green',
            backgroundColor: 'green'
        }));
    }

    // starts a test to show output later about its success or failure
    start(title) {
        this.testTitle = title;
    }

    // end assert function
    end(result) {
        this.print(logSymbols.info, chalk.yellow("TEST: " + this.testTitle));

        if (result) {
            this.print(logSymbols.success, chalk.green("SUCCESS"));
        } else {
            this.print(logSymbols.error, chalk.red("FAILED"));

            // take screenshot for failed test
            this.takeScreenshot();
        }
    }

    // fills given form field
    async getTitle() {
        return await this.browser.getTitle();
    }

    // fills given form field
    async fillField(ByField, ByValue, value) {
        const el = await this.browser.findElement(By[ByField](ByValue));
        await el.sendKeys(value);
    }

    // waits until given element is located and also visible
    async waitForElement(ByField, ByValue) {
        const el = await this.browser.wait(until.elementLocated(By[ByField](ByValue)), timeout);
        await this.browser.wait(until.elementIsVisible(el), timeout);

        return el;
    }

    // waits until url contains given text
    async waitUntilUrlHas(keyword) {
        return await this.browser.wait(until.urlContains(keyword), timeout);
    }

    // click an element
    async click(ByField, ByValue) {
        await this.sleep(1000);
        await this.browser.findElement(By[ByField](ByValue)).click();
    }

    // submit form
    async submit(ByField, ByValue) {
        await this.sleep(1000);
        await this.browser.findElement(By[ByField](ByValue)).submit();
    }

    // gets any attribute value for given element
    async getAttributeValue(ByField, ByValue, attribute) {
        const el = await this.waitForElement(ByField, ByValue);
        return await el.getAttribute(attribute);
    }

    // gets text for given element
    async getText(ByField, ByValue) {
        const el = await this.waitForElement(ByField, ByValue);
        return await el.getText();
    }

    // checks whether or not element is present in DOM visible or not.
    async isPresent(ByField, ByValue) {
        try {
            return await this.browser.findElement(By[ByField](ByValue));
        } catch (e) {
            return false;
        }
    }

    async sleep(time) {
        await this.browser.sleep(time);
    }

    // selects value from select2 dropdown
    async selectDropDownSelect2(selector, value) {
        let el = await this.browser.findElement(By.css(selector))
            .findElement(By.xpath("following-sibling::*[1]"));

        await el.click();

        el = await this.browser.findElement(By.css("input.select2-search__field"));

        await el.sendKeys(value);
        await this.sleep(1000);
        await el.sendKeys(Key.RETURN);
    }

    // selects value from select2 dropdown by searching
    async searchDropDownSelect2(selector, value) {
        let el = await this.browser.findElement(By.css(selector))
            .findElement(By.xpath("following-sibling::*[1]"));

        await el.click();

        el = await this.browser.findElement(By.css("input.select2-search__field"));

        await el.sendKeys(value);
        await this.sleep(3000);
        await el.sendKeys(Key.BACK_SPACE);
        await el.sendKeys(Key.RETURN);
    }

    // closes browser window
    close() {
        this.browser.close();
    }

    // used to take screenshot
    takeScreenshot() {

        let dir = './failedScreens';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        this.browser.takeScreenshot().then((data) => {
            let screenshotPath = `${path.resolve(__dirname, dir)}/${this.testTitle}.png`;

            fs.writeFileSync(screenshotPath, data, 'base64');
        });
    }

    // used to show notification on right bottom of screen
    notify(message) {
        notifier.notify({
            appName: "Snore.DesktopToasts",
            title: "Heads Up!",
            message: message,
            wait: false
        });
    }
}