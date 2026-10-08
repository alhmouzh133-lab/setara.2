const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BOTH_BASE = path.join(__dirname, '..', 'src', 'assets', 'images', 'side_panels_both_base_1791446986124.jpg');
const RIGHT_BASE = path.join(__dirname, '..', 'src', 'assets', 'images', 'side_panels_right_base_1791446996869.jpg');
const OUT_DIR = path.join(__dirname, '..', 'public', 'images');

// 11 side-panel colors matching SIDE_PANEL_COLORS in lib/catalog.ts
const COLORS = [
  { id: 'white', name: 'أبيض', targetRgb: [238, 237, 233] },
  { id: 'ivory', name: 'عاجي', targetRgb: [224, 214, 196] },
  { id: 'light_beige', name: 'بيج فاتح', targetRgb: [206, 193, 173] },
  { id: 'sand_beige', name: 'بيج رملي', targetRgb: [182, 158, 128] },
  { id: 'grey_beige', name: 'بيج رمادي', targetRgb: [156, 146, 130] },
  { id: 'light_grey', name: 'رمادي فاتح', targetRgb: [178, 177, 174] },
  { id: 'medium_grey', name: 'رمادي متوسط', targetRgb: [122, 119, 115] },
  { id: 'dark_grey', name: 'رمادي غامق', targetRgb: [66, 64, 62] },
  { id: 'blue_grey', name: 'رمادي مزرق', targetRgb: [86, 102, 118] },
  { id: 'blue', name: 'أزرق', targetRgb: [52, 92, 128] },
  { id: 'navy_blue', name: 'كحلي', targetRgb: [28, 44, 78] },
];

