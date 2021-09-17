// Import shuffle.js
import shuffle from './shuffle.js';

// Pages
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
// Splash Page
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArr = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timeplayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = "0.0";

// Scroll
let valueY = 0;

// Refresh splash page best scores
const bestScoresToDOM = () => {
  bestScores.forEach((bestScore, index) => {
    const bestScoreEl = bestScore;
    bestScoreEl.textContent = `${bestScoreArray[index].bestScore}s`;
  });
};

// Check local storage for best scores, and set best score array
const getSavedBestScores = () => {
  if (localStorage.getItem("bestScores")) {
    bestScoreArray = JSON.parse(localStorage.bestScores);
  } else {
    bestScoreArray = [
      {
        questions: 10,
        bestScore: finalTimeDisplay,
      },
      {
        questions: 25,
        bestScore: finalTimeDisplay,
      },
      {
        questions: 50,
        bestScore: finalTimeDisplay,
      },
      {
        questions: 99,
        bestScore: finalTimeDisplay,
      },
    ];
    localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
  }
  bestScoresToDOM();
};

// Update the best score array
const updateBestScores = () => {
  bestScoreArray.forEach((score, index) => {
    // Select the correct best score to update
    if (score.questions == questionAmount) {
      // Return best score as number with one decimal place
      const savedBestScore = Number(bestScoreArray[index].bestScore);
      // Update best score if the new score is less or replacing zero
      if (savedBestScore === 0 || savedBestScore > finalTime) {
        bestScoreArray[index].bestScore = finalTimeDisplay;
      }
    }
  });
  // Update Splash Page
  bestScoresToDOM();
  // Save best scores to local storage
  localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
};

// Reset Game
const playAgain = () => {
  gamePage.addEventListener('click', startTimer);
  // hide score page
  scorePage.hidden = true;
  // Show splash page
  splashPage.hidden = false;
  // Reset equation array
  equationsArray = [];
  // Reset player guess array
  playerGuessArr = [];
  // Reset Scroll
  valueY = 0;
  // Reset play again button
  playAgainBtn.hidden = true;
};
window.playAgain = playAgain;

// Show Score page
const showScorePage = () => {
  // Show Play Again button after 1 second
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 1000);
  gamePage.hidden = true;
  scorePage.hidden = false;
};

// Format and display time in Dom
const scoresToDOM = () => {
  // toFixed method formats a number to a certain number of decimal places
  finalTimeDisplay = finalTime.toFixed(1);
  // Set the base time in the DOM
  baseTime = timeplayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  // Set the final time in the DOM
  finalTimeEl.textContent = `${finalTimeDisplay}s`;
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty Time: +${penaltyTime}s`;
  updateBestScores();
  // Scroll to the top of the page, go to score page 
  itemContainer.scrollTo({ top: 0, behavior: 'instant' });
  showScorePage();
};

// Stop the timer, and Process Results, got to the score page
const checkTime = () => {
  if (playerGuessArr.length == questionAmount) {
    // Stop the timer
    clearInterval(timer);
    // Check for wrong answers, and add penalty time
    equationsArray.forEach((guess, index) => {
      if (guess.evaluated === playerGuessArr[index]) {
        // Correct guess, No penalty

      } else {
        // Wrong guess, add penalty time
        penaltyTime += 0.5;
      }
    });
    finalTime = timeplayed + penaltyTime;
    scoresToDOM();
  }
};

// add one tenth of a second to the time played
const addTime = () => {
  timeplayed += 0.1;
  checkTime();
};

// Start time when game page is loaded
const startTimer = () => {
  // Resets the times
  timeplayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  // Start the timer
  timer = setInterval(addTime, 100);
  // remove event listener from game page so it can be triggered once
  gamePage.removeEventListener('click', startTimer);
};

// Scroll and Store the user selection in playerGuessArr
const scrollHandler = (guessedTrue) => {
  // scroll 80px 
  valueY += 80;
  itemContainer.scroll(0, valueY);
  // Add player guess to array
  return guessedTrue ? playerGuessArr.push(true) : playerGuessArr.push(false);
};
window.scrollHandler = scrollHandler;

// Displays Game Page
const showGamePage = () => {
  gamePage.hidden = false;
  countdown.hidden = true;
};

// Add equations to DOM
const equationsToDom = () => {
  equationsArray.forEach((equation) => {
    // Item
    const Item = document.createElement('div');
    Item.classList.add('item');
    // Equation text
    const equationText = document.createElement('h1');
    equationText.textContent = equation.value;
    // append to item
    Item.appendChild(equationText);
    // append to container
    itemContainer.appendChild(Item);
  });
};

// Get Random Number up to a max number
const getRandomNumber = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomNumber(questionAmount);
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomNumber(9);
    secondNumber = getRandomNumber(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: 'true' };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomNumber(9);
    secondNumber = getRandomNumber(9);
    const equationValue = firstNumber * secondNumber;
    // Randomly playing around with the equation results
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomNumber(3); //represents the index of the wrongFormat array
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: 'false' };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = '';
  // Spacer
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  // Selected Item
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDom();
  // Set Blank Space Below
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  itemContainer.appendChild(bottomSpacer);
}

//Displays the countdown timer, 3,2,1,GO!
const displayCountdown = () => {
  countdown.textContent = '3';
  setTimeout(() => {
    countdown.textContent = '2';
  }, 1000);
  setTimeout(() => {
    countdown.textContent = '1';
  }, 2000);
  setTimeout(() => {
    countdown.textContent = 'GO!';
  }, 3000);
};

// Navigate from splash page to countdown page
const showCountDownPage = () => {
  countdownPage.hidden = false;
  splashPage.hidden = true;
  displayCountdown();
  populateGamePage();
  setTimeout(showGamePage, 4000);
};

// Get the value from selected radio button
const getSelectedRadioValue = () => {
  let radioValue;
  radioInputs.forEach((radioInput) => {
    if (radioInput.checked) {
      radioValue = radioInput.value;
    }
  });
  return radioValue;
};

// Func that decides amount of questions
const selectQuestionAmount = (e) => {
  e.preventDefault();
  questionAmount = getSelectedRadioValue();
  if (questionAmount) {
    showCountDownPage();
  }
};

// Event Listeners
startForm.addEventListener('click', () => {
  radioContainers.forEach((radioEl) => {
    // Remove selected label styling
    radioEl.classList.remove('selected-label');
    // Add it back if the radio input is checked
    if (radioEl.children[1].checked) {
      radioEl.classList.add('selected-label');
    }
  });
});

startForm.addEventListener("submit", selectQuestionAmount);
gamePage.addEventListener('click', startTimer);
// On load
getSavedBestScores();