"use client";

import dynamic from "next/dynamic";
import React from "react";
import { useEffect, useState } from "react";
import type { ApexOptions } from "apexcharts";
import dayjs from "dayjs";

type Props = {
  days?: number;
};

async function fetchStats(days: number) {
  const res = await fetch(`/api/ident/stats?days=${days}`);
  if (!res.ok) throw new Error("Failed to load stats");
  const json = await res.json();
  return json.data as { date: string; count: number }[];
}

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function IdentsCountChart({ days = 7 }: Props) {
  const [seriesData, setSeriesData] = useState<{ x: string; y: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const stats = await fetchStats(days);
        const series = stats.map((s) => ({
          x: dayjs(s.date).format("DD/MM"),
          y: s.count,
        }));
        if (mounted) setSeriesData(series);
      } catch (e) {
        console.error("Load idents chart failed", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [days]);

  const options: ApexOptions = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#5750F1"],
    xaxis: { type: "category" },
    grid: { strokeDashArray: 5 },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" },
  };
  return (
    <div style={{ minHeight: 220 }}>
      {loading ? (
        <div className="flex h-[220px] animate-pulse items-center justify-center text-gray-400">
          Đang tải biểu đồ…
        </div>
      ) : (
        <Chart
          options={options}
          series={[{ name: "Định danh", data: seriesData }]}
          type="area"
          height={220}
        />
      )}
    </div>
  );
}
