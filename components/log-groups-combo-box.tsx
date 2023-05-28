"use client";

import { FC, useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Check } from "lucide-react";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const LogGroupsComboBox: FC<{ logGroupNames: string[] }> = ({
  logGroupNames,
}) => {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setValues(searchParams.getAll("logGroups"));
  }, [searchParams]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-[500px] justify-between",
            values.length === 0 ? "opacity-50" : ""
          )}
        >
          {values.length
            ? `${values.length} log groups selected`
            : logGroupNames.length
            ? `Select from ${logGroupNames.length} log group${
                logGroupNames.length !== 1 ? "s" : ""
              }`
            : "No log groups found"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0">
        <Command
          filter={(value, search) => {
            if (value.includes(search)) return 1;
            return 0;
          }}
        >
          <CommandInput placeholder="Search stacks..." />
          <CommandEmpty>No log group found.</CommandEmpty>
          <CommandGroup>
            {logGroupNames.map((name) => (
              <CommandItem
                key={name}
                onSelect={() => {
                  let newValues = [...values];
                  if (values.includes(name)) {
                    newValues = values.filter((value) => value !== name);
                  } else {
                    newValues = [...values, name];
                  }
                  setValues(newValues);
                  const params = new URLSearchParams(searchParams);
                  params.delete("logGroups");
                  for (const value of newValues) {
                    params.append("logGroups", value);
                  }
                  router.replace(`${pathname}?${params}`);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    values.includes(name) ? "opacity-100" : "opacity-0"
                  )}
                />
                <p className="text-ellipsis whitespace-nowrap overflow-hidden">
                  {name}
                </p>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
