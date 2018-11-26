/**
 * Custom Tester Class
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
 * Selenium WebDriver version: 4.0.0-alpha.1
 * 
 */

/////////////////////////////////////////////
// needed packages
/////////////////////////////////////////////

require('chromedriver');
require('pretty-error').start();

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
/////////////////////////////////////////////

const timeout = 60000;

let testCount = 0;

module.exports = class Tester {

    constructor(url, hideWindow = false) {

        if (!url) {
            this.print(chalk.red("url is required!"));
            return;
        }

        let args = [
            '--log-level=3', // fatal only
            '--start-maximized',
            '--no-default-browser-check',
            '--no-experiments',
            '--ignore-gpu-blacklist',
            '--ignore-certificate-errors',
            '--ignore-certificate-errors-spki-list',
            '--disable-infobars',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-default-apps',
            '--disable-accelerated-video',
            '--disable-background-mode',
            '--disable-plugins',
            '--disable-plugins-discovery',
            '--disable-translate',
            '--disable-logging',
            '--disable-web-security',
            '--disable-site-isolation-trials'
        ];

        // see whether to hide browser window
        if (hideWindow) {
            args.push('headless');
            args.push('--window-size=1366x768'); // fix for headless lesser window size
        }

        let capabilities = {
            browserName: 'chrome',
            loggingPrefs: {
                'driver': 'OFF',
                'server': 'OFF',
                'browser': 'OFF'
            },
            chromeOptions: {
                args: args
            }
        };

        this.testTitle = "";
        this.print = console.log;

        this.key = Key;
        this.by = By;
        this.until = until;

        this.browser = new Builder().withCapabilities(capabilities).build();

        // go to url
        this.browser.get(url);
    }

    // starts a test to show output later about its success or failure
    start(title) {
        this.testTitle = title;
    }

    // end assert function
    end(result) {
        testCount++;

        let text = "";
        let count = ('0' + testCount).slice(-2);

        if (result) {
            text = chalk.bgGreen(chalk.black(" PASS ")) + ` [${count}] ${chalk.green(this.testTitle)}`;
        } else {
            text = chalk.bgRed(chalk.black(" FAIL ")) + ` [${count}] ${chalk.red(this.testTitle)}`;
            this.takeScreenshot();
        }

        // add first empty line
        if (testCount === 1) {
            this.print("");
        }

        this.print(text);
    }

    highlightElement(element) {
        this.browser
            .executeScript("arguments[0].setAttribute(arguments[1], arguments[2])", element, "style", "border: 1px solid red;");
    }

    // checks if given text contains given keyword
    contains(text, keyword) {
        text = text.toString();
        keyword = keyword.toString();

        return text.toLowerCase().indexOf(keyword.toLowerCase()) > -1;
    }

    // go to given url
    async goto(url) {
        return await this.browser.get(url);
    }

    // gets title of the page
    async getTitle() {
        return await this.browser.getTitle();
    }

    // switches to active element on the page
    async switchToActiveElement() {
        await this.browser.switchTo().activeElement();
    }

    // fills given form field
    async fillField(ByField, ByValue, value) {
        const el = await this.browser.findElement(By[ByField](ByValue));
        //this.highlightElement(el);
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

    // finds element in DOM visible or not.
    async findElement(ByField, ByValue) {
        return await this.browser.findElement(By[ByField](ByValue));
    }

    // finds elements in DOM visible or not.
    async findElements(ByField, ByValue) {
        return await this.browser.findElements(By[ByField](ByValue));
    }

    // checks whether or not element is present in DOM visible or not.
    async isPresent(ByField, ByValue) {
        try {
            await this.browser.findElement(By[ByField](ByValue));
            return true;
        } catch (e) {
            return false;
        }
    }

    async sleep(time) {
        await this.browser.sleep(time);
    }

    // selects value from select2 dropdown
    async selectDropDownSelect2(selector, value) {
        await this.sleep(250);

        let el = await this.browser.findElement(By.css(selector))
            .findElement(By.xpath("following-sibling::*[1]"));

        await el.click();

        await this.sleep(1000);

        el = await this.browser.findElement(By.css("input.select2-search__field"));

        await el.sendKeys(value);
        await this.sleep(1000);
        await el.sendKeys(Key.RETURN);
    }

    // selects value from select2 dropdown by searching
    async searchDropDownSelect2(selector, value) {
        await this.sleep(250);

        let el = await this.browser.findElement(By.css(selector))
            .findElement(By.xpath("following-sibling::*[1]"));

        await el.click();

        await this.sleep(1000);

        el = await this.browser.findElement(By.css("input.select2-search__field"));

        await el.sendKeys(value);
        await this.sleep(3000);
        await el.sendKeys(Key.BACK_SPACE);
        await el.sendKeys(Key.RETURN);
    }

    // scrolls to bottom of page
    async scrollBottom(pixels) {
        const scrollTo = pixels || 'document.body.scrollHeight';

        await this.browser.executeScript(`window.scrollTo(0,${scrollTo})`);

        await this.sleep(1000);
    }

    // scrolls to top of page
    async scrollTop(pixels) {
        const scrollTo = pixels || 0;

        await this.browser.executeScript(`window.scrollTo(0,${scrollTo})`);

        await this.sleep(1000);
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