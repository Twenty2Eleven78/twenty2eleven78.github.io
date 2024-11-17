// Player roster and game data
let roster = JSON.parse(localStorage.getItem('roster')) || [];
let data = [];
let seconds = 0;
let intervalId;
let isRunning = false;

// Cache DOM elements
const elements = {
  stopwatch: document.getElementById('stopwatch'),
  startPauseBtn: document.querySelector('#startPauseButton'),
  goalBtn: document.querySelector('#goalButton'),
  resetBtn: document.querySelector('#resetButton'),
  log: document.getElementById('log'),
  scorer: document.getElementById('goalScorer'),
  assist: document.getElementById('goalAssist')
};

// Create mobile UI
function createMobileUI() {
  const container = document.createElement('div');
  container.className = 'mobile-container';
  
  // Timer section
  const timerSection = `
    <div class="timer-section">
      <div id="stopwatch" class="stopwatch">00:00</div>
      <button id="startPauseButton" class="large-btn">Start</button>
    </div>
  `;
  
  // Player selection section
  const playerSection = `
    <div class="player-section">
      <div class="tabs">
        <button class="tab-btn active" data-tab="roster">Roster</button>
        <button class="tab-btn" data-tab="goals">Goals</button>
      </div>
      
      <div id="rosterTab" class="tab-content active">
        <div class="roster-header">
          <h3>Team Roster</h3>
          <button id="addPlayerBtn" class="circle-btn">+</button>
        </div>
        <div id="rosterList" class="roster-list"></div>
      </div>
      
      <div id="goalsTab" class="tab-content">
        <div id="log" class="goals-log"></div>
      </div>
    </div>
    
    <div id="goalActions" class="goal-actions hidden">
      <div class="selected-players">
        <div id="selectedScorer" class="selected-player">Select Scorer</div>
        <div id="selectedAssist" class="selected-player">Select Assist</div>
      </div>
      <button id="confirmGoal" class="large-btn">Record Goal</button>
      <button id="cancelGoal" class="text-btn">Cancel</button>
    </div>
    
    <dialog id="playerDialog">
      <form method="dialog" class="player-form">
        <input type="text" id="playerName" placeholder="Player Name" required>
        <input type="number" id="playerNumber" placeholder="#" required>
        <div class="dialog-buttons">
          <button type="submit" class="confirm-btn">Add</button>
          <button type="button" id="cancelDialog" class="cancel-btn">Cancel</button>
        </div>
      </form>
    </dialog>
  `;
  
  container.innerHTML = timerSection + playerSection;
  document.querySelector('main').appendChild(container);
  
  setupEventListeners();
  updateRosterUI();
}

function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`${btn.dataset.tab}Tab`).classList.add('active');
    });
  });
  
  // Player dialog
  const dialog = document.getElementById('playerDialog');
  const addPlayerBtn = document.getElementById('addPlayerBtn');
  const cancelDialog = document.getElementById('cancelDialog');
  
  addPlayerBtn.addEventListener('click', () => dialog.showModal());
  cancelDialog.addEventListener('click', () => dialog.close());
  
  dialog.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('playerName').value;
    const number = document.getElementById('playerNumber').value;
    
    addPlayer(name, number);
    dialog.close();
    
    // Clear inputs
    document.getElementById('playerName').value = '';
    document.getElementById('playerNumber').value = '';
  });
  
  // Goal recording
  const goalActions = document.getElementById('goalActions');
  const confirmGoal = document.getElementById('confirmGoal');
  const cancelGoal = document.getElementById('cancelGoal');
  
  confirmGoal.addEventListener('click', recordGoal);
  cancelGoal.addEventListener('click', () => {
    goalActions.classList.add('hidden');
    clearSelectedPlayers();
  });
}

function addPlayer(name, number) {
  const player = {
    id: Date.now(),
    name,
    number,
    goals: 0,
    assists: 0
  };
  
  roster.push(player);
  saveRoster();
  updateRosterUI();
}

function updateRosterUI() {
  const rosterList = document.getElementById('rosterList');
  rosterList.innerHTML = roster.map(player => `
    <div class="player-card" onclick="selectPlayer(${player.id})">
      <div class="player-info">
        <span class="player-number">#${player.number}</span>
        <span class="player-name">${player.name}</span>
      </div>
      <div class="player-stats">
        <span>⚽ ${player.goals}</span>
        <span>👟 ${player.assists}</span>
      </div>
    </div>
  `).join('');
}

// Player selection for goals
let selectedScorer = null;
let selectedAssist = null;

function selectPlayer(playerId) {
  const player = roster.find(p => p.id === playerId);
  if (!player) return;
  
  const goalActions = document.getElementById('goalActions');
  
  if (!selectedScorer) {
    selectedScorer = player;
    document.getElementById('selectedScorer').textContent = `Scorer: #${player.number} ${player.name}`;
  } else if (!selectedAssist && player.id !== selectedScorer.id) {
    selectedAssist = player;
    document.getElementById('selectedAssist').textContent = `Assist: #${player.number} ${player.name}`;
    goalActions.classList.remove('hidden');
  }
}

function clearSelectedPlayers() {
  selectedScorer = null;
  selectedAssist = null;
  document.getElementById('selectedScorer').textContent = 'Select Scorer';
  document.getElementById('selectedAssist').textContent = 'Select Assist';
}

function recordGoal() {
  if (!selectedScorer || !selectedAssist) return;
  
  const timestamp = document.getElementById('stopwatch').textContent;
  const goalData = {
    timestamp,
    scorerId: selectedScorer.id,
    scorerName: selectedScorer.name,
    scorerNumber: selectedScorer.number,
    assistId: selectedAssist.id,
    assistName: selectedAssist.name,
    assistNumber: selectedAssist.number,
    id: Date.now()
  };
  
  // Update stats
  selectedScorer.goals++;
  selectedAssist.assists++;
  
  // Save data
  data.push(goalData);
  saveData();
  saveRoster();
  
  // Update UI
  updateRosterUI();
  updateGoalsLog();
  
  // Reset selection
  clearSelectedPlayers();
  document.getElementById('goalActions').classList.add('hidden');
  
  // Show confirmation
  showToast(`Goal! ${selectedScorer.name} (${selectedAssist.name})`);
  
  // Switch to goals tab
  document.querySelector('[data-tab="goals"]').click();
}

function updateGoalsLog() {
  const log = document.getElementById('log');
  log.innerHTML = data.map(goal => `
    <div class="goal-entry">
      <div class="goal-time">${goal.timestamp}</div>
      <div class="goal-details">
        <div class="goal-scorer">⚽ #${goal.scorerNumber} ${goal.scorerName}</div>
        <div class="goal-assist">👟 #${goal.assistNumber} ${goal.assistName}</div>
      </div>
      <button class="delete-btn" onclick="deleteGoal(${goal.id})">×</button>
    </div>
  `).join('');
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// Save/load functions
function saveRoster() {
  localStorage.setItem('roster', JSON.stringify(roster));
}

function saveData() {
  localStorage.setItem('gameData', JSON.stringify({
    data,
    seconds,
    lastUpdated: new Date().toISOString()
  }));
}

// Initialize
createMobileUI();