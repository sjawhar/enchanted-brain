## Requirements
### Color/Emotion Picker
* The user should also be able to re-listen to each song and re-submit color or emotion choices.
* The first time a user listens to a song, they should only have the ability to choose colors and should be blind to the existence of the emotion picker. The user can then choose which they'd like to do in future playbacks.
* The user should be able to see their choices for each instance of listening to the song compared to the total audience. There are two parts to this:
    * A static comparison of how the responses changed over time (the "results" screen)
    * A dynamic comparison used while listening to a song (the live visualization)
* The total audience distribution will at first contain only the concert submissions, but an admin should be able to update this to include additional data points.

## API contract

### Connect
Send `AUTHENTICATE`
```js
{
  token: String,
}
```

### Start a new listen
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

### Make a choice
Send `CHOICE_MADE`
```js
{
  listenId: String,
  choice: String,
  timeOffset: Number,
}
```

### Get list of songs
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

### Get list of listens for a song
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

### Get list of choices for a listen
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

### Song information
```js
{
  songId: String,               // Partition key
  listenId: 'SONG_INFO',        // Range key
  choiceTypes: [String, ...],   // List of choice types valid for this song
  mediaUrl: String,             // Cached by app for playback
  title: String,                // Helpful for in-app displays
  artist: String,               // Helpful for in-app displays
  length: Number,               // Helpful for in-app displays
}
```

### User choices
```js
{
  songId: String,
  listenId: String,         // Compound key: userId$timestamp
  choiceType: String,       // CHOICE_COLOR || CHOICE_EMOTION || CHOICE_CHILLS || CHOICE_IMAGERY || CHOICE_COMPOSITION
  [choices: {               // choiceType in [CHOICE_COLOR, CHOICE_EMOTION, CHOICE_CHILLS]
    Number: String,         // Key is milliseconds since start of song
    [timeOffset]: choice,   // Value is the choice value
    ...
  }],
  [choice: String],         // choiceType in [CHOICE_IMAGERY, CHOICE_COMPOSITION]
}
```

### Aggregated choices
```js
{
  songId: String,
  listenId: 'AGGREGATE',
  [colors: {
    Number: Map,
    [timeOffset]: {
      COLOR_BLUE: Number,
      COLOR_GREEN: Number,
      COLOR_RED: Number,
      ...
    },
    ...
  }],
  [emotions: {
    Number: Map,
    [timeOffset]: {
      EMOTION_ANGER: Number,
      EMOTION_JOY: Number,
      EMOTION_SADNESS: Number,
      ...
    },
    ...
  }],
  [chills: {
    Number: Number,             // Key is milliseconds since the start of the song
    [timeOffset]: chillRatio,   // Value is percentage of respondents experiencing chills
    ...
  }],
  [imagery: {
    String: Number,             // Key is the word to display in the word cloud
    [word]: count,              // Value is the number of responses mentioning that word
    ...
  }],
  [composition: {
    COMPOSITION_RATIONAL: count,
    COMPOSITION_INTUITIVE: count,
  }],
}
```