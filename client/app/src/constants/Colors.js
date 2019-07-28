import Color from 'color';
const tintColor = '#2f95dc';

const COLOR_SUFFIX = ['LIGHT', 'MEDIUM', 'DARK'];

export const swatchColors = [
  ['RED', [255, 0, 0], 0.5, 0.33],
  ['ORANGE', [255, 128, 0], 0.5, 0.3],
  ['YELLOW', [255, 255, 0], 0.5, 0.3],
  ['GREEN', [0, 255, 0], 0.5, 0.4],
  ['BLUE', [0, 0, 255], 0.5, 0.33],
  ['PURPLE', [255, 0, 255], 0.5, 0.33],
  ['NEUTRAL', [128, 128, 128], 1],
].map(([colorType, rgb, lighten, darken]) =>
  [Color.rgb(rgb).lighten(lighten), Color.rgb(rgb), Color.rgb(rgb).darken(darken || lighten)].map(
    (color, index) => ({
      id: `COLOR_${colorType}_${COLOR_SUFFIX[index]}`,
      value: color.rgb().string(),
    })
  )
);

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
};
