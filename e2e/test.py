import os
import time
import logging
import unittest

from selenium import webdriver
from selenium.common import NoSuchElementException, ElementNotInteractableException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait

GEOSHOP_FRONT = os.environ.get("GEOSHOP_FRONT", "http://localhost:4200")
USERNAME = os.environ.get("GEOSHOP_USERNAME", "")
PASSWORD = os.environ.get("GEOSHOP_PASSWORD", "")

logger = logging.getLogger()
logger.level = logging.DEBUG


class E2ETests(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        logger.info("Starting tests")
        cls._driver = webdriver.Firefox()
        cls._driver.implicitly_wait(5)

    @classmethod
    def tearDownClass(cls):
        # cls._driver.close()
        pass

    @classmethod
    def click(cls, selector):
        cls._driver.find_element(By.CSS_SELECTOR, selector).click()
        time.sleep(1)

    @classmethod
    def keys(cls, selector, text):
        cls._driver.find_element(By.CSS_SELECTOR, selector).send_keys(text)
        time.sleep(1)

    @classmethod
    def getText(cls, selector):
        return cls._driver.find_element(By.CSS_SELECTOR, selector).text

    @classmethod
    def waitUrl(cls, url):
        errors = [NoSuchElementException, ElementNotInteractableException]
        wait = WebDriverWait(
            cls._driver, timeout=2, poll_frequency=0.2, ignored_exceptions=errors
        )
        wait.until(lambda _: url in cls._driver.current_url)

    @classmethod
    def go(cls, url, waitFor=""):
      cls._driver.get(url)
      time.sleep(1)
      cls.waitUrl(url if not waitFor else waitFor)
      time.sleep(1)

    def setUp(self):
        super().setUp()
        self.go(GEOSHOP_FRONT, "de/welcome?bounds")

    def doLogin(self):
        self.click("mat-toolbar button:nth-of-type(2)")
        self.click("button.mat-mdc-menu-item")
        self.waitUrl("zitadel")
        maybeUser = self._driver.find_elements(By.CSS_SELECTOR, "button[value='0']")
        if maybeUser:
            maybeUser[0].click()
        self.keys("#loginName", USERNAME)
        self.click("#submit-button")
        self.keys("#password", PASSWORD)
        self.click("#submit-button")
        self.waitUrl("de/welcome")

    def doLogout(self):
        self.click("mat-toolbar button:nth-of-type(2)")
        time.sleep(1)
        self.click("button.mat-mdc-menu-item:nth-of-type(3)")
        self.waitUrl("de/welcome?bounds")

    def ensureLoggedIn(self):
        self.click("mat-toolbar button:nth-of-type(2)")
        menu = self._driver.find_elements(By.CSS_SELECTOR, ".overlay-container .mat-mdc-menu-item")
        if len(menu) == 1:
            self.click(".cdk-overlay-backdrop")
            self.doLogin()

    def ensureLoggedOut(self):
        self.click("mat-toolbar button:nth-of-type(2)")
        menu = self._driver.find_elements(By.CSS_SELECTOR, ".overlay-container .mat-mdc-menu-item")
        if len(menu) == 4:
            self.click(".cdk-overlay-backdrop")
            self.doLogout()

    def testLoginLogout(self):
        self.doLogin()
        self.doLogout()

    testCases = [
        (False, "/de", "Not authenticated"),
        (False, "", "Not authenticated"),
        (True, "/de", "No order item with token"),
        (True, "", "No order item with token"),
    ]
    def testValidateLoggedOut(self):
        for loggedIn, langPrefix, expect in self.testCases:
            with self.subTest(loggedIn=loggedIn, langPrefix=langPrefix, expect=expect):
                if loggedIn:
                  self.ensureLoggedIn()
                else:
                  self.ensureLoggedOut()
                print("HERE", loggedIn, langPrefix, expect)
                self.go(f"{GEOSHOP_FRONT}{langPrefix}/welcome/validate/orderitem/Token", "orderitem/Token")
                self.assertIn(expect, self.getText(".mat-mdc-card-content"))

if __name__ == "__main__":
    unittest.main()
