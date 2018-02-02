/* ************************************ */
/*     Define experimental variables    */
/* ************************************ */

  // Constants obtained from procedure of (Peters & Buchel, 2010)
    var NUM_TRIALS = 188;
    var SMALL_AMT = 20;
    var LARGE_AMT_MIN = 20.50;
    var LARGE_AMT_MAX = 80;
    var DELAY_MIN = 1;
    var DELAY_MAX = 233;
    var TAG_FALSE = "########";
    var TAG_TRUE = "(INSERT EPISODIC TAG)";
    var P_ASCII = 80;
    var Q_ASCII = 81;
    var NO_CHOICE = -1;
    var SMALLER_SOONER = 0;
    var LARGER_LATER = 1;

    // time of screens constants
    var TRIAL_START_DELAY = 500;
    var ALLOWED_RESPONSE_TIME = 3000;
    var JITTER_MIN_TIME = 3000;
    var JITTER_MAX_TIME = 7000;
    var CHOICE_SCREEN_TIME = 2000;
    var INSTRUCTION_RESPONSE_TIME = 30000;


  // Initialize and populate experimental data structures

    // initialize vectors of small reward amounts,
    // large reward amounts, delay amounts, k
    // values associated for each decision set,
    // and episodic tag vector
    var smallAmtVector = [];
    var largeAmtVector = [];
    var delayVector = [];
    var kVector = [];
    var episodicTagVector = [];
    var choiceBoolVector = [];

    // populate small rewards vector with SMALL_AMT constant
    // *€20*
    for (var i = 0; i < NUM_TRIALS; i++) {
      smallAmtVector.push(SMALL_AMT);
    }

    // populate large rewards vector with values within the range
    // specified by the constants SMALL_AMT, LARGE_AMT_MIN, and LARGE_AMT_MAX
    // *Between €20.50 and €80*
    for (var i = 0; i < NUM_TRIALS; i++) {
      var randomAddend = randomFloat(LARGE_AMT_MIN - SMALL_AMT, LARGE_AMT_MAX - SMALL_AMT);
      largeAmtVector.push(SMALL_AMT + randomAddend);
    }

    // populate delay amount vectors with random integers between
    // DELAY_MIN and DELAY_MAX (inclusive)
    // *Between 2 and 233 days*
    for (var i = 0; i < NUM_TRIALS; i++) {
      delayVector.push(Math.floor(randomFloat(DELAY_MIN, DELAY_MAX)));
    }

    // populate each decision set with k values where k is the
    // discount factor associated with that choice
    // derived from hyperbolic discount rate formula
    // Subjective Value/Indifference Point = Actual Value / 1 + k(Days of Delay)
    for (var i = 0; i < NUM_TRIALS; i++) {
      var k = ((smallAmtVector[i]/largeAmtVector[i]) - 1)/delayVector[i];
      kVector.push(k);
    }

    // populate the episode tag vector with half
    // trues and half false boolean values
    for (var i = 0; i < NUM_TRIALS; i++) {
      if (i % 2 === 0) {
        episodicTagVector.push(TAG_TRUE);
      } else {
        episodicTagVector.push(TAG_FALSE);
      }
    }

    // populate the choice made bool vector
    // with all false values, to be changed later
    for (var i = 0; i < NUM_TRIALS; i++) {
      choiceBoolVector.push(false);
    }

    // initialize and populate a vector of trial objects
    // integrating all previous fields
    var trialObject = {
      smallAmt: smallAmtVector,
      largeAmt: largeAmtVector,
      delayAmt: delayVector,
      kValues: kVector,
      tag: episodicTagVector,
      choiceMade: choiceBoolVector
    }
    var decisionSets = [];

    for (var i = 0; i < NUM_TRIALS; i++) {
      var trial = {
        type: "poldrack-single-stim",
        stimulus:
         "Select the option " +
         "that you would prefer pressing <strong>'q'</strong> for €20 now or <strong>'p'</strong> for the option below:" +
         "<br>" + "<br>" + "€" + trialObject.largeAmt[i].toFixed(2) + "<br>" + trialObject.delayAmt[i] + " days" + "<br>" +
         trialObject.tag[i],
    	is_html: true,
    		data: {
    			smallAmt: trialObject.smallAmt[i],
    			largeAmt: trialObject.largeAmt[i],
    			delayAmt: trialObject.delayAmt[i],
    			kValues: trialObject.kValues[i],
          tag: trialObject.tag[i],
          choiceMade: choiceBoolVector[i]
        },
        on_finish: function(data) {
          var choiceMade = false;
          var whichChoice = "";
          var choiceAmt = NO_CHOICE;
          var choiceDelayAmt = NO_CHOICE;

          if (data.key_press === P_ASCII) {
            choiceMade = true;
            whichChoice = SMALLER_SOONER;
            choiceAmt = data.smallAmt;
            choiceDelayAmt = data.delayAmt;
          } else if (data.key_press === Q_ASCII) {
            choiceMade = true;
            choiceAmt = data.largeAmt;
            choiceDelayAmt = data.delayAmt;
            whichChoice = LARGER_LATER;
          }

          jsPsych.data.addDataToLastTrial({
            choiceMade: choiceMade,
            choiceAmt: choiceAmt,
            choiceDelayAmt: choiceDelayAmt,
            whichChoice: whichChoice
          })
        }
      }
      decisionSets.push(trial);
    }

    // create main timeline sequence to be looped
    var trials = [];
    for (var i = 0; i < decisionSets.length; i++) {
      trials.push(trialStart);
      trials.push(decisionSets[i]);
      trials.push(jitter);
      if (decisionSets[i].data.choiceMade === false) {
        trials.push(noChoice);
      } else if (decisionSets[i].data.choiceMade === true) {
        trials.push(yesChoice);
      }
      trials.push(jitter);
    }

