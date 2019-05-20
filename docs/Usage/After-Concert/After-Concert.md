## Requirements
### Mental Imagery
TODO

### Color/Emotion Picker
* The user should also be able to re-listen to each song and re-submit color or emotion choices.
* The first time a user listens to a song, they should only have the ability to choose colors and should be blind to the existence of the emotion picker. The user can then choose which they'd like to do in future playbacks.
* The user should be able to see their choices for each instance of listening to the song compared to the total audience. There are two parts to this:
    * A static comparison of how the responses changed over time (the "results" screen)
    * A dynamic comparison used while listening to a song (the live visualization)
* The total audience distribution will at first contain only the concert submissions, but an admin should be able to update this to include additional data points.

### Chills
TODO

### Composition Type
TODO

## API contract
All requests to APIs should include an `Authentication` header with the user's AWS Cognito ID JWT

### Sign in/out
Use AWS Cognito libraries.

### Get list of songs
**Request**  
`GET /Songs`

**Response**  
`200 OK`  
```js
[
  {
    id: String,
    mediaUrl: String,
    choiceTypes: [String, ...],     // List of valid choice types for this song
    title: String,
    artist: String,
    length: Number,
  },
  ...
]
```

### Start a new listen
**Request**  
`POST /Listens`
```js
{
  songId: String,
  choiceType: String,
}
```

**Response**  
`201 Created`  
```js
{
  id: String,
  songId: String,
  choiceType: String,
  createdAt: String,
}
````

### Submit listen choice(s)
**Request**  
`PUT /Listens/:listenId/Choices`
```js
{
  choiceType: String,
  [choices: [           // choiceType in [CHOICE_COLOR, CHOICE_EMOTION, CHOICE_CHILLS]
    {
      timeOffset: Number,
      choice: String,
    },
    ...
  ]],
  [choice: String],     // choiceType in [CHOICE_COMPOSITION, CHOICE_IMAGERY]
}
```

**Response**  
`204 No Content`

### Get aggregate choices for a song
**Request**  
`GET /Songs/:songId/Choices`

**Response**  
`200 OK`
```js
{
  [colors: [
    {
      timeOffset: Number,
      choices: {
        COLOR_BLUE: Number,
        COLOR_GREEN: Number,
        COLOR_RED: Number,
        ...
      },
    },
    ...
  ]],
  [emotions: [
    {
      timeOffset: Number,
      choices: {
        EMOTION_ANGER: Number,
        EMOTION_JOY: Number,
        EMOTION_SADNESS: Number,
        ...
      },
    },
    ...
  ]],
  [chills: [
    {
      timeOffset: Number,
      chillRatio: Number,       // Percentage of respondents experiencing chills
    },
    ...
  ]],
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

### Get list of listens for a song
**Request**  
`GET /Songs/:songId/Listens`

**Response**  
`200 OK`  
```js
[
  {
    id: String,
    songId: String,
    choiceType: String,
    createdAt: String,
    [choices: [           // choiceType in [CHOICE_COLOR, CHOICE_EMOTION, CHOICE_CHILLS]
      {
        timeOffset: Number,
        choice: String,
      },
      ...
    ]],
    [choice: String],     // choiceType in [CHOICE_COMPOSITION, CHOICE_IMAGERY]
  },
  ...
]
```

### Get choice(s) for a listen
**Request**  
`GET /Listens/:listenId/Choices`

**Response**  
Same as request body for [submitting listen choice(s)](#submit-listen-choices).

## Data Storage
### List of Songs
````js
{
  songId: 'SONG_LIST',
  listenId: 'SONG_LIST',
  songs: [String, ...],         // List of songIds
}
````

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