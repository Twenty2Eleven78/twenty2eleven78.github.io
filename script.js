const stopwatchDisplay = document.getElementById('stopwatch');
const startPauseButton = document.getElementById('startPauseButton');
const goalButton = document.getElementById('goalButton');
const goalScorer = document.getElementById('goalScorer');
const goalAssist = document.getElementById('goalAssist');
const resetButton = document.getElementById('resetButton');
const log = document.getElementById('log');

let seconds = 0;
let intervalId;
let isRunning = false;
let data = []; // Array to store goal data

function startStopwatch() {
  if (!isRunning) {
    intervalId = setInterval(() => {
      seconds++;
      const formattedTime = formatTime(seconds);
      stopwatchDisplay.textContent = formattedTime;
    }, 1000);
    isRunning = true;
    startPauseButton.textContent = "Pause";
  } else {
    clearInterval(intervalId);
    isRunning = false;
    startPauseButton.textContent = "Start";
  }
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `<span class="math-inline">\{hours\.toString\(\)\.padStart\(2, '0'\)\}\:</span>{minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2,'0')}`;
}

startPauseButton.addEventListener('click', startStopwatch);

goalButton.addEventListener('click', () => {
  const timestamp = stopwatchDisplay.textContent;
  const goalScorerName = goalScorer.value;
  const goalAssistName = goalAssist.value;

  if (goalScorerName.trim() !== '' && goalAssistName.trim() !== '') {
    data.push({ timestamp, goalScorerName, goalAssistName });
    updateLog();
    goalScorer.value = '';
    goalAssist.value = '';
  } else {
    alert('Please enter both goal scorer and assistant names.');
  }
});

resetButton.addEventListener('click', () => {
  if (confirm("Are you sure you want to reset the game?")) {
    clearInterval(intervalId);
    seconds = 0;
    stopwatchDisplay.textContent = '00:00:00';
    data = [];
    updateLog();
    isRunning = false;
    startPauseButton.textContent = "Start";
  }
});

function updateLog() {
  log.innerHTML = '';
  data.forEach(entry => {
    const { timestamp, goalScorerName, goalAssistName } = entry;
    const logEntry = `${timestamp}: **Goal:** ${goalScorerName}, **Assist:** ${goalAssistName}`;
    log.innerHTML += `<p>${logEntry}</p>`;
  });
}

// Persist data to local storage
try {
  localStorage.setItem('timeTrackerData', JSON.stringify(data));
} catch (error) {
  console.error