import { C, bar, bg, dataNote, footer, quote, rect, textBox, title } from "./common.mjs";

export async function slide04(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide);
  title(
    ctx,
    slide,
    "Market shape",
    "The interesting story is not the average route. It is the long tail plus the distortions.",
    "A good agent procurement layer has to show clusters, route farms, niche utilities, and where activity actually appears.",
  );

  rect(ctx, slide, 70, 252, 645, 342, { fill: "#FFFFFF", stroke: C.faint });
  textBox(ctx, slide, "Derived route clusters", 96, 276, 360, 26, {
    size: 21,
    bold: true,
    color: C.ink,
  });
  bar(ctx, slide, 96, 328, 250, "Long-tail utilities", 5243, 5243, C.green, { valueLabel: "5,243", boldLabel: true });
  bar(ctx, slide, 96, 370, 250, "Onchain market data and wallets", 3696, 5243, C.blue, { valueLabel: "3,696" });
  bar(ctx, slide, 96, 412, 250, "Route farms and catalog inflation", 2042, 5243, C.amber, { valueLabel: "2,042" });
  bar(ctx, slide, 96, 454, 250, "External action channels", 866, 5243, C.red, { valueLabel: "866" });
  bar(ctx, slide, 96, 496, 250, "Sensitive verification and legal risk", 861, 5243, C.slate, { valueLabel: "861" });
  textBox(ctx, slide, "This is why a flat table feels bad: the reader sees URLs, not the market. The product has to compress routes into procurement-relevant mental models.", 96, 542, 556, 34, {
    size: 16,
    color: C.muted,
    lineSpacing: 1.1,
  });

  quote(
    ctx,
    slide,
    770,
    260,
    360,
    120,
    "Hidden tension",
    "Counts reward catalog inflation. Agents need evidence, cost, and stop rules.",
    C.amber,
  );
  quote(
    ctx,
    slide,
    770,
    412,
    360,
    120,
    "Useful surprise",
    "The weird long tail is the opportunity: tiny paid capabilities become ingredients.",
    C.green,
  );

  dataNote(ctx, slide, "Source: RouteSignal derived cluster fields in site/public/data/routesdb.json.");
  footer(ctx, slide, 4);
  return slide;
}
