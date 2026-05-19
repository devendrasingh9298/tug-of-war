
const GAME_DURATION = 60; 
let timerInterval;
let botInterval;
let timeLeft = GAME_DURATION;
let gameActive = false;
let gameMode = 'vsUser'; // 'vsUser' or 'vsBot'

let gameState = {
    t1: { name: 'User 1', score: 0, currentAnswer: '', expectedAnswer: 0 },
    t2: { name: 'User 2', score: 0, currentAnswer: '', expectedAnswer: 0 },
    ropePosition: 0 
};

const timerDisplay = document.getElementById('timer');
const ropeSystem = document.getElementById('ropeSystem');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const winnerText = document.getElementById('winnerText');
const finalScores = document.getElementById('finalScores');
const keypad2 = document.getElementById('keypad2');

document.querySelectorAll('.keypad').forEach(keypad => {
    const team = keypad.dataset.team;
    keypad.addEventListener('click', (e) => {
        if (!gameActive || !e.target.classList.contains('key')) return;
        handleInput(team, e.target.innerText);
    });
});

function setupGame(mode) {
    gameMode = mode;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    if (gameMode === 'vsBot') {
        gameState.t1.name = "User";
        gameState.t2.name = "Computer";
        keypad2.classList.add('disabled-keypad'); // Lock right keypad
    } else {
        gameState.t1.name = "User 1";
        gameState.t2.name = "User 2";
        keypad2.classList.remove('disabled-keypad');
    }

    document.getElementById('team1Label').innerText = gameState.t1.name;
    document.getElementById('team2Label').innerText = gameState.t2.name;

    startGame();
}

function startGame() {
    gameActive = true;
    timeLeft = GAME_DURATION;
    
    gameState.t1.score = 0;
    gameState.t2.score = 0;
    gameState.ropePosition = 0;
    
    updateScoreDisplays();
    updateRopePosition();
    
    generateQuestion('1');
    generateQuestion('2');
    
    clearInterval(timerInterval);
    clearInterval(botInterval);
    
    timerInterval = setInterval(updateTimer, 1000);

    if (gameMode === 'vsBot') {
        startBotBehavior();
    }
}

function updateTimer() {
    timeLeft--;
    let mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    let secs = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.innerText = `${mins}:${secs}`;

    if (timeLeft <= 0) {
        endGame();
    }
}

function generateQuestion(team) {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const answer = num1 + num2;
    
    gameState[`t${team}`].expectedAnswer = answer;
    gameState[`t${team}`].currentAnswer = '';
    
    document.getElementById(`eqn${team}`).innerText = `${num1} + ${num2} = ?`;
    document.getElementById(`input${team}`).innerText = '';
}

function handleInput(team, val) {
    const player = gameState[`t${team}`];
    const display = document.getElementById(`input${team}`);

    if (val === 'X') {
        player.currentAnswer = '';
    } else {
        if (player.currentAnswer.length < 3) {
            player.currentAnswer += val;
        }
    }

    display.innerText = player.currentAnswer;

    if (parseInt(player.currentAnswer) === player.expectedAnswer) {
        player.score++;
        
        if (team === '1') {
            gameState.ropePosition -= 25; 
        } else {
            gameState.ropePosition += 25; 
        }

        updateScoreDisplays();
        updateRopePosition();
        generateQuestion(team);
    }
}

/* Computer AI Mechanics */
function startBotBehavior() {
    // Computer triggers a correct response dynamically every 3.5 to 6 seconds
    function triggerBotAction() {
        if (!gameActive) return;
        
        let botInputDisplay = document.getElementById('input2');
        let targetAnswer = gameState.t2.expectedAnswer.toString();
        
        // Simulate typing latency
        let currentStr = "";
        let charIdx = 0;
        
        let typingInterval = setInterval(() => {
            if (!gameActive) {
                clearInterval(typingInterval);
                return;
            }
            
            currentStr += targetAnswer[charIdx];
            botInputDisplay.innerText = currentStr;
            charIdx++;

            if (currentStr === targetAnswer) {
                clearInterval(typingInterval);
                
                // Execute success logic for bot
                gameState.t2.score++;
                gameState.ropePosition += 25; 
                
                updateScoreDisplays();
                updateRopePosition();
                generateQuestion('2');
                
                // Plan next automated answer loop
                scheduleNextBotAction();
            }
        }, 300);
    }

    function scheduleNextBotAction() {
        let randomDelay = Math.random() * (6000 - 3500) + 3500;
        botInterval = setTimeout(triggerBotAction, randomDelay);
    }

    scheduleNextBotAction();
}

function updateScoreDisplays() {
    document.getElementById('score1').innerText = gameState.t1.score;
    document.getElementById('score2').innerText = gameState.t2.score;
}

function updateRopePosition() {
    ropeSystem.style.left = `calc(50% + ${gameState.ropePosition}px)`;
}

function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    clearTimeout(botInterval);
    
    let winner = "";
    if (gameState.ropePosition < 0) {
        winner = `${gameState.t1.name} Wins by Pull!`;
    } else if (gameState.ropePosition > 0) {
        winner = `${gameState.t2.name} Wins by Pull!`;
    } else {
        if (gameState.t1.score > gameState.t2.score) winner = `${gameState.t1.name} Wins on Points!`;
        else if (gameState.t2.score > gameState.t1.score) winner = `${gameState.t2.name} Wins on Points!`;
        else winner = "It's a Tie!";
    }

    winnerText.innerText = winner;
    finalScores.innerText = `${gameState.t1.name}: ${gameState.t1.score} points | ${gameState.t2.name}: ${gameState.t2.score} points`;
    gameOverScreen.classList.remove('hidden');
}

function returnToMenu() {
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
}
