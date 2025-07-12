const socket = io();


let currentGameId = null;   
let myPlayerIndex = null;   


function register() {
    const name = document.getElementById('nameInput').value;
    if (!name.trim()) {
        alert('Please enter your name');
        return;
    }
    
    socket.emit('register', name);
   
    document.getElementById('login').style.display = 'none';
    document.getElementById('lobby').style.display = 'block';
}


socket.on('players-update', (players) => {
    console.log('Received players update:', players);
    const list = document.getElementById('playersList');
    

    const availablePlayers = players
        .filter(p => p.id !== socket.id && !p.inGame);
    

    list.innerHTML = availablePlayers.length > 0
        ? availablePlayers.map(p => `
            <div class="player-item">
                ${p.name}
                <button onclick="challenge('${p.id}')">Challenge</button>
            </div>
        `).join('')
        : '<p>No other players available</p>';
});


function challenge(targetId) {
    socket.emit('challenge', targetId);
}


socket.on('challenge-received', ({ from, gameId, name }) => {
    if (confirm(`${name} challenges you! Accept?`)) {
        currentGameId = gameId;
        socket.emit('challenge-response', { 
            challengerId: from, 
            gameId: gameId,
            accepted: true 
        });
        
        document.getElementById('lobby').style.display = 'none';
        document.getElementById('game').style.display = 'block';
    }
});


socket.on('game-started', (gameId) => {
    currentGameId = gameId;
    
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('game').style.display = 'block';
});


socket.on('new-question', (data) => {
    console.log('Received new question:', data);
    

    const questionText = document.getElementById('questionText');
    questionText.innerHTML = `Question ${data.questionNumber}: ${data.question}`;
   
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = data.options.map((opt, i) => 
        `<button onclick="submitAnswer(${i})">${opt}</button>`
    ).join('');
    
    document.getElementById('scores').innerHTML = '';
});


function submitAnswer(answerIndex) {
    if (currentGameId) {
        socket.emit('answer', { gameId: currentGameId, answerIndex });
    }
}


socket.on('round-result', ({ scores, correctAnswer, playerIndex, opponentIndex }) => {
    const yourScore = scores[playerIndex];
    const opponentScore = scores[opponentIndex];
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = `Correct answer: ${correctAnswer}`;
   
    const scoresElement = document.getElementById('scores');
    scoresElement.innerHTML = `<div class="content-card">Your score: ${yourScore} | Opponent: ${opponentScore}</div>`;
});


socket.on('game-end', ({ scores, playerIndex, opponentIndex }) => {
    const yourScore = scores[playerIndex];
    const opponentScore = scores[opponentIndex];
    
    let message;
    if (yourScore > opponentScore) {
        message = `You won! Final scores - You: ${yourScore}, Opponent: ${opponentScore}`;
    } else if (yourScore < opponentScore) {
        message = `You lost! Final scores - You: ${yourScore}, Opponent: ${opponentScore}`;
    } else {
        message = `It's a tie! Final scores - You: ${yourScore}, Opponent: ${opponentScore}`;
    }
    
    alert(message);
    document.getElementById('game').style.display = 'none';
    document.getElementById('lobby').style.display = 'block';
});


socket.on('connect', () => console.log('Connected to server'));
socket.on('disconnect', () => console.log('Disconnected from server'));
socket.on('connect_error', (err) => console.error('Connection error:', err));