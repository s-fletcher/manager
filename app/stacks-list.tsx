"use client";

import { Item, ListBox } from "@/components/ui/list";
import { FC } from "react";
import { useRouter, useSelectedLayoutSegments } from "next/navigation";

export const StacksList: FC<{ stackNames: string[] }> = ({ stackNames }) => {
  const router = useRouter();
  const [, stackName] = useSelectedLayoutSegments();

  return (
    <ListBox
      onSelectionChange={([key]) => {
        if (typeof key !== "string") {
          return;
        }
        router.push(`/stacks/${key}`);
      }}
      defaultSelectedKeys={[stackName]}
      selectionMode="single"
      className="border-r border-slate-200 h-screen max-w-[200px] flex-none overflow-y-auto"
    >
      {stackNames.map((name) => (
        <Item key={name}>{name}</Item>
      ))}
    </ListBox>
  );
};
