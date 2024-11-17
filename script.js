let roster = []; // Array to store player data
let seconds = 0;
let intervalId;
let isRunning = false;
let selectedScorer = null;
let selectedAssist = null;

// Function to initialize the app
function init() {
  // Cache DOM elements
  const elements = {
    stopwatch: document.getElementById('stopwatch'),
    startPauseButton: document.querySelector('#startPauseButton'),
    rosterList: document.getElementById('rosterList'),
    addPlayerBtn: document.getElementById('addPlayerBtn'),
    selectedScorerInput: document.getElementById('selectedScorer'),
    selectedAssistInput: document.getElementById('selectedAssist'),
    confirmGoal: document.getElementById('confirmGoal'),
    cancelGoal: document.getElementById('cancelGoal'),
    log: document.getElementById('log'),
  };
  
  // Load roster data from localStorage (optional)
  roster = JSON.parse(localStorage.getItem('roster')) || [];
  updateRosterList();

  // Event listeners
  elements.startPauseButton.addEventListener('click', toggleTimer);
  elements.addPlayerBtn.addEventListener('click', openAddPlayerDialog);
  elements.selectedScorerInput.addEventListener('click', selectPlayer('scorer'));
  elements.selectedAssistInput.addEventListener('click', selectPlayer('assist'));
  elements.confirmGoal.addEventListener('click', recordGoal);
  elements.cancelGoal.addEventListener('click', clearSelectedPlayers);
}

// Function to toggle the timer
function toggleTimer() {
  if (!isRunning) {
    intervalId = setInterval(() => {
      seconds++;
      updateStopwatch();
    }, 1000);
    isRunning = true;
    elements.startPauseButton.textContent = 'Pause';
  } else {
    clearInterval(intervalId);
    isRunning = false;
    elements.startPauseButton.textContent = 'Start';
  }
}

// Function to update the stopwatch display
function updateStopwatch() {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedTime = `<span class="math-inline">\{minutes\.toString\(\)\.padStart\(2, '0'\)\}\:</span>{remainingSeconds.toString().padStart(2,   
 '0')}`;
  elements.stopwatch.textContent = formattedTime;
}

// Function to update the roster list
function updateRosterList() {
  const rosterList = elements.rosterList;
  rosterList.innerHTML = ''; // Clear existing list

  for (const player of roster) {
    const playerCardTemplate = document.getElementById('playerCardTemplate');
    const playerCard = playerCardTemplate.content.cloneNode(true).querySelector('.player-card');
    playerCard.querySelector('.player-number').textContent = `#${player.number}`;
    playerCard.querySelector('.player-name').textContent = player.name;
    playerCard.addEventListener('click', () => selectPlayer(player.id));
    rosterList.appendChild(playerCard);
  }
}

// Function to open the add player dialog
function openAddPlayerDialog() {
  const dialog = document.querySelector('.md-dialog'); // Assuming class for dialog
  dialog.showModal();
}

// Function to handle player selection (scorer or assist)
function selectPlayer(playerId) {
  if (playerId === 'scorer') {
    selectedScorer = null;
    elements.selectedScorerInput.value = '';
  } else if (playerId === 'assist') {
    selectedAssist = null;
    elements.selectedAssistInput.value = '';
  } else {
    const player = roster.find(p => p.id === playerId);
    if (player) {
      if (playerId === selectedScorer?.id) return; // Prevent selecting the same player twice
      if (!selectedScorer) {
        selectedScorer = player;
        elements.selectedScorerInput.value = `#${player.number} ${player.name}`;
      } else if (!selectedAssist) {
        selectedAssist = player;
        elements.selectedAssistInput.value = `#${player.number} ${player.name}`;
      }
    }
  }
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
  elements.selectedScorerInput.value = '';
  elements.selectedAssistInput.value = '';
}