/* ************************************ */
/*         Set up jsPsych blocks        */
/* ************************************ */

    // instruction screens
    var start1 = {
      type: "poldrack-text",
      text: "Welcome to the experiment. This task will take around 5 minutes. Press <strong>enter</strong> to begin.",
    	timing_response: INSTRUCTION_RESPONSE_TIME
    };


    var start2 = {
      type: "poldrack-text",
      text: "In this experiment, your task is to indicate if you would prefer 20 Euros immediately" +
      " or the monetary amount on the screen after the specified amount of time." + "<br>" +
      "Press <strong>\"q\"</strong> to choose the 20€ or <strong>\"p\"</strong> for the option on the screen.",
      timing_response: INSTRUCTION_RESPONSE_TIME
    };

    var jitter = {
      type: "poldrack-single-stim",
      stimulus: "img/imagesTitRate/jitter.jpg",
      timing_response: randomFloat(JITTER_MIN_TIME, JITTER_MAX_TIME),
      allow_keys: false
    };

    var trialStart = {
      type: "poldrack-single-stim",
      stimulus: "img/imagesTitRate/trialStart.jpg",
      timing_response: TRIAL_START_DELAY,
      allow_keys: false
    };

    var noChoice = {
      type: "poldrack-single-stim",
      stimulus: "img/imagesTitRate/noChoice.jpg",
      timing_response: CHOICE_SCREEN_TIME,
      allow_keys: false
    };

    var yesChoice = {
      type: "poldrack-single-stim",
      stimulus: "img/imagesTitRate/yesChoice.jpg",
      timing_response: CHOICE_SCREEN_TIME,
      allow_keys: false
    };

    ///////////////////// Main Test Block /////////////////////
    var mainTest = {
      timeline: trials,
      is_html: true,
      choices: [P_ASCII, Q_ASCII],
      response_ends_trial: true,
      timing_response: ALLOWED_RESPONSE_TIME
    };

/* ************************************ */
/*        Define helper functions       */
/* ************************************ */

    // for each subject performing a number of trials,
    // find the average k rate of their choices
    function findKRate(kVector) {
      var sum;
      for (var i = 0; i < kVector.length; i++) {
        sum += kVector[i];
      }
      var averageK = sum/kVector.length;
      return averageK;
    };

    // random float generation (inclusive)
    function randomFloat(min, max) {
      return Math.random() * (max - min + 1) + min;
    };

    ////////////////// Building Timeline Skeleton //////////////////
    var timeline = [];
      timeline.push(start1);
      timeline.push(start2);
      timeline.push(mainTest);
      jsPsych.init({
        timeline: timeline,

        on_finish: function(kVector) {
          var avgK = findKRate(kVector);
          var display = {
            type: "text",
            text: "Your discount rate is " + avgK + "."
          }
        }
    });
