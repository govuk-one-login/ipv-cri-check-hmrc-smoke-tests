/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const argv = require("yargs/yargs")(process.argv.slice(1)).argv;
const proxyquire = require("proxyquire").noCallThru();
const syntheticsLoggerStub = require("./stubs/syntheticsStubLogger");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const syntheticsStub = require("./stubs/syntheticsStub")(argv.headless);
const fs = require("fs");

const stubs = {
  SyntheticsLogger: syntheticsLoggerStub,
  Synthetics: syntheticsStub,
};

const generate_tests = () => {
  const tests = new Map();
  fs.readdirSync("./canaries").forEach((canary) =>
    tests.set(`${canary}`, proxyquire(`../canaries/${canary}`, stubs))
  );
  // eslint-disable-next-line no-console
  console.log(tests);
  return tests;
};

const TESTS = generate_tests();

if (argv.h || !argv.test) {
  // eslint-disable-next-line no-console
  console.log(`Options:
  --test must be one of:
  ${Object.keys(TESTS)
    .map((key) => `  ${key}`)
    .join("\n")}
  [--headless] run browser in headless mode, default to false
  `);
  process.exit(1);
}

async function runTest(testName) {
  // eslint-disable-next-line no-console
  console.log(`Running ${testName}`);
  try {
    await TESTS.get(testName).handler();
    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(`test failed: ${err.message}`);
    process.exit(1);
  }
}

runTest(argv.test);
