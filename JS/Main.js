//Retrieve session data from json file
const SessionData = JsonSessionString;
console.log(SessionData);

window.onload = function() {
  GenerateKeyInteraction();
  GenerateContributionValues();
  GenerateMemberContribution();
  runAnimations();
}

// BUBBLE TIMELINE
function GenerateKeyInteraction() {
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
  //Get last time an idea is submitted
  var LastRecordedTime = FilteredIdeasArray[FilteredIdeasArray.length - 1];
  //Split off the seconds
  LastRecordedTime = (String(LastRecordedTime.TimeSubmitted).split(":"))[0];
  //Round UP the minutes to nearest mutltiple of 5
  LastRecordedTime = (Math.ceil(Number(LastRecordedTime)/5)*5);
  //Divide to find number of seperation and input into timeline
  LastRecordedTime = Math.ceil(LastRecordedTime / 3);
  document.getElementById("FirstBubbleTimeInput").innerHTML = (LastRecordedTime + "m");
  document.getElementById("SecondBubbleTimeInput").innerHTML = (LastRecordedTime * 2 + "m");
  document.getElementById("ThirdBubbleTimeInput").innerHTML = (LastRecordedTime * 3 + "m");

  //Create new array with combined values of "AmountRepliedTo" and "AmountReactedTo"
  var IdeasCombinedValuesArray = [];
  for (var x = 0; x < FilteredIdeasArray.length; x++) {
    IdeasCombinedValuesArray.push(Number(FilteredIdeasArray[x].AmountRepliedTo) + Number(FilteredIdeasArray[x].AmountReactedTo))
  }
  var DefineMaxBubbleSize = Math.max(...IdeasCombinedValuesArray);
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
}

//RADIAL GRAPH
function GenerateContributionValues() {
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
  //Calculate percentage of each category from maximum, and insert into new object.
  /* !!---- TO-DO: THIS IS AN ARTIFICIAL VALUE (+10,+20,+80), CALCULATION NEEDS TO BE FIXED. ----!! */
  var EfficiencyTotalsPercentages = [];
  EfficiencyTotalsPercentages.push(Math.round(((MemberEfficiencyReplies / (MemberEfficiencyReplies + 10)) * 100)));
  EfficiencyTotalsPercentages.push(Math.round(((MemberEfficiencyReactions / (MemberEfficiencyReactions + 20)) * 100)));
  EfficiencyTotalsPercentages.push(Math.round(((MemberEfficiencyInteractions / (MemberEfficiencyInteractions + 80)) * 100)));
  EfficiencyTotalsPercentages = EfficiencyTotalsPercentages.reverse();
  //Calculate session value (Totals / Maximum (300))
  /* !!---- TO-DO: THIS IS AN ARTIFICIAL VALUE, CALCULATION NEEDS TO BE FIXED. ----!! */
  $("#SessionValue").html(((TotalEfficiencyFromMembers / 300) * 100));

  //APEX CHARTS Render radial graph
  var optionsRadial = {
    series: EfficiencyTotalsPercentages,
    chart: {
      height: 390,
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: -180,
        endAngle: 90,
        hollow: {
          margin: 5,
          size: '40%',
          background: 'transparent',
        },
        track: {
          background: '#F9F9F9'
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            show: false,
          }
        }
      },
      bar: {
        borderRadius: 10,
      }
    },
    states: {
      hover: {
        filter: {
          type: 'none'
        }
      },
      active: {
        filter: {
          type: 'none'
        }
      }
    },
    fill: {
      type: 'solid',
      colors: ['#4080FF', '#FF7BAC', '#FF931E'],
      opacity: 1
    },
    stroke: {
      lineCap: "round",
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          show: false
        }
      }
    }]
  };
  var chart = new ApexCharts(document.querySelector("#chartRadial"), optionsRadial);
  chart.render();
}

//BAR GRAPH + ANONYMOUS
function GenerateMemberContribution() {
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
  //Filter out anonymous from data since it has a different bar graph (otherwise will mess up the sort)
  var FilteredSessionDataArrayNoAnonymous = FilteredSessionDataArray.filter(function (e) {
    return e.Name !== "Anonymous";
  });
  //Calculate percentage of contribution for each member
  var MaximumContributionByMembers = 0;
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
  //Lastly retrieve the anonymous value and place into array for APEX Charts
  var AnonymousValue = FilteredSessionDataArray.filter( x => x.Name == "Anonymous").shift();
  var AnonymousIdeaTotalsValue = [AnonymousValue.IdeaTotals]

  var optionsBar = {
    series: [{
      data: IdeaTotalsOrdered
    }],
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
      }
    },
    tooltip: {
      enabled: false
    },
    states: {
      hover: {
        filter: {
          type: 'none'
        }
      },
      active: {
        filter: {
          type: 'none'
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    fill: {
      type: 'solid',
      colors: ['#4080FF'],
      opacity: 1
    },
    grid: {
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: false
        }
      },
    },
    xaxis: {
      categories: [''],
      tickAmount: 4,
      max: 40,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      }
    }
  };
  var chart = new ApexCharts(document.querySelector("#chartBar"), optionsBar);
  chart.render();

  var optionsBarAnonymous = {
    series: [{
      data: AnonymousIdeaTotalsValue
    }],
    chart: {
      type: 'bar',
      height: 90,

      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
      }
    },
    tooltip: {
      enabled: false
    },
    states: {
      hover: {
        filter: {
          type: 'none'
        }
      },
      active: {
        filter: {
          type: 'none'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(value) {
        return value + "%"
      },
      style: {
        fontSize: '14px',
        fontFamily: 'Nunito, sans-serif',
      }
    },
    grid: {
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: false
        }
      },
    },
    fill: {
      type: 'solid',
      colors: ['#4080FF'],
      opacity: 1
    },
    xaxis: {
      categories: [''],
      tickAmount: 3,
      max: 30,
      labels: {
        style: {
          fontSize: '0px'
        }
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      }
    }
  };
  var chart = new ApexCharts(document.querySelector("#chartBarAnonymous"), optionsBarAnonymous);
  chart.render();
}

function HoverTooltip(e, element) {
  var pointerX = e.pageX - $('#BubbleData')[0].offsetLeft;
  var pointerY = e.pageY - $('#BubbleData')[0].offsetTop;
  var tooltip = element.firstElementChild;
  tooltip.style.left = (pointerX + 10) + 'px';
  tooltip.style.top = (pointerY + 10) + 'px';
};

const animationDuration = 1500;
const frameDuration = 1000 / 60;
const totalFrames = Math.round( animationDuration / frameDuration );
const easeOutQuad = t => t * ( 2 - t );

const animateCountUp = el => {
  let frame = 0;
  const countTo = parseInt( el.innerHTML, 10 );
  const counter = setInterval( () => {
    frame++;
    const progress = easeOutQuad( frame / totalFrames );
    const currentCount = Math.round( countTo * progress );
    if ( parseInt( el.innerHTML, 10 ) !== currentCount ) {
      el.innerHTML = currentCount;
    }
    if ( frame === totalFrames ) {
      clearInterval( counter );
    }
  }, frameDuration );
};

// Run the animation on all elements with a class of ‘countup’
const runAnimations = () => {
  const countupEls = document.querySelectorAll( '.countup' );
  countupEls.forEach( animateCountUp );
};
