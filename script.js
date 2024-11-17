const goalButton = document.getElementById('goalButton');
const goalScorer = document.getElementById('goalScorer');
const goalAssist = document.getElementById('goalAssist');
const resetButton = document.getElementById('resetButton');
const log = document.getElementById('log');

let data = [];

goalButton.addEventListener('click', () => {
  const timestamp = new Date().toISOString();
  const goalScorerName = goalScorer.value;
  const goalAssistName = goalAssist.value;

  // Input validation
  if (goalScorerName.trim() !== '' && goalAssistName.trim() !== '') {
    data.push({ timestamp, goalScorerName, goalAssistName });
    updateLog();
    goalScorer.value = '';
    goalAssist.value = '';
  } else {
    alert('Please enter both goal scorer and goal assist names.');
  }
});

resetButton.addEventListener('click', () => {
  data = [];
  updateLog();
});

function updateLog() {
  log.innerHTML = '';
  data.forEach(entry => {
    const { timestamp, goalScorerName, goalAssistName } = entry;
    const logEntry = `${timestamp}: ${goalScorerName} - ${goalAssistName}`;
    log.innerHTML += `<p>${logEntry}</p>`;
  });
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
