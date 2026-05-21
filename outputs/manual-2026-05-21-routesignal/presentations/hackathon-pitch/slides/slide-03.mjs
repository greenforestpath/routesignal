import { C, bar, bg, dataNote, footer, metric, rect, textBox, title } from "./common.mjs";

export async function slide03(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide);
  title(
    ctx,
    slide,
    "What exists today",
    "The public route surface is already large enough to need analysis.",
    "The first corpus is not complete market truth. It is enough to show the shape of the routing problem.",
  );

  metric(ctx, slide, 72, 258, "route rows", "13,517", C.green);
  metric(ctx, slide, 292, 258, "distinct routes", "12,857", C.blue);
  metric(ctx, slide, 512, 258, "providers", "1,753", C.amber);
  metric(ctx, slide, 732, 258, "networks", "6", C.red);

  rect(ctx, slide, 72, 394, 500, 194, { fill: "#FFFFFF", stroke: C.faint });
  textBox(ctx, slide, "Network concentration", 96, 416, 260, 22, {
    size: 18,
    bold: true,
    color: C.ink,
  });
  bar(ctx, slide, 96, 462, 170, "Base mainnet", 12043, 12043, C.green, { valueLabel: "12,043" });
  bar(ctx, slide, 96, 496, 170, "Solana canonical", 615, 12043, C.blue, { valueLabel: "615" });
  bar(ctx, slide, 96, 530, 170, "Solana mainnet", 599, 12043, C.blue, { valueLabel: "599" });
  textBox(ctx, slide, "Base dominates the listed surface today. The next layer has to separate ecosystem activity from catalog spam.", 346, 454, 184, 90, {
    size: 16,
    color: C.muted,
    lineSpacing: 1.12,
  });

  rect(ctx, slide, 650, 394, 500, 194, { fill: "#FFFFFF", stroke: C.faint });
  textBox(ctx, slide, "Cost calibration", 674, 416, 260, 22, {
    size: 18,
    bold: true,
    color: C.ink,
  });
  bar(ctx, slide, 674, 462, 170, "0.01 USDC", 3448, 3448, C.green, { valueLabel: "3,448" });
  bar(ctx, slide, 674, 496, 170, "0.001 USDC", 994, 3448, C.blue, { valueLabel: "994" });
  bar(ctx, slide, 674, 530, 170, "0.005 USDC", 817, 3448, C.amber, { valueLabel: "817" });
  textBox(ctx, slide, "The useful primitive is the cheap probe: spend pennies, collect a receipt, stop early when evidence is weak.", 924, 454, 184, 90, {
    size: 16,
    color: C.muted,
    lineSpacing: 1.12,
  });

  dataNote(ctx, slide, "Source: site/public/data/routesdb.json, generated 2026-05-21 from x402scan public route records plus local RouteSignal derived fields.");
  footer(ctx, slide, 3);
  return slide;
}
