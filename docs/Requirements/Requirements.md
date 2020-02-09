## Standard
[[resources/standard-app-flow.png]]

For more information on the API calls, see the [Concert Usage](Concert) section.

## Concert
### Overall
* 750 audience members
* During registration, we will collect the age, sex, country of birth, and country of residence of each user. We will also ask each user "to what extent, if any, do you have difficulty in telling colors apart that other people are easily able to tell apart":
    * 0 = "No Difficulty at all"
    * 1 = "Slight or Infrequent Difficulty" 
    * 2 = "Moderate Difficulty"
    * 3 = "Definite or Frequent Difficulty"
* During the concert, the app will move from one section to the next (e.g. mental imagery, color/emotion, etc.) without requiring the user to navigate through the app.
* At intermission, each audience member's app will thank the user for participating and show the intermission visualization, signaling the end of the part of the concert which uses the app.

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
| Emotions  | Artist               | Song                                          | Length |
|-----------|----------------------|-----------------------------------------------|--------|
| Sadness   | Vaughan Williams     | Fantasia on a Theme by Thomas Tallis          | 2:35   |
| Calm      | Edvard Grieg         | Elegiac Melodies - No. 2, Last Spring excerpt | 1:52   |
| Happiness | Ludwig van Beethoven | Symphony No. 7 in A Major, Op. 92, 4th Mvt.   | 1:55   |
| Anger     | Dmitri Shostakovich  | Chamber Symphony, Op. 110a, 2nd Mvt.          | 2:59   |

|                                       |                                     |
|---------------------------------------|-------------------------------------|
| **Number of songs**                   | 4 (see above)                       |
| **Response timing**                   | Every 20 seconds                    |
| **Response type**                     | Selection from a grid of 21 colors  |
| **Central visualization type**        | 2x2 grid, top three colors per song |
| **Intermission visualization in app** | User and choices over time          |

### Part 3: Color/Emotion 2
|                                       |                                           |
|---------------------------------------|-------------------------------------------|
| **Number of songs**                   | 1, Coriolan overture                      |
| **Response timing**                   | Every 20 seconds                          |
| **Response type, Group A (50%)**      | Selection from a grid of 21 colors        |
| **Response type, Group B (25%)**      | Selection from five degrees of happy/sad  |
| **Response type, Group C (25%)**      | Selection from five degrees of angry/calm |
| **Central visualization type**        | Colored dots on 2D grid                   |
| **Intermission visualization in app** | None                                      |

### Part 4: Chills
| Artist          | Song                              | Length |
|-----------------|-----------------------------------|--------|
| Samuel Barber   | Adagio for String                 | 3:33   |
| Antonio Vivaldi | The Four Seasons - Summer (Storm) | 2:30   |

|                                       |                                                     |
|---------------------------------------|-----------------------------------------------------|
| **Number of songs**                   | 2 (see above)                                       |
| **Response timing**                   | Continuous                                          |
| **Response type**                     | Drag finger in scale from 0 to 1                    |
| **Central visualization type**        | Total chill intensity, number of people with chills |
| **Intermission visualization in app** | User and total chill intensity                      |