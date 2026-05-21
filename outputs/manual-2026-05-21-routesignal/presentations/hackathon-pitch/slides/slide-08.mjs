import { C, bg, card, footer, rect, textBox, title } from "./common.mjs";

export async function slide08(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, true);
  title(
    ctx,
    slide,
    "Closing thesis",
    "When APIs become per-call ingredients, the product is route intelligence.",
    "RouteSignal is the starting field guide: what exists, what has signal, what deserves a probe, and what weird workflows become possible.",
    true,
  );

  const rows = [
    ["What we mapped", "13,517 listed route rows, provider shape, cost bands, networks, clusters, risk flags, verdicts."],
    ["What we explain", "Why flat route directories are hard to read and why counts alone can mislead agents."],
    ["What we demonstrate", "A three-page demo that turns the corpus into route analysis and long-tail recipe generation."],
    ["What comes next", "Live probes, receipt trails, provider benchmarks, and a real procurement policy for agent wallets."],
  ];
  let y = 268;
  for (const [head, body] of rows) {
    card(ctx, slide, 92, y, 1010, 58, { fill: "#123745", stroke: "#35535D", accent: y === 268 ? C.green2 : y === 342 ? C.blue : y === 416 ? C.amber : C.green2 });
    textBox(ctx, slide, head, 118, y + 17, 210, 22, {
      size: 17,
      bold: true,
      color: "#F3FAF7",
    });
    textBox(ctx, slide, body, 350, y + 15, 690, 28, {
      size: 16,
      color: "#D7E5E2",
      lineSpacing: 1.08,
    });
    y += 74;
  }

  rect(ctx, slide, 92, 580, 1010, 2, { fill: "#35535D", line: { fill: "#35535D", width: 0 } });
  textBox(ctx, slide, "Talk track: We mapped the route surface, found the noise, then built the compression and composition layers agents will need when paid APIs become abundant.", 120, 602, 955, 34, {
    size: 18,
    bold: true,
    color: "#F3FAF7",
    lineSpacing: 1.05,
  });
  footer(ctx, slide, 8, true);
  return slide;
}
