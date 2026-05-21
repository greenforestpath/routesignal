import { C, bg, card, dataNote, footer, pipeRow, rect, textBox, title } from "./common.mjs";

export async function slide06(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, true);
  title(
    ctx,
    slide,
    "The wedge",
    "Composition is where paid routes become interesting.",
    "When every API call can be bought separately, agents can assemble strange workflows from cheap ingredients and stop as soon as the receipt trail is decisive.",
    true,
  );

  rect(ctx, slide, 70, 260, 1045, 302, { fill: "#0F303D", line: { fill: "#35535D", width: 1 } });
  pipeRow(ctx, slide, 98, 302, "Supplier screener", ["registry", "sanctions", "shipment", "owner graph", "receipt"], {
    dark: true,
    color: C.green2,
  });
  pipeRow(ctx, slide, 98, 370, "Viral claim trace", ["claim search", "reverse image", "fact check", "source age", "proof"], {
    dark: true,
    color: C.blue,
  });
  pipeRow(ctx, slide, 98, 438, "Neighborhood check", ["reviews", "crime", "transit", "broadband", "attestation"], {
    dark: true,
    color: C.amber,
  });
  pipeRow(ctx, slide, 98, 506, "Wallet diligence", ["wallet risk", "token history", "social graph", "domain", "memo"], {
    dark: true,
    color: C.green2,
  });

  card(ctx, slide, 804, 288, 270, 98, { fill: "#123745", stroke: "#35535D", accent: C.green2 });
  textBox(ctx, slide, "First-dollar rule", 828, 314, 220, 20, { size: 14, bold: true, color: C.green2 });
  textBox(ctx, slide, "Start with the cheapest call that can kill the task.", 828, 340, 208, 30, {
    size: 15,
    color: "#D7E5E2",
    lineSpacing: 1.08,
  });
  card(ctx, slide, 804, 410, 270, 98, { fill: "#123745", stroke: "#35535D", accent: C.amber });
  textBox(ctx, slide, "Stop rule", 828, 430, 220, 20, { size: 14, bold: true, color: C.amber });
  textBox(ctx, slide, "Stop on contradiction, sanctions, reused media, or weak evidence.", 828, 456, 208, 34, {
    size: 15,
    color: "#D7E5E2",
    lineSpacing: 1.08,
  });

  dataNote(ctx, slide, "Recipe costs are illustrative; corpus costs cluster around micro and cheap probe calls, with premium calls reserved for later evidence.");
  footer(ctx, slide, 6, true);
  return slide;
}
