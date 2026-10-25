// WCAG 2.2 relative luminance and contrast math, shared by the Creative Lab and tests.
export function relativeLuminance(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new TypeError("Expected a six-digit hex color");
  const rgb = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const linear = rgb.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

export function contrastRatio(foreground, background) {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

export function wcagContrastLevel(ratio) {
  return {
    normalAA: ratio >= 4.5,
    largeAA: ratio >= 3,
    normalAAA: ratio >= 7,
  };
}