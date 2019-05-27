## Requirements
### Overall
* During the concert, the app will move from one section to the next (e.g. mental imagery, color/emotion, etc.) without requiring the user to navigate through the app.
* During registration, we will collect the age and sex of each user

### Part 1: Mental Imagery
TODO

### Part 2: Color/Emotion 1
| Emotions          | Artist       | Song                                                 | Duration |
|-------------------|--------------|------------------------------------------------------|----------|
| Serenity/Calm     | Fauré        | Pavane - initial excerpt                             | 2:30     |
| Sadness/Nostalgia | Grieg        | Elegiac Melodies - No. 2, Last Spring excerpt        | 2:00     |
| Happiness/Joy     | Beethoven    | Symphony No. 7 - 4th movement - finale excerpt.      | 2:00     |
| Anger             | Shostakovich | Chamber Symphony in C minor, Op. 110a - 2nd movement | 3:00     |

* The audience will listen to the orchestra play the above four pieces of music.
* Each audience member will use the app to pick from a grid of 21 colors:
  - 6 hues (red, orange, yellow, green, blue, purple) x 3 shades (light, medium, dark) + 3 neutrals (white, gray, black)
* The audience member can pick a new color at any time, but the app will give a gentle reminder 15 seconds after the last choice.

### Part 3: Color/Emotion 2
* The audience will listen to the orchestra play the Coriolan overture.
* The audience will be randomly split into two groups.
    * In group A, the functionality is the same as the app-only section.
    * In group B, the audience member will instead be picking emotions. **Emotion slection method TBD.**
* There will also be a central display in the event venue visualizing the audience's choices as they come in. This should function like a "mood ring" in the sense that it shows the most recent audience choices. **Visualization details TBD.**

### Part 4: Chills
TODO

### Part 5: Intermission
* Each audience member's app will thank the user for participating and signal the end of the part of the concert which uses the app.
* The app will display the user's color choices compared to the overall audience distribution.
* The app will also display the user's mental imagery response compared to the overall audience distribution.

## Authentication
Use AWS Cognito libraries.

## Websocket API
### Report a choice
Send `CHOICE_MADE`
```js
{
  choiceType: String,           // CHOICE_COLOR || CHOICE_EMOTION || CHOICE_CHILLS || CHOICE_IMAGERY
  choice: String || Boolean,    // Boolean for chills, String for the rest
  timestamp: String,
}
```

The websocket API will also be used to guide the mobile app through the concert experience. At appropriate times, it will trigger the app to proceed to the next part of the concert.

### 1 - Connect and welcome
Send `authentication`
```js
{
  eventId: 'CONCERT_LAUSANNE_2019',
  token: String,                        // access token from AWS Cognito
}
```

**Response**
```js
{
  eventStage: String,
}
```

After the client connects, the server should respond with the current stage of the event. This ensures that the app proceeds to the correct stage in case of a disconnect in the middle of the event.

The first event stage will be `WELCOME`. The mobile app should display a welcome screen that asks the user to just listen to the concert. The first part of the concert will be the mental imagery, which requires the user to close their eyes, listen to the song, and pay attention to the images that come to mind.

### 2 - Ask for mental imagery response
Listen for `EVENT_STAGE_CHANGED`
```js
{
  eventStage: 'CHOICE_IMAGERY',
}
```

After the response is submitted, display a thank you screen and ask the user to wait for the next part of the concert.

### 3 - Ask for color choices
Listen for `EVENT_STAGE_CHANGED`
```js
{
  eventStage: 'CHOICE_COLOR',
}
```

At this point, display the color picker UI and allow the user to start picking away.

### 4 - Ask for emotion choices
Listen for `EVENT_STAGE_CHANGED`
```js
{
  eventStage: 'CHOICE_EMOTION',
}
```

After the concert attendees are told just what the heck all this color picking is all about, there will be one more piece of music in this section. For this song, some users will be asked to submit emotions instead of colors. Those users will receive this event.

### 5 - Intermission and end
Listen for `EVENT_STAGE_CHANGED`
```js
{
  eventStage: 'END',
  songs: [
    {
      displayName: String,
      startTime: String,
      endTime: Number,
    },
    ...
  ],
  colors: [
    {
      timestamp: String,
      choices: {
        COLOR_BLUE: Number,
        COLOR_GREEN: Number,
        COLOR_RED: Number,
        ...
      },
    },
    ...
  ],
  imagery: {
    [String]: Number,
    [word]: count,
  },
}
```

The app will not be used in the concert after the intermission. At this point, the aggregated responses/visualizations will be available in the app and the websocket connection can be closed.

## Central Visualization Websocket API
### Mental imagery aggregated
Listen for `IMAGERY_AGGREGATED`
```js
{
  String: Number,
  [word]: count,
  ...
}
```

### Colors aggregated
Listen for `COLORS_AGGREGATED`
```js
{
  COLOR_BLUE: Number,
  COLOR_GREEN: Number,
  COLOR_RED: Number,
  ...
}
```

## Data Storage
### Song information
```js
{
  songId: 'CONCERT_LAUSANNE_2019',  // Partition key
  listenId: 'SONG_LIST',            // Range key
  songs: [
    {
      displayName: String,          // Helpful for in-app displays
      startTime: String,
      endTime: String,
    },
    ...
  ],
}
```

### User choices
```js
{
  songId: 'CONCERT_LAUSANNE_2019'
  listenId: `${userId}`,
  colors: {
    Number: String,         // Key is the timestamp of the choice
    [timestamp]: color,     // Value is the color choice
    ...
  },
  emotions: {
    Number: String,         // Key is the timestamp of the choice
    [timestamp]: emotion,   // Value is the emotion choice
    ...
  },
  imagery: String,          // Short-answer response  
  chills: {
    Number: Boolean,        // Key is the timestamp of the event
    [timestamp]: isChills,  // Value is true if chills started and false if they stopped
    ...
  },
}
```

### Aggregated choices
```js
{
  songId: 'CONCERT_LAUSANNE_2019',
  listenId: 'AGGREGATE',
  colors: {
    Number: Map,
    [timestamp]: {
      COLOR_BLUE: Number,
      COLOR_GREEN: Number,
      COLOR_RED: Number,
      ...
    },
    ...
  },
  emotions: {
    Number: Map,
    [timestamp]: {
      EMOTION_ANGER: Number,
      EMOTION_JOY: Number,
      EMOTION_SADNESS: Number,
      ...
    },
    ...
  },
  imagery: {
    String: Number,     // Key is the word/concept
    [word]: count,      // Value is the number of responses with that word/concept
    ...
  },
}
```