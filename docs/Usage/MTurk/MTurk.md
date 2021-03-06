## Mobile Client Configuration
As the MTurk app does not receive instructions from an API, its behavior is largely controlled by environment variables.

| Environment Variable  | Description / Valid Values                                                   |
| --------------------- | ---------------------------------------------------------------------------- |
| AMPLIFY_AUTH_DISABLE  | Set to `true` to disable AWS Amplify authentication and enable the MTurk app |
| MTURK_CHOICE_INTERVAL | Seconds between each response prompt (e.g. 20)                               |
| MTURK_CHOICE_TIMEOUT  | Response prompt timeout in seconds (e.g. 5)                                  |
| MTURK_CHOICE_TYPE     | CHOICE_EMOTION_ANGER \| CHOICE_EMOTION_HAPPINESS                   |
| MTURK_SONG_ID         | SONG_ANGRY_1 \| SONG_CALM_1 \| SONG_HAPPY_1 \| SONG_SAD_1                    |

A different build of the mobile client is needed for each song / choice type combination. The apps can then be published to Expo or hosted on public servers, and each MTurk task will point to the builds containing the song and choice type appropriate to that task.

## MTurk Setup
1. Use the build script under the client directory to create builds for each Song / Choice Type combination.
2. Upload the builds.
3. Generate two QR codes for each build: one for Android and one for iOS. The QR code URLs are printed to the console at the end of the build script and saved in the dist directory.
4. Create a new project in Amazon MTurk using the provided HTML template in mturk/hit.
5. Update the CSV under mturk/hit to reflect the songs and choice types being tested.
6. Create the HITs by uploading the CSV to MTurk and using the project you just created.

## Choices API
User choices are submitted to an API endpoint, which validates and persists them. This is a very simple API, with only a single HTTP endpoint.

`POST /Choices`
```js
{
  id: String,                   // UUID generated by client
  songId: String,
  choiceType: String,           // CHOICE_EMOTION_ANGER | CHOICE_EMOTION_HAPPINESS
  choiceInverted: Boolean,
  interval: Number,
  timeout: Number,
  demographics: {
    age: Number,
    colorPerception: Number,    // 0-3
    gender: String,             // MALE | FEMALE | OTHER
    countryOfBirth: String,     // Two-letter country code
    countryOfResidence: String,
  },
  choices: [
    {
      songPosition: Number,     // Milliseconds since start of song
      choice: Number,
    },
    ...
  ],
}
```

The value of the `id` attribute should be a UUID that the client generates for each submission. This UUID should also be returned to the user, who will provide it to MTurk as proof of task completion. This will allow us to trace each submission back to a valid MTurk user and task.

Each user submission is saved to an S3 bucket as `Choices/${songId}/${choiceType}/${id}.json`

### Authentication
Requests to the Choices API must include the app secret as a Bearer token in the `Authorization` header. For example: `Authorization: Bearer super-secret-string`.

The app secret is created in AWS Secrets Manager under `${Environment}/enchanted-brain/mturk/app-secret` when the CloudFormation stack is deployed.