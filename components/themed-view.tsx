import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

// Typy pro View komponentu s podporou barevných témat
export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

// View komponenta s automatickým použitím barevného tématu pro pozadí
export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
