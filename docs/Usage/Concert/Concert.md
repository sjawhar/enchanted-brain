## Authentication
Authenticate with AWS Cognito. Include the Cognito ID JWT in the Authorization header of all API requests.

## Websocket API
The guided concert experience uses a websocket API for realtime communication between the client and server. Requests to the server are routed based on the `event` attribute of the request body. For example, a request with the following body would be treated as a FOO request:
```js
{
  event: 'FOO',
  data: {
    bar: true,
  },
}
```

The websocket API will also be used to guide the mobile app through the concert experience. At appropriate times, it will trigger the app to proceed to the next part of the concert by sending the EVENT_STAGE_CHANGED event. This event will contain the `stageId` as well as other attributes of the stage. For more details, see the event stages below.
```js
{
  event: 'EVENT_STAGE_CHANGED',
  data: {
    stageId: String,    // The ID of the current stage
    ...                 // Other attributes of the stage
  },
}
```

### Connecting
On connection, the server will respond with the current event stage. This can be used to ensure the app is in the correct state when reconnecting after being disconnected.
```js
{
  event: 'CONNECTED',
  data: {
    choiceType: String,      // For use in STAGE_CHOICE_SYNESTHESIA
    choiceInverted: Boolean, // For use in STAGE_CHOICE_SYNESTHESIA
    stageId: String,         // The ID of the current stage
    ...                      // Other attributes of the stage
  },
}
```

### Reporting a choice
To report a user's choice, send the CHOICE_MADE event:
```js
{
  event: 'CHOICE_MADE',
  data: {
    choiceType: String,         // CHOICE_COLOR | CHOICE_EMOTION_HAPPINESS | CHOICE_EMOTION_ENERGY | CHOICE_CHILLS
    choice: String || Number,   // String for color, Number for the rest
    timestamp: String,
  },
}
```

For the CHOICE_COLOR, CHOICE_EMOTION_HAPPINESS, and CHOICE_EMOTION_ENERGY events, `timestamp` should be the time the user was **prompted**, not the time they actually responded.

### Event Stages
#### 1 - Welcome
The first event stage will be `STAGE_WAITING`. The mobile app should display a welcome screen that asks the user to just listen to the concert and wait to be prompted for a response.

#### 2 - Prompt for mental imagery
```js
{
  stageId: 'STAGE_CHOICE_IMAGERY',
  formUrl: String,
}
```
The user should be displayed the survey form found at `formUrl`, where they will submit their mental imagery responses. After the response is submitted, display a thank you screen and ask the user to wait for the next part of the concert.

**TODO**: How can we track the user to whom each response belongs, for later analysis?

#### 3 - Prompt for colors and emotions
```js
{
  stageId: 'STAGE_CHOICE_SYNESTHESIA',
  startTime: String,
  endTime: String,
  interval: Number,
  timeout: Number,
  choiceTypes: [String, ...],
}
```

This stage indicates the start of a song (`startTime`). During the song, the user should prompted for a choice every `interval` seconds until the end of the song (`endTime`). If the user doesn't make a choice within `timeout` seconds after being prompted, the prompt should disappear.

When sending the CHOICE_MADE event, the `timestamp` property should correspond to the time of the **prompt**, not the time of the response. For example, if `startTime` is `2019-06-26T19:15:03.000Z` and `interval` is 20, the fourth response (at 4 x 20 = 80 seconds) would have a `timestamp` of `2019-06-26T19:16:23.000Z`, even if the user actually made the response at 82 seconds.

`choiceTypes` will contain a list of choice types that the user can be presented with. The user should be shown the type corresponding to the `choiceType` value received on connect. If that is not in the list, the user should be shown the type corresponding to the first entry in the list. If the user has one of the emotion choice types, the `choiceInverted` value received on connect determines whether the scale should be displayed upside down (e.g. `choiceInverted = False` means happy on top, `choiceInverted = True` means sad on top). **NOTE**: The display should be inverted, but the value sent to the websocket should not.

#### 4 - Prompt for chills
```js
{
  stageId: 'STAGE_CHOICE_CHILLS',
  startTime: String,
  endTime: String,
}
```

Display the chills UI and send CHOICE_MADE events as the user makes their choices. Since the user can make choices at any time, the `timestamp` property of the CHOICE_MADE event should correspond to the actual choice time.

#### 5 - Intermission and end
```js
{
  stageId: 'STAGE_END',
  songs: [
    {
      displayName: String,
      startTime: String,
      endTime: String,
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
  chills: [
   {
     timestamp: String,
     chills: Number,
   },
   ...
  ],
}
```

This indicates the end of the part of the concert that uses the app. At this point, the aggregated responses/visualizations should be made available in the app and the websocket connection can be closed.

`songs` contains the names, start times, and end times of each of the performed pieces. By storing a user's responses locally, the app can assign them to the appropriate song and display them back to the user. In addition, aggregated choices are available under `colors` and `chills` and can be visualized in the app.

#### User choice made (visualization)
The event body here is the same as the CHOICE_MADE event [sent by the mobile app](#reporting-a-choice).

## Data Storage
### User choices
```js
{
  recordId: ['CHOICE', userId].join('$'),
  colors: {
    [timestamp]: String,    // COLOR_RED | COLOR_BLUE | ...
    ...
  },
  emotionType: String,      // EMOTION_HAPPINESS | EMOTION_ENERGY
  emotions: {
    [timestamp]: intensity,
    ...
  },
  chills: {
    [timestamp]: intensity,
    ...
  },
}
```

### Aggregated choices
```js
{
  recordId: 'AGGREGATE',
  colors: {
    [timestamp]: {
      COLOR_BLUE: Number,           // Number of audience members whose latest color choice as of this time was COLOR_BLUE
      COLOR_GREEN: Number,
      COLOR_RED: Number,
      ...
    },
    ...
  },
  emotions: {
    [timestamp]: {
      EMOTION_HAPPINESS: Number,    // Average audience happiness intensity
      EMOTION_ENERGY: Number,
    },
    ...
  },
  chills: {
    [timestamp]: Number,            // Total audience chill intensity
    ...
  },
}
```


### Connection information
```js
{
    recordId: ['CONN', connectionId].join('$'),
    lambdaMappingUuid: String,
    snsSubscriptionArn: String,
    sqsQueueUrl: String,
    createdAt: String,
}
```

### Event stage
```js
{
  recordId: 'EVENT_STAGE',
  stageId: String,
  ...                       // Other attributes of the stage
}
```

### Song information
```js
{
  recordId: 'SONG_LIST'
  songs: [
    {
      displayName: String,  // Helpful for in-app displays
      startTime: String,
      endTime: String,
    },
    ...
  ],
}
```