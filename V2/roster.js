// Roster Management Module
const RosterManager = (function() {
  // Private variables
  const STORAGE_KEY = 'goalTracker_roster';
  let roster = [];

  // Private methods
  function saveRoster() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(roster));
    } catch (error) {
      console.error('Error saving roster:', error);
    }
  }

  function loadRoster() {
    try {
      const savedRoster = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return savedRoster && savedRoster.length ? savedRoster : getDefaultRoster();
    } catch (error) {
      console.error('Error loading roster:', error);
      return getDefaultRoster();
    }
  }

  function getDefaultRoster() {
    return [
      'A.Seaman', 'A-R.Obidi', 'D.Peacock', 'E.Doyle', 'E.Van-Kerro',
      'E.Mutiti', 'F.Asadi', 'F.Kendall', 'H.Strowthers', 'M.Finch',
      'M.Luttwak', 'R.Azar', 'S.Smith', 'T.Rushmer', 'V.Aig-Imoru'
    ];
  }

  // Public interface
  return {
    // Initialize roster
    init() {
      roster = loadRoster();
      this.updateUI();
      this.bindEvents();
    },

    // Get current roster
    getRoster() {
      return [...roster];
    },

    // Add a new player
    addPlayer(name) {
      if (!name) return false;
      
      // Trim and validate name
      const trimmedName = name.trim();
      if (!trimmedName) return false;

      // Check for duplicates
      if (roster.includes(trimmedName)) {
        M.toast({html: 'Player already exists!'});
        return false;
      }

      // Add player and sort
      roster.push(trimmedName);
      roster.sort();
      saveRoster();
      this.updateUI();
      return true;
    },

    // Remove a player
    removePlayer(name) {
      const index = roster.indexOf(name);
      if (index > -1) {
        roster.splice(index, 1);
        saveRoster();
        this.updateUI();
        return true;
      }
      return false;
    },

    // Update UI elements
    updateUI() {
      // Update player select dropdowns
      const goalScorerSelect = document.getElementById('goalScorer');
      const goalAssistSelect = document.getElementById('goalAssist');
      
      if (goalScorerSelect && goalAssistSelect) {
        // Preserve current selections if possible
        const currentGoalScorer = goalScorerSelect.value;
        const currentGoalAssist = goalAssistSelect.value;

        // Clear existing options
        goalScorerSelect.innerHTML = '<option value="">Select goal scorer</option>';
        goalAssistSelect.innerHTML = '<option value="">Select goal assist</option>';
        goalAssistSelect.innerHTML += '<option value="N/A">N/A</option>';

        // Add roster options
        roster.forEach(player => {
          goalScorerSelect.innerHTML += `<option value="${player}">${player}</option>`;
          goalAssistSelect.innerHTML += `<option value="${player}">${player}</option>`;
        });

        // Attempt to restore previous selections
        if (currentGoalScorer && roster.includes(currentGoalScorer)) {
          goalScorerSelect.value = currentGoalScorer;
        }
        if (currentGoalAssist && (currentGoalAssist === 'N/A' || roster.includes(currentGoalAssist))) {
          goalAssistSelect.value = currentGoalAssist;
        }

        // Reinitialize Materialize selects
        M.FormSelect.init(goalScorerSelect);
        M.FormSelect.init(goalAssistSelect);
      }

      // Update roster list in modal
      const rosterList = document.getElementById('rosterList');
      if (rosterList) {
        rosterList.innerHTML = roster
          .map(player => `
            <tr>
              <td>${player}</td>
              <td>
                <button class="btn-small red waves-effect waves-light remove-player" 
                        data-player="${player}">
                  Remove
                </button>
              </td>
            </tr>
          `)
          .join('');
      }
    },

    // Bind event listeners
    bindEvents() {
      const addPlayerBtn = document.getElementById('addPlayerBtn');
      const newPlayerInput = document.getElementById('newPlayerName');
      const rosterList = document.getElementById('rosterList');

      if (addPlayerBtn && newPlayerInput) {
        // Add player on button click
        addPlayerBtn.addEventListener('click', () => {
          const playerName = newPlayerInput.value.trim();
          if (this.addPlayer(playerName)) {
            newPlayerInput.value = '';
          }
        });

        // Add player on Enter key
        newPlayerInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            const playerName = newPlayerInput.value.trim();
            if (this.addPlayer(playerName)) {
              newPlayerInput.value = '';
            }
          }
        });
      }

      // Delegate remove player event
      if (rosterList) {
        rosterList.addEventListener('click', (e) => {
          if (e.target.classList.contains('remove-player')) {
            const playerToRemove = e.target.getAttribute('data-player');
            this.removePlayer(playerToRemove);
          }
        });
      }

      // Open roster modal button
      const openRosterModalBtn = document.getElementById('openRosterModalBtn');
      if (openRosterModalBtn) {
        openRosterModalBtn.addEventListener('click', () => {
          const rosterModal = M.Modal.getInstance(document.getElementById('rosterModal'));
          rosterModal.open();
        });
      }
    }
  };
})();
