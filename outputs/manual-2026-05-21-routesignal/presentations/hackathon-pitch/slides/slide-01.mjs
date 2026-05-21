import { C, bg, footer, metric, rect, textBox, tag } from "./common.mjs";

const hero = "/Users/personal/Projects2/routesignal/assets/routesignal-signal-filter-hero.png";

export async function slide01(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide);
  await ctx.addImage(slide, {
    path: hero,
    x: 610,
    y: 0,
    w: 670,
    h: 720,
    fit: "cover",
    alt: "Abstract route field narrowing into selected API cards",
  });
  rect(ctx, slide, 584, 0, 88, 720, { fill: "#F7F8F4D8", line: { fill: "#00000000", width: 0 } });
  tag(ctx, slide, "HACKATHON PITCH", 60, 66, 150, C.green);
  textBox(ctx, slide, "RouteSignal", 60, 116, 500, 66, {
    size: 58,
    bold: true,
    color: C.ink,
    lineSpacing: 0.9,
  });
  textBox(ctx, slide, "A field guide to the long tail of paid API routes for agents.", 60, 190, 520, 126, {
    size: 34,
    bold: true,
    color: C.dark,
    lineSpacing: 1.0,
  });
  textBox(ctx, slide, "If agents can buy one API call at a time, the hard problem becomes routing: what exists, what has signal, what should be probed, and what can be composed.", 60, 336, 500, 96, {
    size: 20,
    color: C.muted,
    lineSpacing: 1.16,
  });
  metric(ctx, slide, 60, 492, "route rows in local corpus", "13,517", C.green);
  metric(ctx, slide, 284, 492, "providers mapped", "1,753", C.blue);
  metric(ctx, slide, 486, 492, "derived verdict states", "4", C.amber);
  footer(ctx, slide, 1);
  return slide;
}
