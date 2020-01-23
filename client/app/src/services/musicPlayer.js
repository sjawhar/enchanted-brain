import { Audio } from 'expo-av';

let musicObject = null;

const getSoundFile = songId => {
  switch (songId) {
    case '0':
      return require('../assets/music/02_williams.wav');
    case '1':
      return require('../assets/music/03_grieg.wav');
    case '2':
      return require('../assets/music/04_beethoven.wav');
    case '3':
      return require('../assets/music/05_shostakovich.wav');
    default:
      throw new Error(`Unknown song ${songId}`);
  }
};

export const loadMusic = async songId => {
  const music = new Audio.Sound();
  await music.loadAsync(getSoundFile(songId), { shouldPlay: false });
  musicObject = music;
};

export const playMusic = async () => {
  if (!musicObject) {
    return;
  }
  const { durationMillis } = await musicObject.playAsync();
  return durationMillis;
};

export const stopMusic = async () => {
  if (!musicObject) {
    return;
  }
  await musicObject.stopAsync();
  musicObject = null;
};
