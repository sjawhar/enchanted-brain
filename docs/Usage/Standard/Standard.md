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
All requests to APIs should include an `Authorization` header with the user's AWS Cognito ID JWT

### Sign in/out
Use AWS Cognito libraries.

### Get list of Songs
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

### Get Aggregates for a Song
**Request**  
`GET /Songs/{songId}/Aggregates?choiceType`

**Response**  
`200 OK`
```js
[
  {
    songId: String,
    choiceType: String,
    choices: [
      {
        songPosition: Number,
        [choice]: count,
        ...
      },
      ...
    ],
    updatedAt: String,
  },
  ...
]
```

### Record a new Listen
**Request**  
`POST /Listens`
```js
{
  songId: String,
  choiceType: String,
  choices: [
    {
      songPosition: Number,
      choice: String | Number,
    },
    ...
  ],
  listenedAt: String,
}
```

**Response**  
`201 Created`  
```js
{
  id: String,
  songId: String,
  userId: String,
  choiceType: String,
  choices: [
    {
      songPosition: Number,
      choice: String | Number,
    },
    ...
  ],
  listenedAt: String,
  createdAt: String,
}
```

### Get list of Listens
**Request**  
`GET /Listens?songId`

**Response**  
`200 OK`  
```js
[
  {
    id: String,
    songId: String,
    userId: String,
    choiceType: String,
    listenedAt: String,
    createdAt: String,
  },
  ...
]
```

### Get a Listen
**Request**  
`GET /Listens/{listenId}`

**Response**  
```js
{
  id: String,
  songId: String,
  listenedAt: String,
  choiceType: String,
  choices: [
    {
      songPosition: Number,
      choice: Number || String,
    }.
    ...
  ],
}
```

## Data Storage
### Song
```js
{
  userId: 'SONGS',
  listenId: soongId,
  choiceTypes: [String, ...],   // List of choice types valid for this song
  mediaUrl: String,             // Cached by app for playback
  title: String,                // Helpful for in-app displays
  artist: String,               // Helpful for in-app displays
  length: Number,               // Helpful for in-app displays
  updatedAt: String,
  createdAt: String,
}
```

### Listen
```js
{
  userId: String,
  listenId: [songId, listenedAt].join('$'),
  choiceType: String,           // CHOICE_COLOR || CHOICE_EMOTION_ANGER || CHOICE_EMOTION_HAPPINESS || CHOICE_CHILLS
  choices: {
    String: String,             // Key is milliseconds since start of song
    [songPosition]: choice,     // Value is the choice value
    ...
  },
  createdAt: String,
}
```

### Aggregated choices
```js
{
  userId: 'AGGREGATES',
  listenId: [songId, choiceType].join('$'),
  choices: {
    [songPosition]: {   // CHOICE_COLOR
      [color]: count,
      ...
    },
    [songPosition]: {   // CHOICE_CHILLS || CHOICE_EMOTION_ANGER || CHOICE_EMOTION_HAPPINESS
      count: count,
      sum: sum,
    },
    ...
  },
  updatedAt: String,
}
```