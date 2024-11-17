const startButton = document.getElementById('startButton');
const nameSelect = document.getElementById('nameSelect');
const assistantNameInput = document.getElementById('assistantName');
const resetButton = document.getElementById('resetButton');
const log = document.getElementById('log');

let data = [];

startButton.addEventListener('click', () => {
    const timestamp = new Date().toISOString();
    const name = nameSelect.value;
    const assistantName = assistantNameInput.value;
    data.push({ timestamp, name, assistantName });
    updateLog();
});

resetButton.addEventListener('click', () => {
    data = [];
    updateLog();
});

function updateLog() {
    log.innerHTML = '';
    data.forEach(entry => {
        const { timestamp, name, assistantName } = entry;
        const logEntry = `${timestamp}: ${name}`;
        if (assistantName) {
            logEntry += ` - Assistant: ${assistantName}`;
        }
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
