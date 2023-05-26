"use client";

import { format } from "date-fns";
import { FC } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { cn } from "@/lib/utils";

export type Log = {
  timestamp?: string;
  message?: string;
  status?: string;
  requestId?: string;
};

export const LogTable: FC<{
  logs: Log[];
}> = ({ logs }) => {
  return (
    <Table className="h-fit text-sm">
      <TableHeader>
        <TableRow>
          <TableHead>Timestamp</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Request Id</TableHead>
          <TableHead>Message</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map(({ timestamp, message, status, requestId }) => {
          const date = timestamp ? new Date(timestamp) : undefined;
          return (
            <TableRow
              className={cn(
                status === "START" ||
                  status === "END" ||
                  status === "REPORT" ||
                  status === "INIT_START"
                  ? "opacity-30"
                  : ""
              )}
              key={timestamp ?? "" + message ?? ""}
            >
              <TableCell className="py-0 whitespace-nowrap">
                {date
                  ? format(
                      new Date(
                        Date.UTC(
                          date.getFullYear(),
                          date.getMonth(),
                          date.getDay(),
                          date.getHours(),
                          date.getMinutes(),
                          date.getSeconds(),
                          date.getMilliseconds()
                        )
                      ),
                      "pp"
                    )
                  : "-"}
              </TableCell>
              <TableCell className="py-0 whitespace-nowrap">
                {status ?? "-"}
              </TableCell>
              <TableCell className="py-0 whitespace-nowrap">
                {requestId ?? "-"}
              </TableCell>
              <TableCell className="py-0 whitespace-nowrap">
                {message ?? "-"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
