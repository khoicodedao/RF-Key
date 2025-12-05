import { PaymentsOverview } from "@/components/Charts/payments-overview";
import { WeeksProfit } from "@/components/Charts/weeks-profit";
import { IdentsCount } from "@/components/Charts/idents-count";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { Suspense } from "react";
import OverviewCardsGroup from "./_components/overview-cards";
import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Home({ searchParams }: PropsType) {
  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  return (
    <>
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCardsGroup />
      </Suspense>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        {/* <PaymentsOverview
          className="col-span-12 xl:col-span-12"
          key={extractTimeFrame("payments_overview")}
          timeFrame={extractTimeFrame("payments_overview")?.split(":")[1]}
        /> */}
        <IdentsCount className="col-span-12 xl:col-span-12" />
      </div>
    </>
  );
}
