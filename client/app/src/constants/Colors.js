import Color from 'color';
import hsluv from 'hsluv';
const tintColor = '#2f95dc';

// from Steve Palmer's May 20, 2019 email
const sixBasicColorTerms = [
  '#F494B9',
  '#ED2859',
  '#A41C40',
  '#FCC8A3',
  '#F59123',
  '#A05A2A',
  '#FDE89A',
  '#FEE600',
  '#A29633',
  '#C0E0C3',
  '#61BF81',
  '#1B9971',
  '#A9C1E5',
  '#5DA1D9',
  '#5084B0',
  '#B79DC8',
  '#9C4B9D',
  '#743493',
  '#FFFFFF',
  '#A5A5A5',
  // Color("#A5A5A5")
  //   .darken(0.5)
  //   .rgb()
  //   .string(),
  '#000000',
];

// from Steve Palmer's May 20, 2019 email
const heringPrimaries = [
  '#F494B9',
  '#ED2859',
  '#A41C40',
  '#FDE89A',
  '#FEE600',
  '#A29633',
  '#C0E0C3',
  '#61BF81',
  '#1B9971',
  '#A9C1E5',
  '#5DA1D9',
  '#5084B0',
  '#FFFFFF',
  '#A5A5A5',
  '#000000',
];

// from https://material.io/tools/color
// all colors are 200, 400, 700
const materialColorsWithGrayscale = [
  // red
  '#ef9a9a',
  '#ef5350',
  '#d32f2f',

  // orange
  '#ffcc80',
  '#ffa726',
  '#f57c00',

  // yellow
  '#fff59d',
  '#ffee58',
  '#fbc02d',

  // green
  '#a5d6a7',
  '#66bb6a',
  '#388e3c',

  // blue
  '#90caf9',
  '#42a5f5',
  '#1976d2',

  // purple
  '#ce93d8',
  '#ab47bc',
  '#7b1fa2',

  // greyscale
  '#FFFFFF',
  '#A5A5A5',
  // Color("#A5A5A5")
  //   .darken(0.5)
  //   .rgb()
  //   .string(),
  '#000000',
];

// from https://material.io/tools/color
// all colors are 100, 200, 400, 700
const materialColors = [
  // red
  '#ffcdd2',
  '#ef9a9a',
  '#ef5350',
  '#d32f2f',

  // orange
  '#ffe0b2',
  '#ffcc80',
  '#ffa726',
  '#f57c00',

  // yellow
  '#fff9c4',
  '#fff59d',
  '#ffee58',
  '#fbc02d',

  // green
  '#c8e6c9',
  '#a5d6a7',
  '#66bb6a',
  '#388e3c',

  // blue
  '#bbdefb',
  '#90caf9',
  '#42a5f5',
  '#1976d2',

  // indigo
  '#c5cae9',
  '#9fa8da',
  '#5c6bc0',
  '#303f9f',

  // purple
  '#e1bee7',
  '#ce93d8',
  '#ab47bc',
  '#7b1fa2',
];

// HSLuv colors
// http://www.hsluv.org/
// hues are in increments of (360 / 6 =) 60

const HIGH_SATURATION = 100;
const LOW_SATURATION = 70;
const HIGH_BRIGHTNESS = 70;
const LOW_BRIGHTNESS = 45;

const { hsluvToHex, hexToHsluv } = hsluv;
const hsluvColors = [
  //          H           S             L
  hsluvToHex([0, LOW_SATURATION, HIGH_BRIGHTNESS]),
  hsluvToHex([0, HIGH_SATURATION, HIGH_BRIGHTNESS]),
  hsluvToHex([0, HIGH_SATURATION, LOW_BRIGHTNESS]),
  hsluvToHex([60, LOW_SATURATION, HIGH_BRIGHTNESS]),
  hsluvToHex([60, HIGH_SATURATION, HIGH_BRIGHTNESS]),
  hsluvToHex([60, HIGH_SATURATION, LOW_BRIGHTNESS]),
  hsluvToHex([120, LOW_SATURATION, HIGH_BRIGHTNESS]),
  hsluvToHex([120, HIGH_SATURATION, HIGH_BRIGHTNESS]),
  hsluvToHex([120, HIGH_SATURATION, LOW_BRIGHTNESS]),
  hsluvToHex([180, LOW_SATURATION, HIGH_BRIGHTNESS]),
  hsluvToHex([180, HIGH_SATURATION, HIGH_BRIGHTNESS]),
  hsluvToHex([180, HIGH_SATURATION, LOW_BRIGHTNESS]),
  hsluvToHex([240, LOW_SATURATION, HIGH_BRIGHTNESS]),
  hsluvToHex([240, HIGH_SATURATION, HIGH_BRIGHTNESS]),
  hsluvToHex([240, HIGH_SATURATION, LOW_BRIGHTNESS]),
  hsluvToHex([300, LOW_SATURATION, HIGH_BRIGHTNESS]),
  hsluvToHex([300, HIGH_SATURATION, HIGH_BRIGHTNESS]),
  hsluvToHex([300, HIGH_SATURATION, LOW_BRIGHTNESS]),
  '#FFFFFF',
  '#A5A5A5',
  '#000000',
];

const hackathonColors = [
  [[255, 0, 0], 0.5, 0.33],
  [[255, 128, 0], 0.5, 0.3],
  [[255, 255, 0], 0.5, 0.3],
  [[0, 255, 0], 0.5, 0.4],
  [[0, 0, 255], 0.5, 0.33],
  [[255, 0, 255], 0.5, 0.33],
  [[128, 128, 128], 1],
]
  .map(([rgb, lighten, darken]) => [
    Color.rgb(rgb).lighten(lighten),
    Color.rgb(rgb),
    Color.rgb(rgb).darken(darken || lighten),
  ])
  .flat()
  .map(color => color.rgb().string());

export {
  materialColors,
  materialColorsWithGrayscale,
  sixBasicColorTerms,
  heringPrimaries,
  hsluvColors,
  hackathonColors,
};

export default {
  tintColor,
  tabIconDefault: '#ccc',
  tabIconSelected: tintColor,
  tabBar: '#fefefe',
  errorBackground: 'red',
  errorText: '#fff',
  warningBackground: '#EAEB5E',
  warningText: '#666804',
  noticeBackground: tintColor,
  noticeText: '#fff',
};
