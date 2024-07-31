const synthetics = require("Synthetics");
const log = require("SyntheticsLogger");

const coreStubUrl = process.env.CoreStubUrl;
const coreStubButton = process.env.CoreStubButton;

const escapeXpathString = (str) => {
  return str.replace(/'/g, `', "'", '`);
};
const clickByText = async (page, text) => {
  const escapedText = escapeXpathString(text);
  const linkHandlers = await page.$x(
    "//a[contains(text(), '" + escapedText + "')]"
  );
  if (linkHandlers.length > 0) {
    await linkHandlers[0].click();
  } else {
    throw new Error("Link not found:" + text);
  }
};
const recordedScript = async function () {
  const page = await synthetics.getPage();
  const navigationPromise = page.waitForNavigation();
  await synthetics.executeStep("Goto Stubs Page", async function () {
    await page.goto(coreStubUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
  });
  await page.setViewport({ width: 1364, height: 695 });
  await synthetics.executeStep(
    "Click Check HMRC Build Evidence Requested",
    async function () {
      await page.waitForSelector(
        `.govuk-template__body > .govuk-width-container > #main-content > a:nth-child(${coreStubButton}) > .govuk-button`
      );
      await page.click(
        `.govuk-template__body > .govuk-width-container > #main-content > a:nth-child(${coreStubButton}) > .govuk-button`
      );
    }
  );
  await navigationPromise;
  await synthetics.executeStep(
    "Click Continue on Evidence Requested page",
    async function () {
      await page.waitForSelector(
        "form > .govuk-form-group > .govuk-fieldset > .govuk-button-group > .govuk-button"
      );
      await page.click(
        "form > .govuk-form-group > .govuk-fieldset > .govuk-button-group > .govuk-button"
      );
    }
  );
  await navigationPromise;
  await synthetics.executeStep("Click New User Hyperlink", async function () {
    await clickByText(page, "New User");
  });
  await navigationPromise;
  await synthetics.executeStep("Click Firstname Box", async function () {
    await page.waitForSelector(
      ".govuk-width-container > #main-content #firstName"
    );
    await page.click(".govuk-width-container > #main-content #firstName");
  });
  await synthetics.executeStep("Enter Firstname", async function () {
    await page.type(
      ".govuk-width-container > #main-content #firstName",
      "Error"
    );
  });
  await synthetics.executeStep("Click Surname Box", async function () {
    await page.waitForSelector(
      ".govuk-width-container > #main-content #surname"
    );
    await page.click(".govuk-width-container > #main-content #surname");
  });
  await synthetics.executeStep("Enter Surname", async function () {
    await page.type(
      ".govuk-width-container > #main-content #surname",
      "NoCidForNino"
    );
  });
  await synthetics.executeStep("Click Go", async function () {
    await page.waitForSelector(
      ".govuk-template__body > .govuk-width-container > #main-content > form > .govuk-button"
    );
    await page.click(
      ".govuk-template__body > .govuk-width-container > #main-content > form > .govuk-button"
    );
  });
  await navigationPromise;
  await synthetics.executeStep("Click NI Box", async function () {
    await page.waitForSelector(".govuk-grid-row #nationalInsuranceNumber");
    await page.click(".govuk-grid-row #nationalInsuranceNumber");
  });
  await synthetics.executeStep("Enter NINO", async function () {
    await page.type(".govuk-grid-row #nationalInsuranceNumber", "AA123456C");
  });
  await synthetics.executeStep("Click Continue", async function () {
    await page.waitForSelector("#main-content #continue");
    await page.click("#main-content #continue");
  });
  await navigationPromise;
  await synthetics.executeStep("Click Retry Button", async function () {
    await page.waitForSelector(
      ".govuk-form-group > #retryNationalInsuranceRadio-fieldset #retryNationalInsuranceRadio"
    );
    await page.click(
      ".govuk-form-group > #retryNationalInsuranceRadio-fieldset #retryNationalInsuranceRadio"
    );
  });
  await synthetics.executeStep("Enter Retry NINO", async function () {
    await page.type(
      ".govuk-form-group > #retryNationalInsuranceRadio-fieldset #retryNationalInsuranceRadio",
      "retryNationalInsurance"
    );
  });
  await synthetics.executeStep("Click Continue", async function () {
    await page.waitForSelector("#main-content #continue");
    await page.click("#main-content #continue");
  });
  await navigationPromise;
  await synthetics.executeStep("Click Continue", async function () {
    await page.waitForSelector("#main-content #continue");
    await page.click("#main-content #continue");
  });
  await navigationPromise;
  await synthetics.executeStep(
    "VerifyVerifiableCredentials",
    async function () {
      const spanSelector = ".govuk-details__summary-text";
      await page.waitForSelector(spanSelector, { timeout: 60000 });
      const headingSelector = ".govuk-heading-l";
      await page.waitForSelector(headingSelector, { timeout: 60000 });
    }
  );
  await synthetics.executeStep("Get VC And Assert CI", async function () {
    const data = await page.evaluate(() => {
      const element = document.querySelector("[id='data']");
      return element.textContent.trim();
    });
    log.info("Extracted data:", data);
    const json = JSON.parse(data);
    if (!json.vc.evidence[0].ci) {
      throw new Error("Assertion failed: 'CI' is not present in the data");
    }
  });
};
exports.handler = async () => {
  return await recordedScript();
};
