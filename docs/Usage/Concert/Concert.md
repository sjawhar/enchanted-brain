## Mobile Client Configuration
| Environment Variable       | Description / Valid Values                                                                                                                                                              |
| :------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AMPLIFY_AUTH_DISABLE       | Omit or set to `false` to enable AWS Amplify authentication and the concert app                                                                                                         |
| AMPLIFY_AUTH_REGION        | Region of AWS Cognito user pool                                                                                                                                                         |
| AMPLIFY_AUTH_USER_POOL_ID  | AWS Cognito user pool ID                                                                                                                                                                |
| AMPLIFY_AUTH_WEB_CLIENT_ID | ID of web client which can connect to AWS Cognito user pool                                                                                                                             |
| CONCERT_START_TIME         | If an integer, the welcome countdown lasts for this many milliseconds. Otherwise, a datetime value is expected and is used as the countdown date.                                       |
| WEBSOCKET_API_STUB         | If anything other than `false`, then calling `concertApi.connect()` will load `STAGE_DATA[WEBSOCKET_API_STUB]` in `api/stub.js`. Otherwise a working API is needed to which to connect. |
| WEBSOCKET_API_URL          | The URL of the Websocket API to which the app should connect                                                                                                                            |

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

### Authentication
There are two methods by which you can authenticate when connecting to the websocket server:
* Include the user's JWT in the `Authorization` header and include a random unique value in the `token` query string parameter (recommended)
* Include the user's JWT in the `token` query string parameter

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
    choiceType: String,         // CHOICE_COLOR | CHOICE_EMOTION_HAPPINESS | CHOICE_EMOTION_ANGER | CHOICE_CHILLS
    choice: String || Number,   // String for color, Number for the rest
    timestamp: String,
  },
}
```

For the CHOICE_COLOR, CHOICE_EMOTION_HAPPINESS, and CHOICE_EMOTION_ANGER events, `timestamp` should be the time the user was **prompted**, not the time they actually responded.

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
  displayName: String,
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
  displayName: String,
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
      choiceType: String,    // CHOICE_COLOR || CHOICE_CHILLS
      choices: [             // Includes elements of either the CHOICE_COLOR or CHOICE_CHILLS format, but not both.
        // CHOICE_COLOR
        {
          timestamp: String,
          '#AB0000': Number,
          '#AB8000': Number,
          ...
        },
        // CHOICE_CHILLS
        {
          timestamp: String,
          sum: Number,
          count: Number,
        },
        ...
      ]
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
### Aggregated choices
```js
{
  recordId: 'AGGREGATE',
  colors: {
    [timestamp]: {
      count: Number                   // Total number of choices made for all colors at this time
      'sum_#AB0000': Number,            // Number of audience members whose latest color choice as of this time was #AB0000
      'sum_#00AB00': Number,
      'sum_#0000AB': Number,
      ...
    },
    ...
  },
  emotions: {
    [timestamp]: {
      count_EMOTION_HAPPINESS: Number,  // Count of audience happiness intensity choices
      count_EMOTION_ANGER: Number,
      sum_EMOTION_HAPPINESS: Number,    // Sum of audience happiness intensity choices
      sum_EMOTION_ANGER: Number,
    },
    ...
  },
  chills: {
    [timestamp]: {
      count: Number,                    // Count of audience chill choices
      sum: Number,                      // Sum of audience chill choices
    }
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