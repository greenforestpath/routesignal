import { C, bg, card, footer, rect, textBox, title } from "./common.mjs";

export async function slide07(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide);
  title(
    ctx,
    slide,
    "The demo",
    "Three pages make the thesis inspectable.",
    "The goal is not to simulate payments. It is to show the field guide, the compression layer, and the composition layer.",
  );

  const panels = [
    ["RoutesDB", "A processable corpus of routes with provider, cost, network, risk, evidence, activity, cluster, and verdict metadata.", C.green],
    ["Analyzer", "Visual compression: network mix, cost bands, clusters, route farms, active anchors, and evidence gaps.", C.blue],
    ["Wizard", "A recipe lab that turns capabilities into long-tail workflows, first-dollar probes, stop rules, and missing route ideas.", C.amber],
  ];
  let x = 70;
  for (const [name, body, color] of panels) {
    card(ctx, slide, x, 276, 330, 250, { fill: "#FFFFFF", stroke: C.faint, accent: color });
    textBox(ctx, slide, name, x + 28, 304, 250, 38, {
      size: 30,
      bold: true,
      color,
    });
    textBox(ctx, slide, body, x + 28, 360, 256, 100, {
      size: 18,
      color: C.ink,
      lineSpacing: 1.12,
    });
    rect(ctx, slide, x + 28, 474, 260, 10, { fill: "#EDF3F0", line: { fill: "#00000000", width: 0 } });
    rect(ctx, slide, x + 28, 474, name === "RoutesDB" ? 210 : name === "Analyzer" ? 168 : 238, 10, {
      fill: color,
      line: { fill: color, width: 0 },
    });
    x += 372;
  }

  textBox(ctx, slide, "data -> signal -> composition", 360, 565, 560, 40, {
    size: 30,
    bold: true,
    color: C.dark,
    align: "center",
    mono: true,
  });
  footer(ctx, slide, 7);
  return slide;
}
