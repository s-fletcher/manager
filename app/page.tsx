import { cloudFormation } from "@/clients/cloudFormation";
import { cloudWatchLogs } from "@/clients/cloudWatchLogs";
import { LogGroupsComboBox } from "@/components/log-groups-combo-box";
import { Log, LogTable } from "@/components/log-table";
import { StacksComboBox } from "@/components/stacks-combo-box";
import {
  DescribeStackResourcesCommand,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";
import {
  GetQueryResultsCommand,
  GetQueryResultsCommandOutput,
  StartQueryCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import { getUnixTime, subMinutes } from "date-fns";

const timestampRegex =
  /(?<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)/;
const requestIdRegex =
  /(?<requestId>[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})/;
const regex = new RegExp(
  `^${timestampRegex.source}\\t${requestIdRegex.source}\\t(?<status>ERROR|INFO)\\t(?<message>[\\s\\S]*)`,
  "m"
);

export default async function Page({
  searchParams: { stack, logGroups },
}: {
  searchParams: { stack?: string; logGroups?: string[] };
}) {
  const stacksResponse = await cloudFormation.send(
    new DescribeStacksCommand({})
  );

  const stackNames =
    stacksResponse.Stacks?.map(({ StackName }) => StackName ?? "") ?? [];
  let logGroupNames: string[] | undefined = undefined;
  let logs: Log[] = [];
  if (stack) {
    const logGroupsResponse = await cloudFormation.send(
      new DescribeStackResourcesCommand({ StackName: stack })
    );
    logGroupNames =
      logGroupsResponse.StackResources?.filter(
        ({ ResourceType }) => ResourceType === "AWS::Logs::LogGroup"
      ).map(({ PhysicalResourceId }) => PhysicalResourceId ?? "") ?? [];

    const logGroupsToQuery = logGroups ?? logGroupNames;
    const { queryId } = await cloudWatchLogs.send(
      new StartQueryCommand({
        logGroupNames: logGroupsToQuery,
        startTime: getUnixTime(subMinutes(new Date(), 30)),
        endTime: getUnixTime(new Date()),
        queryString: `fields @timestamp, @message`,
      })
    );

    if (!queryId) {
      return <>No query id</>;
    }

    let queryResult: GetQueryResultsCommandOutput;
    let isLoading = true;
    do {
      queryResult = await cloudWatchLogs.send(
        new GetQueryResultsCommand({ queryId })
      );

      if (queryResult.status === "Running") {
        await new Promise((resolve) =>
          setTimeout(() => resolve(undefined), 1000)
        );
      } else {
        isLoading = false;
      }
    } while (isLoading);

    logs =
      queryResult.results?.map(([timestamp, message]) => {
        const execResult = regex.exec(message.value?.trim() ?? "");

        const result = {
          timestamp: timestamp.value,
          message: execResult?.groups?.message ?? message.value,
          requestId: execResult?.groups?.requestId,
          status: execResult?.groups?.status,
        };

        if (!result.message) {
          return result;
        }

        const systemRequestIdRegex = new RegExp(
          `^RequestId: ${requestIdRegex.source}`
        );
        if (result.message.startsWith("END")) {
          result.status = "END";
          result.message = result.message.replace(/^END/, "").trim();
          result.requestId = systemRequestIdRegex.exec(
            result.message
          )?.groups?.requestId;
          result.message = result.message
            .replace(systemRequestIdRegex, "")
            .trim();
        }
        if (message.value?.startsWith("REPORT")) {
          result.status = "REPORT";
          result.message = result.message.replace(/^REPORT/, "").trim();
          result.requestId = systemRequestIdRegex.exec(
            result.message
          )?.groups?.requestId;
          result.message = result.message
            .replace(systemRequestIdRegex, "")
            .trim();
        }
        if (message.value?.startsWith("START")) {
          result.status = "START";
          result.message = result.message.replace(/^START/, "").trim();
          result.requestId = systemRequestIdRegex.exec(
            result.message
          )?.groups?.requestId;
          result.message = result.message
            .replace(systemRequestIdRegex, "")
            .trim();
        }
        if (message.value?.startsWith("INIT_START")) {
          result.status = "INIT_START";
          result.message = result.message.replace(/^INIT_START/, "").trim();
        }

        return result;
      }) ?? [];
  }

  return (
    <div className="p-4">
      <div className="flex gap-4">
        <StacksComboBox stackNames={stackNames} />
        {logGroupNames && <LogGroupsComboBox logGroupNames={logGroupNames} />}
      </div>
      <LogTable logs={logs} />
    </div>
  );
}
