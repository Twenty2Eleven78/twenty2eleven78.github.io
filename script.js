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
    data.push({ timestamp, goalScorerName, goalAssistName });
    updateLog();
});

resetButton.addEventListener('click', () => {
    data = [];
    updateLog();
});

function updateLog() {
    log.innerHTML = '';
    data.forEach(entry => {
        const { timestamp, goalScorerName, goalAssistName } = entry;
        const logEntry = `${timestamp}: ${goalScorerName}`${goalAssistName};
        log.innerHTML += `<p>${logEntry}</p>`;
    });
}

// Persist data to local storage
localStorage.setItem('timeTrackerData', JSON.stringify(data));

// Retrieve data from local storage on page load
const storedData = localStorage.getItem('timeTrackerData');
if (storedData) {
    data = JSON.parse(storedData);
    updateLog();
}
