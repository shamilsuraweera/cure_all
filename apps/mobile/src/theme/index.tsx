import { useColorScheme } from "react-native";

import { darkPalette, lightPalette, type Palette } from "./colors";

export const useTheme = (): Palette => {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkPalette : lightPalette;
};

export const radius = { sm: 10, md: 16, lg: 22, pill: 999 } as const;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
