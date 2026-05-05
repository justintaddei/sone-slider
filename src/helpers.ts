export const ENABLED_KEY = "sone_enabled";
export const VOLUME_KEY = "sone_volume";

const EXPONENT = 5 / 3; // slider → amplitude
const INV_EXPONENT = 1 / EXPONENT; // amplitude → slider

export const toActual = (s: number): number => {
  if (s <= 0) return 0;
  if (s >= 1) return 1;
  return Math.pow(s, EXPONENT);
};

export const toSlider = (a: number): number => {
  if (a <= 0) return 0;
  if (a >= 1) return 1;
  return Math.pow(a, INV_EXPONENT);
};
