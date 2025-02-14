import chroma from 'chroma-js';
import { toLower } from 'lodash';
import PropTypes from 'prop-types';
import { darkMode } from '../config/debug';

let base = {
  appleBlue: '#0E76FD', // '14, 118, 253'
  black: '#000000', // '0, 0, 0'
  blueGreyDark: '#3C4252', // '60, 66, 82'
  blueGreyDark50: '#9DA0A8', // '60, 66, 82, 0.5'
  blueGreyDarker: '#0F0F11', // '15, 15, 17'
  blueGreyDarkLight: '#F3F4F5', // '243, 244, 245'
  brightRed: '#FF7171', // '255, 113, 113'
  chartGreen: '#66d28f', // '102, 210, 143'
  dark: '#25292E', // '37, 41, 46'
  darkGrey: '#71778A', // '113, 119, 138'
  green: '#2CCC00', // '58, 166, 134'
  grey: '#A9ADB9', // '169, 173, 185'
  grey20: '#333333', // '51, 51, 51'
  lighterGrey: '#F7F7F8', // '247, 247, 248'
  lightestGrey: '#E9EBEF', // '238, 233, 232'
  lightGrey: '#CDCFD4', // '205, 207, 212'
  mediumGrey: '#A1A5B3', // '161, 165, 179'
  orange: '#FF9900', // '255, 153, 0'
  orangeLight: '#FEBE44', // '254, 190, 68'
  paleBlue: '#579DFF', // 87, 157, 255
  pink: '#FF54BB', // 255, 84, 187
  purple: '#32325D', // '50, 50, 93'
  purpleLight: '#FFD9FE', // '255, 217, 254'
  red: '#FF494A', // '255, 73, 74'
  rowDivider: 'rgba(60, 66, 82, 0.03)', // '60, 66, 82, 0.03'
  rowDividerLight: 'rgba(60, 66, 82, 0.02)', // '60, 66, 82, 0.02'
  shadowGrey: '#6F6F6F', // '111, 111, 111'
  shimmer: '#EDEEF1', // '237, 238, 241'
  skeleton: '#F6F7F8', // '246, 247, 248'
  swapPurple: '#575CFF', // '87, 92, 255'
  transparent: 'transparent',
  white: '#FFFFFF', // '255, 255, 255'
  yellow: '#FFD657', // '255, 214, 87'
  yellowOrange: '#FFC400', // '255, 178, 0'
};

const avatarColor = [
  '#FF494A', // '255, 73, 74'
  '#01D3FF', // '2, 211, 255'
  '#FB60C4', // '251, 96, 196'
  '#3F6AFF', // '63, 106, 255'
  '#FFD963', // '255, 217, 99'
  '#B140FF', // '177, 64, 255'
  '#41EBC1', // '64, 235, 193'
  '#F46E38', // '244, 110, 56'
  '#6D7E8F', // '109, 126, 143'
];

const assetIcon = {
  blue: '#7DABF0', // '125, 171, 240'
  orange: '#F2BB3A', // '242, 187, 58'
  purple: '#464E5E', // '70, 78, 94'
  red: '#C95050', // '201, 80, 80',
};

const sendScreen = {
  brightBlue: base.appleBlue, // 14, 118, 253
  grey: '#D8D8D8', // '216, 216, 216'
  lightGrey: '#FAFAFA', // '250, 250, 250'
};

let uniswapInvestmentCards = {
  endGradient: '#E4E9F0',
  startGradient: '#ECF1F5',
};

let listHeaders = {
  firstGradient: '#ffffff00',
  secondGradient: '#ffffff80',
  thirdGradient: '#ffffff00',
};

assetIcon.random = () => {
  const assetIconColors = Object.values(assetIcon);
  return assetIconColors[Math.floor(Math.random() * assetIconColors.length)];
};

const vendor = {
  etherscan: '#025C90', // '2, 92, 144'
  ethplorer: '#506685', // '80, 102, 133'
  ledger: '#2F3137', // '47, 49, 55'
  walletconnect: '#4099FF', // '64, 153, 255'
};

const buildRgba = (color, alpha) => `rgba(${chroma(color).rgb()},${alpha})`;

const isColorLight = targetColor =>
  chroma(targetColor || base.white).luminance() > 0.5;

const isHex = (color = '') => color.length >= 3 && color.charAt(0) === '#';
const isRGB = (color = '') => toLower(color).substring(0, 3) === 'rgb';

const getTextColorForBackground = (targetColor, textColors = {}) => {
  const { dark = base.black, light = base.white } = textColors;

  return isColorLight(targetColor) ? dark : light;
};

const getFallbackTextColor = bg =>
  colors.getTextColorForBackground(bg, {
    dark: colors.alpha(colors.blueGreyDark, 0.5),
    light: colors.white,
  });

const transparent = {
  purpleTransparent: buildRgba(base.purple, 0.7), // '50, 50, 93'
  whiteTransparent: buildRgba(base.white, 0.8), // '255, 255, 255'
};

if (darkMode) {
  base = {
    ...base,
    appleBlue: '#FFFFFF',
    black: '#FFFFFF',
    blueGreyDark: '#FFFFFF',
    blueGreyDark50: '#FFFFFF',
    blueGreyDarker: '#FFFFFF',
    blueGreyDarkLight: '#0F0F0F',
    dark: '#FFFFFF',
    darkGrey: '#FFFFFF',
    green: '#69D44D',
    grey: '#FFFFFF',
    grey20: '#FFFFFF',
    lighterGrey: '#FFFFFF',
    lightestGrey: '#FFFFFF',
    lightGrey: '#FFFFFF',
    skeleton: '#0F0F0F',
    white: '#000000',
  };

  uniswapInvestmentCards = {
    endGradient: '#000000',
    startGradient: '#000000',
  };

  listHeaders = {
    firstGradient: '#000000ff',
    secondGradient: '#00000080',
    thirdGradient: '#000000ff',
  };
}

const colors = {
  alpha: buildRgba,
  assetIcon,
  avatarColor,
  getFallbackTextColor,
  getTextColorForBackground,
  isColorLight,
  listHeaders,
  sendScreen,
  uniswapInvestmentCards,
  ...base,
  ...transparent,
  ...vendor,
};

const getColorForString = (colorString = '') => {
  if (!colorString) return null;

  const isValidColorString = isHex(colorString) || isRGB(colorString);
  return isValidColorString ? colorString : colors[colorString];
};

const getRandomColor = () =>
  Math.floor(Math.random() * colors.avatarColor.length);

export default {
  ...colors,
  get: getColorForString,
  getRandomColor,
  propType: PropTypes.oneOf([...Object.keys(colors), ...Object.values(colors)]),
};
