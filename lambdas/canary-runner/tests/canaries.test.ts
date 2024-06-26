import {
  CloudFormationClient,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";
import { CanaryRunnerHandler } from "../src/canary-runner-handler";

jest.setTimeout(50 * 1000 * 4);

let canaryRunner: CanaryRunnerHandler;
const cloudFormation = new CloudFormationClient();

beforeAll(async () => {
  process.env.CANARY_NAMES = await getCanaryNames();
  const canaryModule = await import("../src/canary-runner-handler");
  canaryRunner = new canaryModule.CanaryRunnerHandler();
});

describe("Run canaries", () => {
  it("All canaries should pass", async () => {
    const canariesResult = await canaryRunner.handler({}, {});
    expect(canariesResult.success).toBe(true);
  });
});

async function getCanaryNames() {
  const stackName = process.env.STACK_NAME;

  if (!stackName) {
    throw new Error("STACK_NAME environment variable not set");
  }

  const stack = await cloudFormation.send(
    new DescribeStacksCommand({ StackName: stackName })
  );

  const canaryNames = stack.Stacks?.at(0)?.Outputs?.find(
    (output) => output?.OutputKey === "CanaryNames"
  )?.OutputValue;

  if (!canaryNames) {
    throw new Error(`Could not get canary names for stack ${stackName}`);
  }

  return canaryNames;
}
