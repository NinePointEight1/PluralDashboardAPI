# Plural Dashboard API

Created by: Noah van Schijndel.

## Introduction
This codebase was created during the graduation internship for presenting the Plural Dashboard API.
Plural is a brainstorming tool that users are able to view session results with. This API was required to visualize certain graphs.
Written below are explanations of certain functions within the API.

## Installation
Download / link git repository and locate to a folder which allows a local server environment.

## Usage
### Key Interaction Incidents Bubble Graph:
![](https://i.imgur.com/sN3Kbnl.png)

This graph visualizes which ideas were submitted and what members' reaction was to that idea. This is visualized (as seen above) via a timeline of several circles, where each circle is one idea, and the circles are larger based on how much interaction they had.

This function in the API starts with creating a new array of all ideas submitted, and sorts them by timestamp:
```javascript
var FilteredIdeasArray = [];
  //Loop through members
  for (var i = 0; i < (SessionData.Members).length; i++) {
    var FilteredIdea = SessionData.Members[i].SessionData.Ideas;
    for (var y = 0; y < FilteredIdea.length; y++) {
      FilteredIdeasArray.push(FilteredIdea[y]);
    }
  } 
  //Sort array by idea submitted timestamp
  FilteredIdeasArray.sort(function (a, b) {
    return a.TimeSubmitted.localeCompare(b.TimeSubmitted);
  });
  ```
The idea with the most interactions gets the biggest circle. To find this limit the function below combines the replies of the idea and how much reactions it has. Next it uses Math.max to retrieve the idea with the highest interaction.
```javascript
  //Create new array with combined values of "AmountRepliedTo" and "AmountReactedTo"
  var IdeasCombinedValuesArray = [];
  for (var x = 0; x < FilteredIdeasArray.length; x++) {
    IdeasCombinedValuesArray.push(Number(FilteredIdeasArray[x].AmountRepliedTo) + Number(FilteredIdeasArray[x].AmountReactedTo))
  }
  var DefineMaxBubbleSize = Math.max(...IdeasCombinedValuesArray);
  ```
  Using the max bubble size value, it calculates the sizes of other idea bubbles. Lastly it creates a HTML String which loops through all the idea and builds them while inserting the data. 
  ```javascript
//With this new array populate the bubble graph.
  var BubblesHTML = "";
  for (var z = 0; z < FilteredIdeasArray.length; z++) {
    //Define bubble size (100 / DefineMaxBubbleSize * (AmountRepliedTo + AmountReactedTo))
    var SetBubbleSize = Math.round((100 / DefineMaxBubbleSize * (Number(FilteredIdeasArray[z].AmountRepliedTo) + Number(FilteredIdeasArray[z].AmountReactedTo))));
    //Catch this to make sure the smallest bubble is atleast 20px by 20px
    if (SetBubbleSize < 20) { SetBubbleSize = 20; }
    //Build the HTML string
    BubblesHTML += `<div class="Bubble" onmousemove="HoverTooltip(event, this)" style="height:`+ SetBubbleSize +`px;width:`+ SetBubbleSize +`px;"><span class="tooltip-span">Prompt:
    <div class="tooltip-prompt">`+ FilteredIdeasArray[z].IdeaText +`</div><div class="tooltip-info-replies">• `+ FilteredIdeasArray[z].AmountRepliedTo +`</div>
    <div class="tooltip-info-reactions">• `+ FilteredIdeasArray[z].AmountReactedTo +`</div></span></div>`
  }
  $("#BubbleData").append(BubblesHTML);
    ```
	
### Member Contribution Bar Graph:
![](https://i.imgur.com/g1myIqy.png)

### Contribution Efficiency Circle Graph:
![](https://i.imgur.com/rvw4aMi.png)

## Contribution
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
