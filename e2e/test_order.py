import os
import time
import logging
import unittest

from selenium import webdriver
from selenium.common import NoSuchElementException, ElementNotInteractableException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait

GEOSHOP_FRONT = os.environ.get("GEOSHOP_FRONT", "http://localhost:4200")
USERNAME = os.environ.get("USERNAME", "")
PASSWORD = os.environ.get("PASSWORD", "")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

_CHUR = "welcome?bounds=2759037.7268732986,1190318.5557162373,2759581.2268732986,1191097.5557162373"
DEFAULT_MARIONETTE_PORT = 2828

class E2ETests(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        logger.info("Starting tests")
        options = webdriver.FirefoxOptions()
        options.add_argument("--no-sandbox")
        options.enable_downloads = True
        cls._driver = webdriver.Firefox(options = options)
        cls._driver.implicitly_wait(5)

    @classmethod
    def tearDownClass(cls):
        cls._driver.close()

    @classmethod
    def click(cls, selector):
        cls._driver.find_element(By.CSS_SELECTOR, selector).click()
        time.sleep(1)

    @classmethod
    def clickAt(cls, selector, x, y):
        element = cls._driver.find_element(By.CSS_SELECTOR, selector)
        ActionChains(cls._driver).move_to_element_with_offset(element, x, y).click().perform()
        time.sleep(1)

    @classmethod
    def keys(cls, selector, text):
        cls._driver.find_element(By.CSS_SELECTOR, selector).send_keys(text)
        time.sleep(1)

    @classmethod
    def getText(cls, selector):
        el = cls._driver.find_element(By.CSS_SELECTOR, selector)
        return el.text or el.get_attribute("value")

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
        self.go(GEOSHOP_FRONT, "welcome?bounds")
        self.ensureLoggedIn()

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
        self.waitUrl("welcome")

        maybeConfirm = self._driver.find_elements(By.XPATH, "/html/body/div[2]/div[2]/div/mat-dialog-container/div/div/gs2-confirm-dialog/div[2]/button[1]")
        if maybeConfirm:
            maybeConfirm[0].click()

    def doLogout(self):
        self.click("mat-toolbar button:nth-of-type(2)")
        time.sleep(1)
        self.click("button.mat-mdc-menu-item:nth-of-type(4)")
        self.waitUrl("welcome?bounds")

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

    def selectArea(self):
        self.click(".map-button-container button:nth-of-type(2)")
        self.clickAt("#map", 100, 100)
        self.clickAt("#map", 150, 150)

    def selectProducts(self):
        carts = self._driver.find_elements(By.CSS_SELECTOR, "button.item-cart")
        carts[0].click()
        carts[1].click()

    def startOrder(self):
        self.click(".mat-mdc-menu-trigger:nth-of-type(3)")
        self.click(".mat-mdc-menu-item:nth-of-type(4)")

    def orderNext(self):
        self.click(".mat-horizontal-stepper-content-current .mat-stepper-next")

    def orderBack(self):
        self.click(".mat-stepper-previous")

    def orderSubmit(self):
        self.click(".mat-horizontal-stepper-content-current button[type='submit']:enabled")

    def selectOrderTypes(self):
        selectors = self._driver.find_elements(By.CSS_SELECTOR, "td mat-select")
        selectors[0].click()
        self.click("mat-option")
        selectors[1].click()
        self.click("mat-option")

    def fillContact(self, seed=""):
        self.keys("input[formcontrolname='first_name']", f"{seed} First name")
        self.keys("input[formcontrolname='last_name']", f"{seed} Last name")
        self.keys("input[formcontrolname='email']", "test@example.com")
        self.keys("input[formcontrolname='company_name']", "Test Company")
        self.keys("input[formcontrolname='ide_id']", "CHE-012.345.678")
        self.keys("input[formcontrolname='phone']", "0225232523")
        self.keys("input[formcontrolname='street']", "123 Main St")
        self.keys("input[formcontrolname='street2']", "Apt 4B")
        self.keys("input[formcontrolname='postcode']", "12345")
        self.keys("input[formcontrolname='city']", "Test City")

    def testSimpleOrder(self):
        self.go(f"{GEOSHOP_FRONT}/{_CHUR}", "welcome?bounds")
        time.sleep(5)
        self.selectProducts()
        self.selectArea()
        self.startOrder()
        self.keys("textarea[formcontrolname='title']", "Sample name")
        self.orderNext()
        self.orderNext()
        self.selectOrderTypes()
        self.orderSubmit()
        assert "succès" in self.getText(".mat-mdc-simple-snack-bar")
        self.click(".mat-mdc-snack-bar-action")

    def prepareContactTest(self):
        self.go(f"{GEOSHOP_FRONT}/{_CHUR}", "welcome?bounds")
        time.sleep(5)
        self.selectProducts()
        self.selectArea()
        self.startOrder()
        self.keys("textarea[formcontrolname='title']", "Sample name")
        self.orderNext()

    def testOrderWithContact(self):
        self.prepareContactTest()
        self.click("mat-radio-group[formcontrolname='addressChoice'] mat-radio-button:nth-of-type(2)")
        self.click(".autocomplete-action-button")
        self.fillContact()
        self.orderNext()
        assert "Contact ajout" in self.getText(".mat-mdc-simple-snack-bar")

        self.selectOrderTypes()
        self.orderSubmit()
        assert "succès" in self.getText(".mat-mdc-simple-snack-bar")
        self.click(".mat-mdc-snack-bar-action")

    def testContactCreateDelete(self):
        seed = "SEED_TEST"
        self.prepareContactTest()
        self.click("mat-radio-group[formcontrolname='addressChoice'] mat-radio-button:nth-of-type(2)")
        self.click(".autocomplete-action-button")
        self.fillContact(seed)
        self.orderNext()
        assert "Contact ajout" in self.getText(".mat-mdc-simple-snack-bar")
        self.click(".mat-mdc-snack-bar-action")

        self.prepareContactTest()
        self.click("mat-radio-group[formcontrolname='addressChoice'] mat-radio-button:nth-of-type(2)")
        self.click(".autocomplete-action-button")
        self.click("input[formcontrolname='customer']")
        self.keys("input[formcontrolname='customer']", f"{seed} First name")
        self.click("mat-option")
        assert f"{seed} First name" in self.getText("input[formcontrolname='first_name']")

        self.click("button[aria-label*='Supprimer']")
        self.click("mat-dialog-container button:nth-of-type(2)")
        self.prepareContactTest()
        self.click("mat-radio-group[formcontrolname='addressChoice'] mat-radio-button:nth-of-type(2)")
        self.click(".autocomplete-action-button")
        self.click("input[formcontrolname='customer']")
        self.keys("input[formcontrolname='customer']", f"{seed} First name")
        assert len(self._driver.find_elements(By.CSS_SELECTOR, "mat-option")) == 0


if __name__ == "__main__":
    unittest.main()