function clamp(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function shadeChannel(targetC, normLuma) {
  if (normLuma <= 1.0) {
    return targetC * Math.pow(Math.max(0, normLuma), 0.88);
  }
  const highlight = Math.min(0.62, (normLuma - 1.0) * 0.52);
  return targetC + (250 - targetC) * highlight;
}

function interpolate(knots, y) {
  for (let i = 1; i < knots.length; i++) {
    if (y <= knots[i][0]) {
      const [y0, x0] = knots[i - 1];
      const [y1, x1] = knots[i];
      return x0 + (x1 - x0) * ((y - y0) / (y1 - y0));
    }
  }
  return knots[knots.length - 1][1];
}

// Intervals follow the swept-back linen drapes in the new product photographs.
// The middle sheer curtain, wall, gold rod, and furniture remain untouched.
function buildPanelMask(width, height, mode) {
  const mask = new Float32Array(width * height);
  const topY = Math.floor(height * 0.05);
  const botY = Math.floor(height * 0.90);
  const outerEdge = [[0.05, 0.118], [0.45, 0.115], [0.70, 0.105], [0.90, 0.087]];
  const innerEdge = [
    [0.05, 0.328], [0.15, 0.316], [0.30, 0.282], [0.44, 0.264],
    [0.54, 0.220], [0.65, 0.208], [0.78, 0.228], [0.90, 0.248],
  ];

  for (let y = topY - 4; y <= botY + 4; y++) {
    if (y < 0 || y >= height) continue;
    const vWeight = smoothstep(topY - 4, topY + 4, y) *
      (1 - smoothstep(botY - 4, botY + 4, y));
    if (vWeight <= 0) continue;
    const relativeY = y / height;
    const outer = interpolate(outerEdge, relativeY) * width;
    const inner = interpolate(innerEdge, relativeY) * width;
    const intervals = mode === 'both'
      ? [[outer, inner], [width - inner, width - outer]]
      : [[width - inner, width - outer]];

    for (const [xStart, xEnd] of intervals) {
      for (let x = Math.floor(xStart - 4); x <= Math.ceil(xEnd + 4); x++) {
        if (x < 0 || x >= width) continue;
        const hWeight = smoothstep(xStart - 4, xStart + 4, x) *
          (1 - smoothstep(xEnd - 4, xEnd + 4, x));
        const w = vWeight * hWeight;
        if (w > mask[y * width + x]) {
          mask[y * width + x] = w;
        }
      }
    }
  }

  return mask;
}

function isGold(r, g, b) {
  return r - g > 39 && g - b > 44;
}

function meanPanelLuma(srcData, mask, width, height, channels) {
  let total = 0;
  let weight = 0;
  for (let i = 0; i < width * height; i++) {
    if (mask[i] < 0.9) continue;
    const idx = i * channels;
    const r = srcData[idx], g = srcData[idx + 1], b = srcData[idx + 2];
    const chromaWeight = smoothstep(10, 28, r - b);
    const weightedMask = mask[i] * chromaWeight;
    total += (0.299 * r + 0.587 * g + 0.114 * b) * weightedMask;
    weight += weightedMask;
  }
  return total / weight;
}

function applyColorToBuffer(srcData, mask, width, height, channels, targetRgb, baseMeanLuma) {
  const out = Buffer.from(srcData);
  const [tr, tg, tb] = targetRgb;

  for (let i = 0; i < width * height; i++) {
    const w = mask[i];
    if (w <= 0.001) continue;

    const idx = i * channels;
    const r = srcData[idx];
    const g = srcData[idx + 1];
    const b = srcData[idx + 2];
    const x = i % width;
    const y = Math.floor(i / width);
    const nearTieback = y > height * 0.47 && y < height * 0.73 &&
      (x < width * 0.25 || x > width * 0.75);
    if (nearTieback && isGold(r, g, b)) continue;

    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    const normLuma = luma / baseMeanLuma;

    const newR = shadeChannel(tr, normLuma);
    const newG = shadeChannel(tg, normLuma);
    const newB = shadeChannel(tb, normLuma);

    const colorWeight = w * smoothstep(10, 28, r - b);
    out[idx] = clamp(r * (1 - colorWeight) + newR * colorWeight);
    out[idx + 1] = clamp(g * (1 - colorWeight) + newG * colorWeight);
    out[idx + 2] = clamp(b * (1 - colorWeight) + newB * colorWeight);
  }

  return out;
}

async function generateAll() {
  const bothLoaded = await sharp(BOTH_BASE).raw().toBuffer({ resolveWithObject: true });
  const rightLoaded = await sharp(RIGHT_BASE).raw().toBuffer({ resolveWithObject: true });

  const bothMask = buildPanelMask(bothLoaded.info.width, bothLoaded.info.height, 'both');
  const rightMask = buildPanelMask(rightLoaded.info.width, rightLoaded.info.height, 'right');
  const bothMeanLuma = meanPanelLuma(bothLoaded.data, bothMask, bothLoaded.info.width, bothLoaded.info.height, bothLoaded.info.channels);
  const rightMeanLuma = meanPanelLuma(rightLoaded.data, rightMask, rightLoaded.info.width, rightLoaded.info.height, rightLoaded.info.channels);

  for (const color of COLORS) {
    // 1. Both sides (كلاهما)
    const bothColored = applyColorToBuffer(
      bothLoaded.data,
      bothMask,
      bothLoaded.info.width,
      bothLoaded.info.height,
      bothLoaded.info.channels,
      color.targetRgb,
      bothMeanLuma
    );
    const bothPath = path.join(OUT_DIR, `side_panel_${color.id}_both.jpg`);
    await sharp(bothColored, {
      raw: {
        width: bothLoaded.info.width,
        height: bothLoaded.info.height,
        channels: bothLoaded.info.channels,
      },
    })
      .jpeg({ quality: 92 })
      .toFile(bothPath);

    // 2. Right side only (يمين — viewed facing the window)
    const rightColored = applyColorToBuffer(
      rightLoaded.data,
      rightMask,
      rightLoaded.info.width,
      rightLoaded.info.height,
      rightLoaded.info.channels,
      color.targetRgb,
      rightMeanLuma
    );
    const rightPath = path.join(OUT_DIR, `side_panel_${color.id}_right.jpg`);
    await sharp(rightColored, {
      raw: {
        width: rightLoaded.info.width,
        height: rightLoaded.info.height,
        channels: rightLoaded.info.channels,
      },
    })
      .jpeg({ quality: 92 })
      .toFile(rightPath);

    // 3. Left side only (يسار — viewed facing the window, exact horizontal mirror of right)
    const leftPath = path.join(OUT_DIR, `side_panel_${color.id}_left.jpg`);
    await sharp(rightColored, {
      raw: {
        width: rightLoaded.info.width,
        height: rightLoaded.info.height,
        channels: rightLoaded.info.channels,
      },
    })
      .flop()
      .jpeg({ quality: 92 })
      .toFile(leftPath);
  }

  // Also copy ivory_both as default side_linen_panels.jpg
  fs.copyFileSync(
    path.join(OUT_DIR, 'side_panel_ivory_both.jpg'),
    path.join(OUT_DIR, 'side_linen_panels.jpg')
  );

  console.log('Successfully generated all 33 side-panel images (11 colors x 3 placements)!');
}

generateAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
