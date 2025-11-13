const socket = io();

const scoreA = document.getElementById('scoreA');
const scoreB = document.getElementById('scoreB');
const mainWord = document.getElementById('mainWord');
const forbiddenWordsDiv = document.getElementById('forbiddenWords');
const currentTurnDisplay = document.getElementById('currentTurnDisplay');

// Buton Aksiyonları
function sendAction(type) {
    // type: 'correct', 'taboo', 'pass'
    socket.emit(`action_${type}`);
}

function switchTeam() {
    socket.emit('switch_team');
}

// Sunucudan Güncelleme Geldiğinde
socket.on('updateGame', (state) => {
    // Skorları Güncelle
    scoreA.innerText = state.scores.teamA;
    scoreB.innerText = state.scores.teamB;

    // Sıra Kimde Güncelle
    if(state.turnTeam === 'teamA') {
        currentTurnDisplay.innerText = "TAKIM A";
        currentTurnDisplay.style.color = "#3498db";
    } else {
        currentTurnDisplay.innerText = "TAKIM B";
        currentTurnDisplay.style.color = "#e67e22";
    }

    // Kartı Güncelle
    if (state.currentCard) {
        mainWord.innerText = state.currentCard.word;
        forbiddenWordsDiv.innerHTML = "";
        state.currentCard.forbidden.forEach(word => {
            const p = document.createElement('p');
            p.innerText = word;
            forbiddenWordsDiv.appendChild(p);
        });
    }
});