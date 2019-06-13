## Requirements
### Overall
* 750 audience members
* During registration, we will collect the age and sex of each user. We will also ask each user "to what extent, if any, do you have difficulty in telling colors apart that other people are easily able to tell apart":
    * 0 = "No Difficulty at all"
    * 1 = "Slight or Infrequent Difficulty" 
    * 2 = "Moderate Difficulty"
    * 3 = "Definite or Frequent Difficulty"
* During the concert, the app will move from one section to the next (e.g. mental imagery, color/emotion, etc.) without requiring the user to navigate through the app.
* At intermission, each audience member's app will thank the user for participating and signal the end of the part of the concert which uses the app.

### Part 1: Mental Imagery
|                                       |                                        |
|---------------------------------------|----------------------------------------|
| **Number of songs**                   | 1                                      |
| **Response timing**                   | Once, at end of song                   |
| **Response type**                     | Text, between 1 and 3 words            |
| **Central visualization type**        | Word cloud                             |
| **Central visualization timing**      | 30 seconds after response window opens |
| **Intermission visualization in app** | Word cloud                             |

### Part 2: Color/Emotion 1
| Emotions          | Artist       | Song                                                 | Duration |
|-------------------|--------------|------------------------------------------------------|----------|
| Serenity/Calm     | Fauré        | Pavane - initial excerpt                             | 2:30     |
| Sadness/Nostalgia | Grieg        | Elegiac Melodies - No. 2, Last Spring excerpt        | 2:00     |
| Happiness/Joy     | Beethoven    | Symphony No. 7 - 4th movement - finale excerpt.      | 2:00     |
| Anger             | Shostakovich | Chamber Symphony in C minor, Op. 110a - 2nd movement | 3:00     |

|                                       |                                                |
|---------------------------------------|------------------------------------------------|
| **Number of songs**                   | 4 (see above)                                  |
| **Response timing**                   | TBD                                            |
| **Response type**                     | Selection from a grid of TBD number of colors |
| **Central visualization type**        | None                                           |
| **Intermission visualization in app** | Choices over time compared to aggregate        |

### Part 3: Color/Emotion 2
|                                       |                                                |
|---------------------------------------|------------------------------------------------|
| **Number of songs**                   | 1, Coriolan overture                           |
| **Response timing**                   | TBD                                            |
| **Response type, Group A (50%)**      | Selection from a grid of TBD number of colors  |
| **Response type, Group B (25%)**      | Selection from five degrees of happy/sad       |
| **Response type, Group C (25%)**      | Selection from five degrees of agitated/calm   |
| **Central visualization type**        | Bees                                           |
| **Intermission visualization in app** | Choices over time compared to aggregate        |

### Part 4: Chills
|                                       |                                                                 |
|---------------------------------------|-----------------------------------------------------------------|
| **Number of songs**                   | 2 \n Adagio from Barber \n "Summer" from Vivaldi's Four Seasons |
| **Response timing**                   | Any time                                                        |
| **Response type**                     | TBD                                                             |
| **Central visualization type**        | TBD                                                             |
| **Intermission visualization in app** | TBD                                                             |

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