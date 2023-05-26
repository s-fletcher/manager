"use client";

import { FC, useState } from "react";
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

export const StacksComboBox: FC<{ stackNames: string[] }> = ({
  stackNames,
}) => {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("stack") ?? "");
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[250px] justify-between", value ? "" : "opacity-50")}
        >
          <span className="text-ellipsis whitespace-nowrap overflow-hidden">
            {value ||
              `Select from ${stackNames.length} stack${
                stackNames.length !== 1 ? "s" : ""
              }`}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search stacks..." />
          <CommandEmpty>No stack found.</CommandEmpty>
          <CommandGroup>
            {stackNames.map((name) => (
              <CommandItem
                key={name}
                onSelect={() => {
                  setValue(name === value ? "" : name);
                  const params = new URLSearchParams(searchParams);
                  if (name === value) {
                    params.delete("stack");
                  } else {
                    params.set("stack", name);
                  }
                  params.delete("logGroups");
                  router.replace(`${pathname}?${params}`);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === name ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="text-ellipsis whitespace-nowrap overflow-hidden">
                  {name}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
