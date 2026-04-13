// Jazyk: TypeScript (TSX)
// Popis: Zdrojový soubor projektu.

import { Image, StyleSheet, View } from 'react-native';

type HeaderLogoProps = {
  mode?: 'slot' | 'watermark' | 'inline';
  size?: number;
};

export default function HeaderLogo({ mode = 'slot', size = 44 }: HeaderLogoProps) {
  if (mode === 'watermark') {
    return (
      <View pointerEvents="none" style={styles.watermarkWrap}>
        <Image
          source={require('../assets/images/logo_aplikace.png')}
          style={StyleSheet.flatten([styles.logo, styles.watermarkLogo, { width: size, height: size }])}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (mode === 'inline') {
    return (
      <View style={styles.inlineWrap}>
        <Image
          source={require('../assets/images/logo_aplikace.png')}
          style={StyleSheet.flatten([styles.logo, { width: size, height: size }])}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View style={styles.slotWrap}>
      <Image
        source={require('../assets/images/logo_aplikace.png')}
        style={StyleSheet.flatten([styles.logo, { width: size, height: size }])}
        resizeMode="contain"
      />
    </View>
  );
}
//vyska a sirka loga v pravo nahore
const styles = StyleSheet.create({
  slotWrap: {
    width: 54,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  inlineWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  watermarkWrap: {
    position: 'absolute',
    right: 12,
    bottom: 6,
  },
  logo: {
    borderRadius: 8,
  },
  watermarkLogo: {
    opacity: 0.22,
  },
});
