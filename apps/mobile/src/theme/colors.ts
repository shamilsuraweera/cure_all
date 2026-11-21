export type Palette = {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryDark: string;
  onPrimary: string;
  accent: string;
  danger: string;
  success: string;
  warning: string;
  chip: string;
  overlay: string;
  isDark: boolean;
};

export const lightPalette: Palette = {
  background: "#F0FDFA",
  surface: "#FFFFFF",
  surfaceAlt: "#E6FBF7",
  text: "#134E4A",
  textMuted: "#4B6B6A",
  border: "#CCFBF1",
  primary: "#0D9488",
  primaryDark: "#0F766E",
  onPrimary: "#FFFFFF",
  accent: "#F43F5E",
  danger: "#DC2626",
  success: "#059669",
  warning: "#D97706",
  chip: "#CCFBF1",
  overlay: "rgba(8, 47, 45, 0.45)",
  isDark: false,
};

export const darkPalette: Palette = {
  background: "#061C1B",
  surface: "#0D2F2D",
  surfaceAlt: "#12403D",
  text: "#E6FFFA",
  textMuted: "#8FB8B4",
  border: "#1F4D4A",
  primary: "#2DD4BF",
  primaryDark: "#14B8A6",
  onPrimary: "#042F2E",
  accent: "#FB7185",
  danger: "#F87171",
  success: "#34D399",
  warning: "#FBBF24",
  chip: "#17504C",
  overlay: "rgba(0, 0, 0, 0.6)",
  isDark: true,
};

// Kept for existing imports.
export const palette = lightPalette;
