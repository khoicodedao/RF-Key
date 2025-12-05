"use client";

import { cn } from "@/lib/utils";
import { IdentsCountChart } from "./chart";
import { Select } from "antd";
import React from "react";

type PropsType = {
  className?: string;
};

export function IdentsCount({ className }: PropsType) {
  const [days, setDays] = React.useState<number>(7);

  return (
    <div
      className={cn(
        "rounded-[10px] bg-white px-6 py-5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-body-lg font-bold text-dark dark:text-white">
          Số định danh
        </h2>
        <Select
          value={days}
          onChange={(v) => setDays(Number(v))}
          options={[
            { value: 7, label: "7 ngày" },
            { value: 30, label: "30 ngày" },
            { value: 90, label: "90 ngày" },
          ]}
          style={{ width: 120 }}
        />
      </div>
      <div className="mt-3">
        <IdentsCountChart days={days} />
      </div>
    </div>
  );
}
