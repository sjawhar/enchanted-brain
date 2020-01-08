import { Audio } from 'expo-av';
import { MTURK_SONG_ID } from 'react-native-dotenv';

const musicObject = new Audio.Sound();

const musicSource = (() => {
    switch (MTURK_SONG_ID) {
        case "0":
            return require('../assets/music/02_williams.wav');
        case "1":
            return require('../assets/music/03_grieg.wav');
        case "2":
            return require('../assets/music/04_beethoven.wav');
        case "3":
            return require('../assets/music/05_shostakovich.wav');
        default:
            console.error('Song ID is invalid');
            return '';
    }
})();

async function startMusic() {

    console.debug("Music track starting. Song ID:" + MTURK_SONG_ID);
    try {
        await musicObject.loadAsync(musicSource);
        await musicObject.playAsync();
        console.debug("music should be playing")
    } catch (error) {
        console.debug("error trying to play music:")
        console.error(error)
    }



}

async function stopMusic() {
    console.debug("Music track stopping")
    await musicObject.stopAsync();
}


export { startMusic, stopMusic }

