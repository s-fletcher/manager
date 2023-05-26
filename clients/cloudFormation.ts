import { CloudFormationClient } from "@aws-sdk/client-cloudformation";

export const cloudFormation = new CloudFormationClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "NOT_SET",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "NOT_SET",
  },
});
