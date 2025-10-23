import { compactFormat } from "@/lib/format-number";
import { getOverviewData } from "../../fetch";
import { OverviewCard } from "./card";
import * as icons from "./icons";

export async function OverviewCardsGroup() {
  const { views, profit, products, users } = await getOverviewData();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="Tổng số đơn vị"
        data={{
          ...views,
          value: compactFormat(views.value),
        }}
        Icon={icons.Views}
      />

      <OverviewCard
        label="Tổng số licenses"
        data={{
          ...profit,
          value: "$" + compactFormat(profit.value),
        }}
        Icon={icons.Profit}
      />

      <OverviewCard
        label="Tổng số định danh"
        data={{
          ...products,
          value: compactFormat(products.value),
        }}
        Icon={icons.Product}
      />

      <OverviewCard
        label="Tổng số users"
        data={{
          ...users,
          value: compactFormat(users.value),
        }}
        Icon={icons.Users}
      />
    </div>
  );
}
