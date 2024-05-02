import { CanaryInvokerHandler } from "../src/canary-invoker-handler";
import { Context } from "aws-lambda";

describe("canary-invoker-handler", () => {
  it("should print Hello, World!", async () => {
    const canaryInvokerHandler = new CanaryInvokerHandler();
    const result = await canaryInvokerHandler.handler({}, {} as Context);
    expect(result).toStrictEqual("Hello, World!");
  });
});
