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
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2,'0')}`;
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

let resetClickTime = null;

resetButton.addEventListener('click', () => {
  showConfirmationModal('Are you sure you want to reset the stopwatch and log data?', () => {
    clearInterval(intervalId);
    seconds = 0;
    stopwatchDisplay.textContent = '00:00:00';
    data = [];
    updateLog();
    isRunning = false;
    startPauseButton.textContent = "Start";
  });
});

function updateLog() {
  log.innerHTML = '';
  data.forEach(entry => {
    const { timestamp, goalScorerName, goalAssistName } = entry;
    const logEntry = `${timestamp}: **Goal:** ${goalScorerName}, **Assist:** ${goalAssistName}`;
    log.innerHTML += `<p>${logEntry}</p>`;
  });
}

function recordGoal() {
  if (!selectedScorer || !selectedAssist) return;

  const timestamp = elements.stopwatch.textContent;
  const goalData = {
    timestamp,
    scorer: selectedScorer,
    assist: selectedAssist
  };

  // Append goal data to the log
  const logEntry = document.createElement('div');
  logEntry.classList.add('goal-entry');
  logEntry.innerHTML = `
    <div class="goal-time">${timestamp}</div>
    <div class="goal-scorer">⚽ ${selectedScorer.number} ${selectedScorer.name}</div>
    <div class="goal-assist">👟 ${selectedAssist.number} ${selectedAssist.name}</div>
  `;
  elements.log.appendChild(logEntry);

  // Clear selected players
  selectedScorer = null;
  selectedAssist = null;
  elements.selectedScorer.value = '';
  elements.selectedAssist.value = '';

  // Scroll to the bottom of the log (optional)
  elements.log.scrollTop = elements.log.scrollHeight;
}

function showConfirmationModal(message, onConfirm) {
  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.innerHTML = `
    <div class="modal-content">
      <p>${message}</p>
      <button class="modal-confirm">Confirm</button>   

      <button class="modal-cancel">Cancel</button>
    </div>
  `;

  const confirmButton = modal.querySelector('.modal-confirm');
  confirmButton.addEventListener('click', () => {
    onConfirm();
    document.body.removeChild(modal);
  });

  const cancelButton = modal.querySelector('.modal-cancel');
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  document.body.appendChild(modal);
}

// Persist data to local storage
try {
  localStorage.setItem('timeTrackerData', JSON.stringify(data));
} catch (error) {
  console.error('Error storing data:', error);
}

// Retrieve data from local storage on page load
try {
  const storedData = localStorage.getItem('timeTrackerData');
  if (storedData) {
    data = JSON.parse(storedData);
    updateLog();
  }
} catch (error) {
  console.error('Error retrieving data:', error);
}