import { Audio } from 'expo-av';
import { MTURK_SONG_ID } from 'react-native-dotenv';

const musicId = MTURK_SONG_ID;

const musicObject = new Audio.Sound();

const musicSource = (() => {
    switch (musicId) {
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

    console.debug("Music track starting. Song ID:" + musicId);
    try {
        await musicObject.loadAsync(musicSource);
        await musicObject.playAsync();
        console.debug("music should be playing")

        // musicObject.getStatusAsync()
        // .then(function (result) {
        //     console.log("Music track duration (millis):" + result.durationMillis)
        // })
        // .catch(failureCallback);

    } catch (error) {
        console.debug("error trying to play music:")
        console.error(error)
    }



}

async function stopMusic() {
    console.debug("Music track stopping") //this isn't running?
    await musicObject.stopAsync();
}


export { startMusic, stopMusic }

