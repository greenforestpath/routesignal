import { C, bg, card, footer, rect, tag, textBox, title } from "./common.mjs";

export async function slide02(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide);
  title(
    ctx,
    slide,
    "The problem",
    "A route explosion turns API discovery into procurement.",
    "The future is not a better directory. It is agents deciding which tiny paid capability deserves the next dollar.",
  );

  const colors = [C.green, C.blue, C.amber, C.slate, "#B8C5C7"];
  for (let i = 0; i < 96; i += 1) {
    const col = i % 16;
    const row = Math.floor(i / 16);
    const jitter = ((i * 17) % 13) - 6;
    const x = 80 + col * 25 + (row % 2) * 10;
    const y = 270 + row * 34 + jitter;
    rect(ctx, slide, x, y, 12, 12, {
      fill: colors[i % colors.length],
      line: { fill: "#00000000", width: 0 },
    });
  }

  rect(ctx, slide, 555, 245, 38, 330, { fill: C.dark, line: { fill: C.dark, width: 0 } });
  for (let i = 0; i < 13; i += 1) {
    rect(ctx, slide, 568, 260 + i * 23, 12, 12, {
      fill: i % 3 === 0 ? C.amber : C.green2,
      line: { fill: "#00000000", width: 0 },
    });
  }
  textBox(ctx, slide, "SIGNAL FILTER", 517, 588, 120, 20, {
    size: 12,
    bold: true,
    color: C.dark,
    align: "center",
  });

  card(ctx, slide, 700, 254, 430, 72, { accent: C.green });
  textBox(ctx, slide, "What has actual buyer or activity signal?", 728, 275, 360, 28, {
    size: 20,
    bold: true,
    color: C.ink,
  });
  card(ctx, slide, 735, 348, 430, 72, { accent: C.blue });
  textBox(ctx, slide, "Which route is cheap enough for a first-dollar probe?", 763, 369, 352, 30, {
    size: 19,
    bold: true,
    color: C.ink,
  });
  card(ctx, slide, 700, 442, 430, 72, { accent: C.amber });
  textBox(ctx, slide, "What routes compose into a workflow instead of a SaaS subscription?", 728, 462, 360, 34, {
    size: 18,
    bold: true,
    color: C.ink,
  });
  card(ctx, slide, 735, 526, 430, 62, { accent: C.red });
  textBox(ctx, slide, "What should an agent warn on or block before spending?", 763, 545, 350, 26, {
    size: 18,
    bold: true,
    color: C.ink,
  });

  tag(ctx, slide, "10B FUTURE ROUTES", 92, 614, 168, C.green);
  tag(ctx, slide, "PAY / PROBE / WARN / BLOCK", 930, 614, 210, C.dark);
  footer(ctx, slide, 2);
  return slide;
}
