import { S3CanariesDeployerHandler } from "../src/s3-canaries-deployer-handler";
import { Context } from "aws-lambda";

describe("s3-canaries-deployer-handler", () => {
  it("should print Hello, World!", async () => {
    const s3CanariesDeployerHandler = new S3CanariesDeployerHandler();
    const result = await s3CanariesDeployerHandler.handler({}, {} as Context);
    
    expect(result).toStrictEqual("Hello, World!");
  });
});
