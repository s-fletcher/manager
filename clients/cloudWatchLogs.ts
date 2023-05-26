import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";

export const cloudWatchLogs = new CloudWatchLogsClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "NOT_SET",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "NOT_SET",
  },
});
