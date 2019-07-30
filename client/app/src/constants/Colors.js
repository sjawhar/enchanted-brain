import Color from 'color';
const tintColor = '#2f95dc';

export const swatchColors = [
  [[255, 0, 0], 0.5, 0.33],
  [[255, 128, 0], 0.5, 0.3],
  [[255, 255, 0], 0.5, 0.3],
  [[0, 255, 0], 0.5, 0.4],
  [[0, 0, 255], 0.5, 0.33],
  [[255, 0, 255], 0.5, 0.33],
  [[128, 128, 128], 1],
].map(([rgb, lighten, darken]) =>
  [Color.rgb(rgb).lighten(lighten), Color.rgb(rgb), Color.rgb(rgb).darken(darken || lighten)].map(
    color => color.hex()
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
