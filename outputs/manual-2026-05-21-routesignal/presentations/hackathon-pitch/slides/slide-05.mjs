import { C, bar, bg, card, dataNote, footer, metric, rect, textBox, title } from "./common.mjs";

export async function slide05(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide);
  title(
    ctx,
    slide,
    "The product state",
    "RouteSignal converts listings into procurement decisions.",
    "Every route should answer a next-action question: pay, probe, warn, or block.",
  );

  rect(ctx, slide, 70, 258, 520, 300, { fill: "#FFFFFF", stroke: C.faint });
  textBox(ctx, slide, "Verdict split", 96, 282, 250, 24, { size: 21, bold: true, color: C.ink });
  bar(ctx, slide, 96, 334, 210, "PAY", 6259, 6259, C.green, { valueLabel: "6,259", boldLabel: true });
  bar(ctx, slide, 96, 384, 210, "PROBE", 5749, 6259, C.blue, { valueLabel: "5,749", boldLabel: true });
  bar(ctx, slide, 96, 434, 210, "WARN", 815, 6259, C.amber, { valueLabel: "815" });
  bar(ctx, slide, 96, 484, 210, "BLOCK", 694, 6259, C.red, { valueLabel: "694" });

  rect(ctx, slide, 646, 258, 508, 300, { fill: "#FFFFFF", stroke: C.faint });
  textBox(ctx, slide, "Evidence ladder", 672, 282, 250, 24, { size: 21, bold: true, color: C.ink });
  metric(ctx, slide, 672, 330, "metadata complete", "11,728", C.green);
  metric(ctx, slide, 872, 330, "probe candidates", "279", C.blue);
  metric(ctx, slide, 1032, 330, "activity observed", "88", C.amber);
  card(ctx, slide, 672, 462, 420, 62, { fill: "#F9FBFA", accent: C.red });
  textBox(ctx, slide, "Caveat: 13,150 routes had no observed activity in the local scrape. That is not failure; it is exactly why signal matters.", 696, 476, 368, 34, {
    size: 15,
    color: C.ink,
    lineSpacing: 1.08,
  });

  dataNote(ctx, slide, "Source: summary.verdicts, summary.evidence_stages, and summary.activity_signals in routesdb.json.");
  footer(ctx, slide, 5);
  return slide;
}
