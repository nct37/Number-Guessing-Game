/*
GAME FUNCTION:
-player can press ENTER button to start play as a GUEST
-player can enter name to save play into local local storage
-player can select saved name to start play
-player must guess a number between a min and max
-player gets a certain amount of guesses
-notify player of guesses remaining and whether high or low
-notify the player of the correct answer if loose
-randomly show scary face and sound
-refresh the page to play again after win, lose, or scary face

***Credit inspiration to B. Traversy***
*/

(function() {
  // Game values //
  let min = 1,
    max = 100,
    winningNum = Math.ceil(Math.random() * max),
    guessesLeft = 7,
    guessParLevel = Math.floor(Math.random() * guessesLeft), // For randomly showing scary face
    playerArray = localStorage.getItem('players') ? JSON.parse(localStorage.getItem('players')) : [],
    newPlayerSubmitted = false,
    playerToUpdate = '',
    seconds = 2,
    playerScore = 0;
  console.log(winningNum, playerArray);

  // UI elements //

  const game = document.querySelector('body'),
    playerList = document.getElementById('player-list'),
    playerNameEntryContainer = document.getElementById('player-input'),
    playerNameEntry = document.getElementById('enter-player'),
    gameContainer = document.getElementById('game-container'),
    gameWrapper = document.getElementById('game-wrapper'),
    minNum = document.querySelector('.min-num'),
    maxNum = document.querySelector('.max-num'),
    guesses = document.querySelector('.guesses'),
    timer = document.getElementById('timer'),
    guessBtn = document.getElementById('guess-btn'),
    guessInput = document.getElementById('guess-input'),
    message = document.querySelector('.message'),
    playerDash = document.querySelector('.player-dash');

  // Methods in variables //

  // Find a player in local storage
  const thisPlayer = (name) =>
    playerArray.find(player =>
      player.name === name);


  // Assign UI min and max //

  minNum.textContent = min;
  maxNum.textContent = max;
  guesses.textContent = guessesLeft;

  // Load dropdown list from local storage//

  loadPlayerList();
  playerNameEntry.focus();

  // Event listeners //

  playerNameEntry.addEventListener('keyup', submitName);
  guessBtn.addEventListener('click', submitGuess);
  guessInput.addEventListener('keyup', submitGuess);
  playerList.addEventListener('change', selectPlayerFromDropdown);

  // Player submits name and is stored in local storage
  function submitName(e) {
    e.preventDefault();

    if (e.keyCode === 13) {
      if (playerNameEntry.value === '') {
        welcomeMessage(`Be our guest!`);
      } else {
        localStorageCheck(playerNameEntry.value);
      }
      playerNameEntry.value = '';
      playerNameEntry.disabled = true;
      guessInput.disabled = false;
      guessInput.focus();
      newPlayerSubmitted = true;
    }
  }

  // Existing player is selected from the dropdown list
  function selectPlayerFromDropdown(e) {
    let playerToLowerCase = e.target.value.toLowerCase();
    let existingPlayer = thisPlayer(playerToLowerCase).name;
    let existingPlayerScore = thisPlayer(playerToLowerCase).score;
    playerToUpdate = thisPlayer(playerToLowerCase);

    welcomeMessage(`Welcome back, ${existingPlayer.toUpperCase()}!
                   Can you top your best score of ${existingPlayerScore}?`);
    playerList.selectedIndex = '0';
    guessInput.disabled = false;
    guessInput.focus();
  }

  // Player submits guess
  function submitGuess(e) {
    e.preventDefault();

    if ((e.keyCode === 13) || e.target.value === "Submit") {
      let guess = parseInt(guessInput.value);

      if (playerDash.textContent === '') {
        alert('Must be a guest or have a player name to enter a guess.');
      } else if (isNaN(guess) || guess < min || guess > max) {
        alert(`Please choose a number between ${min} and ${max}.`);
        guessInput.value = '';
      } else if (guessesLeft === 7 && playerDash.textContent !== '') {
        timerNotification(true); // Set the timer
        resultsMessage(guess);
      } else {
        resultsMessage(guess);
      }
    }
  }

  // Determine a message based on the results
  function resultsMessage(guess) {
    guessesLeft--;
    // User wins, show Carlton dancing
    if (guess === winningNum) {
      updateScore();
      changeInputStyle('green', 'green');
      message.innerHTML = `You guessed the winning number of <span class="results">${winningNum}</span>!
      Score: ${playerScore}`;
      soundEffect('dance');

      setTimeout(function() {
        game.classList.add('carlton');
        gameContainer.style.display = 'none';
        playerNameEntryContainer.style.display = 'none';
      }, 3500);

      startOver();
      //User uses all guesses and loses
    } else if (guessesLeft === 0) {
      updateScore();
      changeInputStyle('red', 'red');
      message.innerHTML = `Sorry, you lose. The correct number is <span class="results">${winningNum}</span>. Play again?`;
      guessBtn.className += 'play-again';
      guessBtn.value = 'Play Again';

      startOver();
      // User guesses wrong, showing number too high or low, and guesses left
    } else if (guessesLeft > guessParLevel) {
      changeInputStyle('red', 'red');
      message.innerHTML = `<span class="results">${guess}</span> is ${(guess < winningNum) ? `too low. `:`too high. `}Try again, you have <span class="results">${guessesLeft}</span> guesses remaining.`;
      // Randomly show a scary face and scream
    } else {
      gameContainer.style.display = 'none';
      playerNameEntryContainer.style.display = 'none';
      game.classList.add('face');

      soundEffect('scream');
      startOver('scream');
    }
  }

  // Helper functions //

  // Reset the game automatically
  function startOver(reset) {
    let timeOut = 0;
    (reset === 'scream') ? timeOut = 4000: timeOut = 10000;

    setTimeout(function() {
      location.reload();
    }, timeOut);
  }

  function welcomeMessage(message) {
    playerDash.style.color = 'darkblue';
    playerDash.textContent = message;
  }
  // Change input style and message based on correct and incorrect answer
  function changeInputStyle(messageColor, inputColor) {
    message.style.color = messageColor;
    guessInput.style.borderColor = inputColor;
  }
  // Update player score
  function updateScore() {
    timerNotification(false);
    let secondsUsedCalc = 250 - seconds;
    let guessesLeftCalc = guessesLeft === 6 ? (guessesLeft * 100) + 500 : guessesLeft * 100;
    playerScore = secondsUsedCalc + guessesLeftCalc;

    if (playerScore > playerToUpdate.score) {
      playerToUpdate.score = playerScore;
      localStorage.setItem('players', JSON.stringify(playerArray));
    }
    return playerScore;
  }

  function soundEffect(effect) {
    let sound = document.createElement('audio');
    effect === 'scream' ? sound.src = 'audio/nmh_scream1.mp3' :
      sound.src = 'audio/1965-74.mp3';

    gameWrapper.appendChild(sound);
    sound.play();
  }
  // Store user and score in local storage
  function localStorageCheck(currentPlayer) {
    let lowerCasedPlayer = currentPlayer.toLowerCase();

    if (thisPlayer(lowerCasedPlayer) === undefined) {
      playerArray.push(new Player(lowerCasedPlayer, playerScore));
      playerToUpdate = thisPlayer(lowerCasedPlayer);
      welcomeMessage(`Hello, ${currentPlayer.toUpperCase()}! Let's play...`);
    } else {
      alert(`${currentPlayer.toUpperCase()}, it appears you've been here before! Choose your name from the existing players list.`);
    }

    localStorage.setItem('players', JSON.stringify(playerArray));
  }
  // Pull from local storage and dispay player list
  function loadPlayerList() {
    playerArray.forEach(addPlayerToUIList);
  }
  // New player is added to the dropdown list
  function addPlayerToUIList(player) {
    const newPlayer = document.createElement('option');
    newPlayer.textContent = newPlayerSubmitted ? titleCaseName(player) : titleCaseName(player.name);
    playerList.add(newPlayer);
  }
  // Capitalize first letter of player name
  function titleCaseName(name) {
    if (typeof name === 'string') {
      name = name.charAt(0).toUpperCase() + name.slice(1);
    }
    return name;
  }
  // Create a new player and score
  function Player(name, score) {
    this.name = name;
    this.score = score;
  }
  // Set a timer - this will be used to add to total score
  // Less time means higher score
  function timeElapsed() {
    timer.textContent = `Timer: ${seconds}`;
    seconds++;
  }
  // Notify the player that the timer has begun
  function timerNotification(start) {
    if (start === true) {
      let time = setInterval(timeElapsed, 1000);
      timer.textContent = `Timer start!`;
      setTimeout(time, 3000);
    } else {
      timer.textContent = `TIME!`;
    }
  }
})();
