import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import * as fs from "fs-extra";
import * as path from "path";
import * as cfnResponse from "cfn-response";
import { Context, CloudFormationCustomResourceEvent } from "aws-lambda";
import type { LambdaInterface } from "@aws-lambda-powertools/commons/types";

export class S3CanariesDeployerHandler implements LambdaInterface {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({ region: "eu-west-2" });
  }

  public async handler(
    event: CloudFormationCustomResourceEvent,
    context: Context
  ) {
    const fileList = fs.readdirSync(".");

    // eslint-disable-next-line no-console
    console.log(`Files and folders in the directory: ${fileList}`);
    // eslint-disable-next-line no-console
    console.log("About to print bucket input name");
    const bucketName = event.ResourceProperties.BucketName;
    // eslint-disable-next-line no-console
    console.dir(bucketName);
    const sourceFolder = path.resolve(__dirname, "..", "canaries");
    // eslint-disable-next-line no-console
    console.log(`sourceFolder path: ${sourceFolder}`);
    // eslint-disable-next-line no-console
    console.log(`Files and folders in the directory: ${sourceFolder}`);

    try {
      switch (event.RequestType) {
        case "Create":
        case "Update":
          await this.uploadFolderToS3(bucketName, sourceFolder);
          break;
        case "Delete":
          await this.deleteFolderFromS3(bucketName);
          break;
      }

      cfnResponse.send(event, context, cfnResponse.SUCCESS, {
        BucketName: bucketName,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      cfnResponse.send(event, context, cfnResponse.FAILED, {
        BucketName: bucketName,
      });
    }
  }

  private async uploadFolderToS3(bucketName: string, folderPath: string) {
    const files = await fs.readdir(folderPath);
    // eslint-disable-next-line no-console
    console.log(`files : ${files}`);
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const fileContent = await fs.readFile(filePath);

      const params = {
        Bucket: bucketName,
        Key: file,
        Body: fileContent,
      };

      await this.s3Client.send(new PutObjectCommand(params));
    }
  }

  private async deleteFolderFromS3(bucketName: string) {
    const items = await this.s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
      })
    );

    if (!items.Contents || items.Contents.length === 0) return;

    const deleteParams = {
      Bucket: bucketName,
      Delete: { Objects: items.Contents.map(({ Key }) => ({ Key })) },
    };

    await this.s3Client.send(new DeleteObjectsCommand(deleteParams));

    if (items.IsTruncated) await this.deleteFolderFromS3(bucketName);
  }
}

const handlerClass = new S3CanariesDeployerHandler();
export const lambdaHandler = handlerClass.handler.bind(handlerClass);
