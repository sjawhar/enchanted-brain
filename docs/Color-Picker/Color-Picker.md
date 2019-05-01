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

### Part 3: Post-Event
* After the event, the user should also be able to re-listen to each song and re-submit color or emotion choices.
* The first time a user listens to a song, they should only have the ability to choose colors and should be blind to the existence of the emotion picker. The user can then choose which they'd like to do in future playbacks.
* The user should be able to see their choices for each instance of listening to the song compared to the total audience. There are two parts to this:
    * A static comparison of how the responses changed over time (the "results" screen)
    * A dynamic comparison used while listening to a song (the live visualization)
* The total audience distribution will at first contain only the concert submissions, but an admin should be able to update this to include additional data points.