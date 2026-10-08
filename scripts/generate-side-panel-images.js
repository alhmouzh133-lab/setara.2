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

/**
 * Computes per-row panel horizontal intervals for 'both' or 'right' base image.
 */
function buildPanelMask(data, width, height, channels, mode) {
  const mask = new Float32Array(width * height);

  const topY = mode === 'both' ? Math.floor(height * 0.109) : Math.floor(height * 0.114);
  const botY = mode === 'both' ? Math.floor(height * 0.862) : Math.floor(height * 0.854);

  for (let y = topY - 3; y <= botY + 3; y++) {
    if (y < 0 || y >= height) continue;

    // Vertical feather weight at top track and bottom hem
    let vWeight = 1.0;
    if (y < topY + 3) {
      vWeight = smoothstep(topY - 2, topY + 3, y);
    } else if (y > botY - 3) {
      vWeight = 1.0 - smoothstep(botY - 3, botY + 2, y);
    }
    if (vWeight <= 0) continue;

    const yProgress = (y - topY) / Math.max(1, botY - topY);

    const intervals = [];
    if (mode === 'both') {
      // Left panel interval
      const leftOuter = Math.round(width * 0.075);
      // Scan inner edge near x = 21.5%..24% where sheer begins
      let leftInner = Math.round(width * (0.224 + 0.006 * yProgress));
      for (let x = Math.floor(width * 0.205); x <= Math.floor(width * 0.242); x++) {
        const idx = (y * width + x) * channels;
        const r = data[idx], b = data[idx + 2];
        if (b > 192 && (r - b) < 16) {
          leftInner = x - 1;
          break;
        }
      }
      intervals.push([leftOuter, leftInner]);

      // Right panel interval
      let rightInner = Math.round(width * 0.773);
      for (let x = Math.floor(width * 0.795); x >= Math.floor(width * 0.760); x--) {
        const idx = (y * width + x) * channels;
        const r = data[idx], b = data[idx + 2];
        if (b > 192 && (r - b) < 16) {
          rightInner = x + 1;
          break;
        }
      }
      const rightOuter = Math.round(width * 0.925);
      intervals.push([rightInner, rightOuter]);
    } else if (mode === 'right') {
      // Single right panel interval
      let rightInner = Math.round(width * 0.745);
      for (let x = Math.floor(width * 0.768); x >= Math.floor(width * 0.730); x--) {
        const idx = (y * width + x) * channels;
        const r = data[idx], b = data[idx + 2];
        if (b > 188 && (r - b) < 20) {
          rightInner = x + 1;
          break;
        }
      }
      const rightOuter = Math.round(width * 0.914);
      intervals.push([rightInner, rightOuter]);
    }

    for (const [xStart, xEnd] of intervals) {
      for (let x = xStart - 3; x <= xEnd + 3; x++) {
        if (x < 0 || x >= width) continue;
        let hWeight = 1.0;
        if (x < xStart + 3) {
          hWeight = smoothstep(xStart - 2, xStart + 3, x);
        } else if (x > xEnd - 3) {
          hWeight = 1.0 - smoothstep(xEnd - 3, xEnd + 2, x);
        }
        const w = vWeight * hWeight;
        if (w > mask[y * width + x]) {
          mask[y * width + x] = w;
        }
      }
    }
  }

  return mask;
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

    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    const normLuma = luma / baseMeanLuma;

    const newR = shadeChannel(tr, normLuma);
    const newG = shadeChannel(tg, normLuma);
    const newB = shadeChannel(tb, normLuma);

    out[idx] = clamp(r * (1 - w) + newR * w);
    out[idx + 1] = clamp(g * (1 - w) + newG * w);
    out[idx + 2] = clamp(b * (1 - w) + newB * w);
  }

  return out;
}

async function generateAll() {
  const bothLoaded = await sharp(BOTH_BASE).raw().toBuffer({ resolveWithObject: true });
  const rightLoaded = await sharp(RIGHT_BASE).raw().toBuffer({ resolveWithObject: true });

  const bothMask = buildPanelMask(
    bothLoaded.data,
    bothLoaded.info.width,
    bothLoaded.info.height,
    bothLoaded.info.channels,
    'both'
  );

  const rightMask = buildPanelMask(
    rightLoaded.data,
    rightLoaded.info.width,
    rightLoaded.info.height,
    rightLoaded.info.channels,
    'right'
  );

  for (const color of COLORS) {
    // 1. Both sides (كلاهما)
    const bothColored = applyColorToBuffer(
      bothLoaded.data,
      bothMask,
      bothLoaded.info.width,
      bothLoaded.info.height,
      bothLoaded.info.channels,
      color.targetRgb,
      102
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
      112
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
