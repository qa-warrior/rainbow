import { get, isNil } from 'lodash';
import colors from './colors';
import fonts from './fonts';

export default function buildTextStyles({
  align,
  color,
  family = 'SFProRounded',
  isEmoji,
  letterSpacing = 'rounded',
  lineHeight,
  mono,
  opacity,
  size,
  uppercase,
  weight = 'regular',
}) {
  return {
    // font family
    ...(isEmoji ? {} : { fontFamily: fonts.family[mono ? 'SFMono' : family] }),

    // font weight
    ...(isEmoji || isNil(weight)
      ? {}
      : { fontWeight: get(fonts, `weight[${weight}]`, weight) }),

    // letter spacing
    ...(isNil(letterSpacing)
      ? {}
      : {
          letterSpacing: get(
            fonts,
            `letterSpacing[${letterSpacing}]`,
            letterSpacing
          ),
        }),

    // line height
    ...(isNil(lineHeight)
      ? {}
      : { lineHeight: get(fonts, `lineHeight[${lineHeight}]`, lineHeight) }),

    // text align
    ...(align ? { textAlign: align } : {}),

    // uppercase
    ...(uppercase ? { textTransform: 'uppercase' } : {}),

    // color
    color: colors.get(color) || colors.dark,

    // font size
    fontSize:
      typeof size === 'number'
        ? size
        : parseFloat(fonts.size[size || 'medium']),

    // opacity
    opacity,
  };
}
