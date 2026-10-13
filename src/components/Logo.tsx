import { Image, type ImageStyle, type StyleProp } from 'react-native';

// The Caraxes mark (transparent PNG, square, tightly cropped). Sits on
// brand.black; use it in chrome — onboarding, sign-in, empty states — not
// inside an active workout session.
const source = require('../../assets/logo.png');

type Props = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function Logo({ size = 160, style }: Props) {
  return (
    <Image
      source={source}
      accessibilityRole="image"
      accessibilityLabel="Caraxes"
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}
