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

The member contribution graph is divided into 2 sections. Users, and the always active bottom section for anonymous contribution. This graph is generated using ApexCharts.js.
The function in the API starts off with creating a new array with only necessary data for this graph.
  ```javascript
  //Create new two-dimensional array
  var FilteredSessionDataArray = [];
  //Loop through members
  for (var i = 0; i < (SessionData.Members).length; i++) {
    //Count IdeaTotals together into 1 number for sorting
    var MemberContributionCombined = Number(SessionData.Members[i].SessionData.IdeaTotals.TotalShared) + Number(SessionData.Members[i].SessionData.IdeaTotals.TotalReplied);
    //Retrieve neccesary data and push arrays into parent array
    FilteredSessionDataArray.push({Name: SessionData.Members[i].Name, 
      Role: SessionData.Members[i].Role, 
      Email: SessionData.Members[i].Email, 
      UserImage: SessionData.Members[i].UserImage,
      IdeaTotals: MemberContributionCombined,
      IdeaTotalsPercentage: null});
  }
  ```

Next it filters out the anonymous contributed ideas.
  ```javascript
    //Filter out anonymous from data since it has a different bar graph (otherwise will mess up the sort)
  var FilteredSessionDataArrayNoAnonymous = FilteredSessionDataArray.filter(function (e) {
    return e.Name !== "Anonymous";
  });
  ```
The bar graph needs to be arranged by most contribution. We do this by counting up the total ideas for each member and calculating their percentage contributed and arranging them afterwards.
  ```javascript
	  //Count up total ideas by ALL members for the maximum
  for (var x = 0; x < FilteredSessionDataArrayNoAnonymous.length; x++) {
    MaximumContributionByMembers = (MaximumContributionByMembers + FilteredSessionDataArrayNoAnonymous[x].IdeaTotals)
  }
  //Loop through members to calculate their percentage of contribution and insert it into array.
  for (var y = 0; y < FilteredSessionDataArrayNoAnonymous.length; y++) {
    FilteredSessionDataArrayNoAnonymous[y].IdeaTotalsPercentage = Math.round(((FilteredSessionDataArrayNoAnonymous[y].IdeaTotals / MaximumContributionByMembers) * 100));
  }
  //Sort array by IdeaTotalsPercentage value, highest first
  FilteredSessionDataArrayNoAnonymous.sort((b,a) => (a.IdeaTotalsPercentage > b.IdeaTotalsPercentage) ? 1 : ((b.IdeaTotalsPercentage > a.IdeaTotalsPercentage) ? -1 : 0))
```
Lastly we can create the left side of the graph (filling in user details like an image, name, role). The percentages are inserted into ApexCharts to generate the bar graph.
  ```javascript
//With this new array we can populate the bar graph users.
  var MemberContributionUserHTML = "";
  var IdeaTotalsOrdered = [];
  for (var z = 0; z < FilteredSessionDataArrayNoAnonymous.length; z++) {
    //Push the IdeaTotalsPercentage into a new array for APEX Charts
    IdeaTotalsOrdered.push(Number(FilteredSessionDataArrayNoAnonymous[z].IdeaTotalsPercentage));
    //Build the HTML string
    MemberContributionUserHTML += `<div id="MemberContributionUser`+ z +`" class="MemberContributionUser">
    <div class="MemberContributionUserImage"><img src="CSS/Images/`+ FilteredSessionDataArrayNoAnonymous[z].UserImage +`" /></div>
    <div class="MemberContributionUserName">`+ FilteredSessionDataArrayNoAnonymous[z].Name +`<br/ >
    <span id="MemberUserJobTitle1" class="UserJobTitle">`+ FilteredSessionDataArrayNoAnonymous[z].Role +`</span></div></div>`;
  }
  $("#MemberContributionUserWrapper").prepend(MemberContributionUserHTML);
```
### Contribution Efficiency Circle Graph:
![](https://i.imgur.com/rvw4aMi.png)

The Contribution Efficiency is fairly straight forward. We first count the total replies, reactions, and interactions of the session and store them into a new array.
  ```javascript
  var TotalEfficiencyFromMembers = 0;
  var MemberEfficiencyReplies = 0;
  var MemberEfficiencyReactions = 0;
  var MemberEfficiencyInteractions = 0;
  //Loop through members
  for (var i = 0; i < (SessionData.Members).length; i++) {
    //Get each entry from the totals in json file
    for (const [key, value] of Object.entries(SessionData.Members[i].SessionData.Totals)) {
      //Additionally count totals per category together (replies, reactions, interactions)
      if (key == "Replies") { MemberEfficiencyReplies += (Number(`${value}`)) }
        else if (key == "Reactions") { MemberEfficiencyReactions += (Number(`${value}`)) }
          else if (key == "Interactions") { MemberEfficiencyInteractions += (Number(`${value}`)) }
      //Count all together for maximum
    TotalEfficiencyFromMembers += (Number(`${value}`));
  }
}     
```
These values are submitted into the ApexCharts visualization. Using the combined values we can calculate the Session Value and insert it into its corresponding html div.
  ```javascript
$("#SessionValue").html(((TotalEfficiencyFromMembers / 300) * 100));
  ```
## Contribution
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
