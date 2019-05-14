## Requirements

### Part 1: App-Only
* The audience will listen to the orchestra play four pieces of music.
* Each audience member will use the app to pick from six available colors (RGB, CMY).
* It's possible that we will want audience members of the final rehearsal to be able to choose emotions instead.
* The audience member can pick a new color at any time, but the app will give a gentle reminder every 20 seconds.
* During the intermission (after the four songs), each audience member's app will display both their own choices as well as the overall audience distribution. Let's call this the "results" screen.
* The app will move from one song to the next as the event progresses without user input

### Part 2: App + Central Visualization
* In the third section, the audience will listen to the orchestra play the Coriolan overture.
* The audience will be randomly split into two groups.
    * In group A, the functionality is the same as the app-only section.
    * In group B, the audience member will instead be picking emotions: Joy, sadness, anger, fear, [disgust].
* There will also be a central display in the event venue visualizing the audience's choices as they come in. This should function like a "mood ring" in the sense that it shows the most recent audience choices.

### Part 3: After Event
* After the event, the user should also be able to re-listen to each song and re-submit color or emotion choices.
* The first time a user listens to a song, they should only have the ability to choose colors and should be blind to the existence of the emotion picker. The user can then choose which they'd like to do in future playbacks.
* The user should be able to see their choices for each instance of listening to the song compared to the total audience. There are two parts to this:
    * A static comparison of how the responses changed over time (the "results" screen)
    * A dynamic comparison used while listening to a song (the live visualization)
* The total audience distribution will at first contain only the concert submissions, but an admin should be able to update this to include additional data points.

## API Contract

### During Event
#### Connect
Send `REQUEST_AUTHENTICATE`
```js
{
  token: String,    // access token from AWS Cognito
}
```

#### Make a choice
Send `CHOICE_MADE`
```js
{
  choiceType: String,  // CHOICE_COLOR | CHOICE_EMOTION
  choice: String,
  timestamp: String,
}
```

#### Get choices
Send `REQUEST_MY_CHOICES`

**Response**
```js
[
  {
    choiceType: String,
    choice: String,
    timestamp: String,
  },
  ...
]
```

#### Get aggregate choices
Send `REQUEST_AGGREGATE_CHOICES`

**Response**
```js
{
  songs: [
    {
      id: String,
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
  emotions: [
    {
      timestamp: String,
      choices: {
        EMOTION_ANGER: Number,
        EMOTION_JOY: Number,
        EMOTION_SADNESS: Number,
        ...
      },
    },
    ...
  ],
}
```

#### Event: new choices aggregated
Listen for `AGGREGATE_CHOICES_UPDATED`
```js
{
  colors: {
    COLOR_BLUE: Number,
    COLOR_GREEN: Number,
    COLOR_RED: Number,
    ...
  }
}
```

### After Event

#### Connect
Send `AUTHENTICATE`
```js
{
  token: String,
}
```

#### Start a new listen
Send `REQUEST_CREATE_LISTEN`
```js
{
  songId: String,
  choiceType: String,
  timestamp: String,
}
```

**Response**
```js
{
  id: String,
  songId: String,
  choiceType: String,
  timestamp: String,
}
````

#### Make a choice
Send `CHOICE_MADE`
```js
{
  listenId: String,
  choice: String,
  timeOffset: Number,
}
```

#### Get list of songs
Send `REQUEST_GET_SONGS`

**Response**
```js
[
  {
    id: String,
    mediaUrl: String,
    title: String,
    artist: String,
    length: Number,
  },
  ...
]
```

#### Get list of listens for a song
Send `REQUEST_GET_LISTENS`
```js
{
  songId: String,
}
```

**Response**
```js
[
  {
    id: String,
    songId: String,
    choiceType: String,
    timestamp: String,
    choices: [
      {
        timeOffset: Number,
        choice: String,
      },
      ...
    ],
  },
  ...
]
```

#### Get list of choices for a listen
Send `REQUEST_GET_CHOICES`
```js
{
  listendId: String,
}
```

**Response**
```js
{
  listendId: String,
  choiceType: String,
  choices: [
    {
      choice: String,
      timeOffset: Number,
    },
    ...
  ],
}
```

## Data Storage

### During Event

#### Song information
```js
{
  songId: String,           // Partition key
  listenId: 'SONG_INFO',    // Range key
  title: String,            // Helpful for in-app displays
  startTime: String,
  endTime: String,
}
```

#### User choices
```js
{
  songId: String,           // Can be set to 'CONCERT_1' for the entire event
  listenId: String,         // equal to userId
  colors: {
    Number: String,         // Key is the timestamp of the choice
    [timestamp]: color,     // Value is the color choice
    ...
  },
  emotions: {
    Number: String,         // Key is the timestamp of the choice
    [timestamp]: color,     // Value is the color choice
    ...
  },
}
```

#### Aggregated choices
```js
{
  songId: String,
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
}
```

### After Event

#### Song information
```js
{
  songId: String,           // Partition key
  listenId: 'SONG_INFO',    // Range key
  mediaUrl: String,         // Cached by app for playback
  title: String,            // Helpful for in-app displays
  artist: String,           // Helpful for in-app displays
  length: Number,           // Helpful for in-app displays
}
```

#### User choices
```js
{
  songId: String,
  listenId: String,         // Compound key: userId$timestamp
  choiceType: String,       // CHOICE_COLOR | CHOICE_EMOTION
  choices: {
    Number: String,         // Key is the number of milliseconds since the starting time of this song during the event
    [timeOffset]: choice,   // Value is the color or emotion choice
    ...
  },
}
```

#### Aggregated colors
```js
{
  songId: String,
  listenId: 'AGGREGATE_COLORS',
  colors: {
    Number: Map,
    [timeOffset]: {
      COLOR_BLUE: Number,
      COLOR_GREEN: Number,
      COLOR_RED: Number,
      ...
    },
    ...
  },
}
```

#### Aggregated emotions
```js
{
  songId: String,
  listenId: 'AGGREGATE_EMOTIONS',
  emotions: {
    Number: Map,
    [timeOffset]: {
      EMOTION_ANGER: Number,
      EMOTION_JOY: Number,
      EMOTION_SADNESS: Number,
      ...
    },
    ...
  },
}
```