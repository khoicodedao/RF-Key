"use client";
import { compactFormat } from "@/lib/format-number";
import { OverviewCard } from "./card";
import * as icons from "./icons";
import { fetchUnits } from "@/app/units/features/api";
import { fetchIdents } from "@/app/ident/features/api";
import { useCallback, useEffect, useState } from "react";

export default function OverviewCardsGroup() {
  const [units, setUnits] = useState([]);
  const [identCount, setIdentCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const unitRes = await fetchUnits();
      const identRes = await fetchIdents({ filter: "", page: 1, limit: 1000 });
      setUnits(unitRes);
      setIdentCount(identRes.countTotal);
    } catch (err) {
      console.error("Lỗi tải dữ liệu đơn vị:", err);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-2 xl:grid-cols-2 2xl:gap-7.5">
      <OverviewCard
        label="Tổng số đơn vị"
        data={{
          growthRate: 0,
          value: compactFormat(units?.length || 0),
        }}
        Icon={icons.Views}
      />

      <OverviewCard
        label="Tổng số định danh"
        data={{
          growthRate: 10,
          value: compactFormat(identCount || 0),
        }}
        Icon={icons.Product}
      />
    </div>
  );
}
