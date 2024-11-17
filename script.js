// State management
const STATE = {
  seconds: 0,
  isRunning: false,
  intervalId: null,
  data: [],
  startTime: null,
  lastTickTime: null
};

// DOM Elements
const elements = {
  stopwatch: document.getElementById('stopwatch'),
  startPauseButton: document.getElementById('startPauseButton'),
  goalButton: document.getElementById('goalButton'),
  goalScorer: document.getElementById('goalScorer'),
  goalAssist: document.getElementById('goalAssist'),
  resetButton: document.getElementById('resetButton'),
  log: document.getElementById('log'),
  goalForm: document.getElementById('goalForm')
};

// Constants
const STORAGE_KEYS = {
  TIME: 'goalTracker_time',
  GOALS: 'goalTracker_goals',
  IS_RUNNING: 'goalTracker_isRunning',
  START_TIME: 'goalTracker_startTime',
  LAST_TICK: 'goalTracker_lastTick'
};

// Local Storage utilities
const Storage = {
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to localStorage:`, error);
    }
  },
  
  load(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error loading from localStorage:`, error);
      return defaultValue;
    }
  },
  
  clear() {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
};

// Time formatting utility
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [hours, minutes, secs]
    .map(num => num.toString().padStart(2, '0'))
    .join(':');
}

// Stopwatch controls
function updateStopwatchDisplay() {
  elements.stopwatch.textContent = formatTime(STATE.seconds);
  Storage.save(STORAGE_KEYS.TIME, STATE.seconds);
}

function updateTime() {
  if (!STATE.isRunning) return;
  
  const now = Date.now();
  if (STATE.lastTickTime) {
    const elapsed = Math.floor((now - STATE.lastTickTime) / 1000);
    if (elapsed >= 1) {
      STATE.seconds += elapsed;
      STATE.lastTickTime = now;
      updateStopwatchDisplay();
      Storage.save(STORAGE_KEYS.LAST_TICK, now);
    }
  } else {
    STATE.lastTickTime = now;
    Storage.save(STORAGE_KEYS.LAST_TICK, now);
  }
}

function startStopwatch() {
  if (!STATE.isRunning) {
    STATE.isRunning = true;
    STATE.startTime = STATE.startTime || Date.now();
    STATE.lastTickTime = Date.now();
    STATE.intervalId = setInterval(updateTime, 100); // More frequent updates for accuracy
    Storage.save(STORAGE_KEYS.START_TIME, STATE.startTime);
    Storage.save(STORAGE_KEYS.LAST_TICK, STATE.lastTickTime);
  } else {
    clearInterval(STATE.intervalId);
    STATE.isRunning = false;
    STATE.lastTickTime = null;
    Storage.save(STORAGE_KEYS.LAST_TICK, null);
  }
  
  elements.startPauseButton.textContent = STATE.isRunning ? "Pause" : "Start";
  Storage.save(STORAGE_KEYS.IS_RUNNING, STATE.isRunning);
}

// Goal tracking
function addGoal(event) {
  event.preventDefault();
  
  const goalScorerName = elements.goalScorer.value;
  const goalAssistName = elements.goalAssist.value;
  
  if (!goalScorerName || !goalAssistName) {
    M.toast({html: 'Please select both scorer and assistant'});
    return;
  }
  
  const goalData = {
    timestamp: formatTime(STATE.seconds),
    goalScorerName,
    goalAssistName,
    rawTime: STATE.seconds
  };
  
  STATE.data.push(goalData);
  updateLog();
  Storage.save(STORAGE_KEYS.GOALS, STATE.data);
  
  // Reset form and update Materialize select
  elements.goalForm.reset();
  M.FormSelect.init(elements.goalScorer);
  M.FormSelect.init(elements.goalAssist);
}

function updateLog() {
  elements.log.innerHTML = STATE.data
    .sort((a, b) => a.rawTime - b.rawTime)
    .map(({ timestamp, goalScorerName, goalAssistName }) => 
      `<div class="card-panel">
        <span class="blue-text text-darken-2">${timestamp}</span>: 
        <strong>Goal:</strong> ${goalScorerName}, 
        <strong>Assist:</strong> ${goalAssistName}
       </div>`
    )
    .join('');
}

function resetTracker() {
  if (!confirm('Are you sure you want to reset the stopwatch and log data?')) {
    return;
  }
  
  // Reset state
  clearInterval(STATE.intervalId);
  STATE.seconds = 0;
  STATE.isRunning = false;
  STATE.data = [];
  STATE.startTime = null;
  STATE.lastTickTime = null;
  
  // Reset UI
  updateStopwatchDisplay();
  updateLog();
  elements.startPauseButton.textContent = "Start";
  
  // Clear storage
  Storage.clear();
}

// Initialize application
function initializeApp() {
  // Load saved data
  STATE.seconds = Storage.load(STORAGE_KEYS.TIME, 0);
  STATE.data = Storage.load(STORAGE_KEYS.GOALS, []);
  STATE.isRunning = Storage.load(STORAGE_KEYS.IS_RUNNING, false);
  STATE.startTime = Storage.load(STORAGE_KEYS.START_TIME, null);
  STATE.lastTickTime = Storage.load(STORAGE_KEYS.LAST_TICK, null);
  
  // Update UI with saved data
  updateStopwatchDisplay();
  updateLog();
  
  // If the timer was running when the page was closed/refreshed
  if (STATE.isRunning && STATE.lastTickTime) {
    const now = Date.now();
    const elapsed = Math.floor((now - STATE.lastTickTime) / 1000);
    if (elapsed > 0) {
      STATE.seconds += elapsed;
      updateStopwatchDisplay();
    }
    startStopwatch(); // Restart the timer
  }
  
  // Initialize Materialize components
  M.FormSelect.init(document.querySelectorAll('select'));
}

// Event Listeners
elements.startPauseButton.addEventListener('click', startStopwatch);
elements.goalForm.addEventListener('submit', addGoal);
elements.resetButton.addEventListener('click', resetTracker);
document.addEventListener('DOMContentLoaded', initializeApp);

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (STATE.isRunning) {
      clearInterval(STATE.intervalId); // Clear the interval but keep the state running
      Storage.save(STORAGE_KEYS.LAST_TICK, Date.now());
    }
  } else {
    if (STATE.isRunning) {
      const now = Date.now();
      const lastTick = Storage.load(STORAGE_KEYS.LAST_TICK);
      if (lastTick) {
        const elapsed = Math.floor((now - lastTick) / 1000);
        STATE.seconds += elapsed;
        updateStopwatchDisplay();
      }
      STATE.lastTickTime = now;
      STATE.intervalId = setInterval(updateTime, 100);
      Storage.save(STORAGE_KEYS.LAST_TICK, now);
    }
  }
});

// Backup interval for longer running times
setInterval(() => {
  if (STATE.isRunning) {
    Storage.save(STORAGE_KEYS.TIME, STATE.seconds);
  }
}, 1000);