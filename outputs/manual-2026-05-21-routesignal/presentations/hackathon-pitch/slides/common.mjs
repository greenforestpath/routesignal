export const C = {
  paper: "#F7F8F4",
  ink: "#10202A",
  muted: "#65737B",
  faint: "#E4EAE6",
  panel: "#FFFFFF",
  dark: "#0B2633",
  dark2: "#123745",
  green: "#15936B",
  green2: "#62B488",
  blue: "#2C7FB8",
  amber: "#D9942C",
  red: "#A44B43",
  slate: "#8BA0A8",
};

export function bg(slide, dark = false) {
  slide.background.fill = dark ? C.dark : C.paper;
}

export function textBox(ctx, slide, value, x, y, w, h, opt = {}) {
  const shape = ctx.addText(slide, {
    text: String(value),
    x,
    y,
    w,
    h,
    fontSize: opt.size ?? 22,
    color: opt.color ?? C.ink,
    bold: opt.bold ?? false,
    typeface: opt.face ?? (opt.mono ? ctx.fonts.mono : ctx.fonts.body),
    align: opt.align ?? "left",
    valign: opt.valign ?? "top",
    fill: opt.fill ?? "#00000000",
    line: opt.line ?? { fill: "#00000000", width: 0 },
    insets: opt.insets ?? { left: 0, right: 0, top: 0, bottom: 0 },
  });
  if (opt.lineSpacing) shape.text.lineSpacing = opt.lineSpacing;
  return shape;
}

export function rect(ctx, slide, x, y, w, h, opt = {}) {
  return ctx.addShape(slide, {
    x,
    y,
    w,
    h,
    fill: opt.fill ?? C.panel,
    line: opt.line ?? { fill: opt.stroke ?? C.faint, width: opt.strokeWidth ?? 1 },
  });
}

export function rule(ctx, slide, x, y, w, color = C.faint, h = 1) {
  return rect(ctx, slide, x, y, w, h, { fill: color, line: { fill: color, width: 0 } });
}

export function footer(ctx, slide, n, dark = false) {
  const color = dark ? "#B8CAD1" : C.muted;
  rule(ctx, slide, 60, 660, 1160, dark ? "#35535D" : C.faint);
  textBox(ctx, slide, "RouteSignal hackathon pitch", 60, 674, 400, 22, { size: 14, color });
  textBox(ctx, slide, String(n).padStart(2, "0"), 1175, 674, 45, 22, {
    size: 14,
    color,
    align: "right",
  });
}

export function title(ctx, slide, eyebrow, headline, subhead, dark = false) {
  textBox(ctx, slide, eyebrow.toUpperCase(), 60, 54, 700, 24, {
    size: 14,
    bold: true,
    color: dark ? C.green2 : C.green,
  });
  textBox(ctx, slide, headline, 60, 88, 930, 86, {
    size: 40,
    bold: true,
    color: dark ? "#F3FAF7" : C.ink,
    lineSpacing: 0.95,
  });
  if (subhead) {
    textBox(ctx, slide, subhead, 60, 176, 780, 55, {
      size: 19,
      color: dark ? "#B8CAD1" : C.muted,
      lineSpacing: 1.12,
    });
  }
}

export function metric(ctx, slide, x, y, label, value, color = C.green, dark = false) {
  textBox(ctx, slide, value, x, y, 210, 52, {
    size: 38,
    bold: true,
    color,
  });
  textBox(ctx, slide, label, x, y + 50, 210, 44, {
    size: 15,
    color: dark ? "#B8CAD1" : C.muted,
    lineSpacing: 1.05,
  });
}

export function tag(ctx, slide, label, x, y, w, color = C.green, dark = false) {
  rect(ctx, slide, x, y, w, 28, {
    fill: dark ? "#123745" : "#EAF4EE",
    line: { fill: color, width: 1 },
  });
  textBox(ctx, slide, label, x + 10, y + 6, w - 20, 18, {
    size: 12,
    bold: true,
    color: dark ? "#DFF6EB" : color,
    align: "center",
  });
}

export function card(ctx, slide, x, y, w, h, opt = {}) {
  rect(ctx, slide, x, y, w, h, {
    fill: opt.fill ?? C.panel,
    stroke: opt.stroke ?? C.faint,
    strokeWidth: opt.strokeWidth ?? 1,
  });
  if (opt.accent) {
    rect(ctx, slide, x, y, 5, h, {
      fill: opt.accent,
      line: { fill: opt.accent, width: 0 },
    });
  }
}

export function bar(ctx, slide, x, y, w, label, value, max, color = C.green, opt = {}) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  textBox(ctx, slide, label, x, y - 2, 230, 20, {
    size: opt.labelSize ?? 14,
    color: opt.dark ? "#D7E5E2" : C.ink,
    bold: opt.boldLabel ?? false,
  });
  rect(ctx, slide, x + 250, y + 1, w, 12, {
    fill: opt.dark ? "#24434D" : "#E8EFEC",
    line: { fill: "#00000000", width: 0 },
  });
  rect(ctx, slide, x + 250, y + 1, Math.max(2, w * pct), 12, {
    fill: color,
    line: { fill: color, width: 0 },
  });
  textBox(ctx, slide, opt.valueLabel ?? value.toLocaleString("en-US"), x + 260 + w, y - 2, 90, 20, {
    size: 14,
    color: opt.dark ? "#B8CAD1" : C.muted,
    align: "right",
  });
}

export function quote(ctx, slide, x, y, w, h, kicker, body, accent = C.green) {
  card(ctx, slide, x, y, w, h, { fill: "#FFFFFF", accent });
  textBox(ctx, slide, kicker.toUpperCase(), x + 24, y + 20, w - 48, 18, {
    size: 12,
    bold: true,
    color: accent,
  });
  textBox(ctx, slide, body, x + 24, y + 48, w - 48, h - 64, {
    size: 22,
    bold: true,
    color: C.ink,
    lineSpacing: 1.05,
  });
}

export function dataNote(ctx, slide, text, dark = false) {
  textBox(ctx, slide, text, 60, 636, 1000, 18, {
    size: 11,
    color: dark ? "#8EA7AF" : "#89959A",
  });
}

export function pipeRow(ctx, slide, x, y, label, steps, opt = {}) {
  textBox(ctx, slide, label, x, y, 170, 32, {
    size: 15,
    bold: true,
    color: opt.dark ? "#F3FAF7" : C.ink,
  });
  let cursor = x + 190;
  for (const [i, step] of steps.entries()) {
    const width = Math.max(76, Math.min(150, 16 + step.length * 7));
    rect(ctx, slide, cursor, y - 4, width, 34, {
      fill: opt.dark ? "#123745" : "#F9FBFA",
      stroke: opt.color ?? C.faint,
    });
    textBox(ctx, slide, step, cursor + 9, y + 5, width - 18, 18, {
      size: 12,
      color: opt.dark ? "#D7E5E2" : C.ink,
      bold: i === 0,
    });
    cursor += width + 14;
    if (i < steps.length - 1) {
      textBox(ctx, slide, "|", cursor - 7, y + 2, 12, 18, {
        size: 16,
        color: opt.color ?? C.green,
        mono: true,
      });
    }
  }
}
