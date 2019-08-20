import Color from 'color';
const tintColor = '#2f95dc';

const luminosities = ['LIGHT', 'MEDIUM', 'DARK'];

export const swatchColors = [
  ['RED', [255, 0, 0], 0.5, 0.33],
  ['ORANGE', [255, 128, 0], 0.5, 0.3],
  ['YELLOW', [255, 255, 0], 0.5, 0.3],
  ['GREEN', [0, 255, 0], 0.5, 0.4],
  ['BLUE', [0, 0, 255], 0.5, 0.33],
  ['PURPLE', [255, 0, 255], 0.5, 0.33],
  ['NEUTRAL', [128, 128, 128], 1],
].map(([hue, rgb, lighten, darken]) =>
  [Color.rgb(rgb).lighten(lighten), Color.rgb(rgb), Color.rgb(rgb).darken(darken || lighten)].map(
    (color, index) => ({ hue, hex: color.hex(), luminosity: luminosities[index] })
  )
);

export const swatchColorInfo = swatchColors
  .flat()
  .reduce((obj, { hex, ...color }) => Object.assign(obj, { [hex]: color }), {});

export default {
  errorBackground: 'red',
  errorText: '#fff',
  noticeBackground: tintColor,
  noticeText: '#fff',
  swatchColors,
  tabBar: '#fefefe',
  tabIconDefault: '#ccc',
  tabIconSelected: tintColor,
  tintColor,
  warningBackground: '#EAEB5E',
  warningText: '#666804',
  primaryBlue: '#000081',
};
