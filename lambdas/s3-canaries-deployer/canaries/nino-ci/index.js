let { getParameter } = require("@aws-lambda-powertools/parameters/ssm").getParameter;
let synthetics = require("Synthetics");
let log = require("SyntheticsLogger");

const recordedScript = async function () {
  const stubUrl = await getParameter(
    "/check-hmrc-cri-api/smoke-tests/core-stub-url"
  );
  let page = await synthetics.getPage();
  const navigationPromise = page.waitForNavigation();
  await synthetics.executeStep("Goto Stubs Page", async function () {
    await page.goto(stubUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  });
  await page.setViewport({ width: 1364, height: 695 });
  log.info(`Arrived at ${page.url()}`);
  await synthetics.executeStep(
    "Click Check HMRC Build Evidence Requested",
    async function () {
      await page.waitForSelector(
        ".govuk-template__body > .govuk-width-container > #main-content > a:nth-child(5) > .govuk-button"
      );
      await page.click(
        ".govuk-template__body > .govuk-width-container > #main-content > a:nth-child(5) > .govuk-button"
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
    await page.waitForSelector(
      "#main-content > div.govuk-\\!-padding-bottom-9 > legend > a"
    );
    await page.click(
      "#main-content > div.govuk-\\!-padding-bottom-9 > legend > a"
    );
  });
  await navigationPromise;
  await synthetics.executeStep("Click Firstname Box", async function () {
    await page.waitForSelector(
      ".govuk-width-container > #main-content #firstName"
    );
    await page.click(".govuk-width-container > #main-content #firstName");
  });
  await synthetics.executeStep("Enter Firstname", async function () {
    await page.type(".govuk-width-container > #main-content #firstName", "Jim");
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
      "Ferguson"
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
    if (json.vc.evidence[0].ci) {
      throw new Error("Assertion failed: CI is present in the data");
    }
  });
};
exports.handler = async () => {
  return await recordedScript();
};

const { getParameter } = require("@aws-lambda-powertools/parameters/ssm");
const synthetics = require("Synthetics");
const log = require("SyntheticsLogger");

const recordedScript = async function () {
  const stubUrl = await getParameter(
    "/check-hmrc-cri-api/smoke-tests/core-stub-url"
  );
  let page = await synthetics.getPage();
  const navigationPromise = page.waitForNavigation();
  await synthetics.executeStep("Goto Stubs Page", async function () {
    await page.goto(stubUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  });
  await page.setViewport({ width: 1364, height: 695 });
  log.info(`Arrived at ${page.url()}`);
  await synthetics.executeStep(
    "Click Check HMRC Build Evidence Requested",
    async function () {
      await page.waitForSelector(
        ".govuk-template__body > .govuk-width-container > #main-content > a:nth-child(5) > .govuk-button"
      );
      await page.click(
        ".govuk-template__body > .govuk-width-container > #main-content > a:nth-child(5) > .govuk-button"
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
    await page.waitForSelector(
      "#main-content > div.govuk-\\!-padding-bottom-9 > legend > a"
    );
    await page.click(
      "#main-content > div.govuk-\\!-padding-bottom-9 > legend > a"
    );
  });
  await navigationPromise;
  await synthetics.executeStep("Click Firstname Box", async function () {
    await page.waitForSelector(
      ".govuk-width-container > #main-content #firstName"
    );
    await page.click(".govuk-width-container > #main-content #firstName");
  });
  await synthetics.executeStep("Enter Firstname", async function () {
    await page.type(".govuk-width-container > #main-content #firstName", "Jim");
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
      "Ferguson"
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
    if (json.vc.evidence[0].ci) {
      throw new Error("Assertion failed: CI is present in the data");
    }
  });
};
exports.handler = async () => {
  return await recordedScript();
};
