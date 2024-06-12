import { LambdaInterface } from "@aws-lambda-powertools/commons";
import { Logger } from "@aws-lambda-powertools/logger";
import {
  CanaryState,
  GetCanaryCommand,
  GetCanaryResponse,
  GetCanaryRunsCommand,
  StartCanaryCommand,
  StopCanaryCommand,
  SyntheticsClient,
} from "@aws-sdk/client-synthetics";

const logger = new Logger();
const client = new SyntheticsClient();

export class CanaryInvokerHandler implements LambdaInterface {
  public async handler(
    event: { canaryName: string },
    _context: unknown
  ): Promise<void> {
    try {
      logger.info(`Running ${event.canaryName}`);

      const previousRunId = await getPreviousCanaryRunId(event.canaryName);

      let canary = await getLatestCanaryStatus(event.canaryName);

      if (canary.Canary?.Status?.State == CanaryState.RUNNING) {
        logger.info(event.canaryName + " is already running, stopping...");

        const stopCanary = await client.send(
          new StopCanaryCommand({
            Name: event.canaryName,
          })
        );

        const stopCanaryStatusCode = stopCanary.$metadata.httpStatusCode;

        if (stopCanaryStatusCode !== 200) {
          throw new Error(
            `Failed to stop already running canary, received ${stopCanaryStatusCode}`
          );
        }
      }

      canary = await getLatestCanaryStatus(event.canaryName);

      if (canary.Canary?.Status?.State != CanaryState.STOPPED) {
        await waitForCanaryToStop(event.canaryName);
      }

      logger.info("Starting canary " + event.canaryName);
      await startCanary(event.canaryName);

      const hasPassed = await waitForCanaryToPass(
        event.canaryName,
        previousRunId
      );

      if (hasPassed) {
        logger.info(event.canaryName + " has passed");
        return;
      }

      logger.error(event.canaryName + " has failed");
    } catch (error) {
      logger.error("Error executing canary:" + error);
      throw error;
    }
  }
}

async function waitForCanaryToStop(canaryName: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const interval = setInterval(async () => {
      const canary = await client.send(
        new GetCanaryCommand({
          Name: canaryName,
        })
      );
      if (canary.Canary?.Status?.State == CanaryState.STOPPED) {
        clearInterval(interval);
        logger.info("Stopped existing canary run successfully");
        resolve();
      }
    }, 5000);
  });
}

async function waitForCanaryToPass(
  canaryName: string,
  previousRunId: string
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const interval = setInterval(async () => {
      const canaryRuns = await client.send(
        new GetCanaryRunsCommand({
          Name: canaryName,
        })
      );
      const runStatus = canaryRuns?.CanaryRuns?.at(0);
      if (runStatus?.Id !== previousRunId) {
        clearInterval(interval);
        if (runStatus?.Status?.State === "PASSED") {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    }, 5000);
  });
}

async function getLatestCanaryStatus(
  canaryName: string
): Promise<GetCanaryResponse> {
  return client.send(
    new GetCanaryCommand({
      Name: canaryName,
    })
  );
}

async function getPreviousCanaryRunId(canaryName: string): Promise<string> {
  const previousRuns = await client.send(
    new GetCanaryRunsCommand({
      Name: canaryName,
    })
  );
  return previousRuns?.CanaryRuns?.at(0)?.Id || "";
}

async function startCanary(canaryName: string) {
  const startCanary = await client.send(
    new StartCanaryCommand({ Name: canaryName })
  );

  const startCanaryStatusCode = startCanary.$metadata.httpStatusCode;

  if (startCanaryStatusCode !== 200) {
    throw new Error(
      `Failed to invoke canary received ${startCanaryStatusCode}`
    );
  }
}

const handlerClass = new CanaryInvokerHandler();
export const lambdaHandler = handlerClass.handler.bind(handlerClass);
