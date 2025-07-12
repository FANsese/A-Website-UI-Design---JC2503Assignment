const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Game state storage
const players = new Map(); //Construction:  {name, inGame: false}
const games = new Map(); //Construction:  {players: [id1, id2], questions, scores, currentQuestion}


// Questions
const questions = [
    {
        question: "<h2>What animal is this?</h2><br><img src='images/quizImage/camel.jpg' alt='c' >",
        options: ["LiliLalila", "Camel", "Horse", "Donkey"],
        answer: 1
    },
    {
        question: "<h2>What animal is this?</h2><br><img src='images/quizImage/parrots.jpg' alt='p' >",
        options: ["Bird", "Parrot", "Yello Bird"],
        answer: 1
    },
    {
        question: "<h2>What animal is this?</h2><br><img src='images/quizImage/rabbit.jpg' alt='r' >",
        options: ["Cat", "Dog", "Rabbit", "Mouse"],
        answer: 1
    },
    {
        question: "<h2>What breed is this dog?</h2><br><img src='images/quizImage/alaskan.jpg' alt='dog' >",
        options: ["Golden Retriever", "Alaskan Malamute", "Samoyed", "Husky"],
        answer: 1
    },
    {
        question: "<h2>What animal are these?</h2><br><img src='images/quizImage/ducks.jpg' alt='d' >",
        options: ["Duck", "Ducks", "Rabbit", "sally"],
        answer: 1
    },
    {
        question: "<h2>What breed is this cat?</h2><br><img src='images/quizImage/golden-shaded cat.jpg' alt='r' >",
        options: ["Cat", "Ragdoll", "Golden-shaded", "Chinese Li-hua"],
        answer: 2
    },
    {
        question: "<h2>What animal is this?</h2><br><img src='images/quizImage/panda.jpg' alt='p' >",
        options: ["Bear", "Panda"],
        answer: 1
    },
    {
        question: "<h2>What animal are these?</h2><br><img src='images/quizImage/sheeps.jpg' alt='s' >",
        options: ["Goats", "Sheeps", "Goat", "Sheep"],
        answer: 3
    },
];

// Randomly choose questions
function getRandomQuestions(count = 5) {
    // This will create a copy and shuffle the order
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    
    // Take the first question of count, which is 5
    return shuffled.slice(0, count).filter(q => 
        q && 
        q.question && 
        q.options && 
        Array.isArray(q.options) && 
        q.options.length > 0 &&
        Number.isInteger(q.answer) &&
        q.answer >= 0 &&
        q.answer < q.options.length
    );
}



// Here to contain the whole logic of quiz's backend
io.on('connection', (socket) => {
    console.log('a user connected');


    // New player handling
    socket.on('register', (name) => {
        players.set(socket.id, { name, inGame: false });
        updateOnlinePlayers();
    });


    // Start a challenge
    socket.on('challenge', (targetId) => {
        const challenger = players.get(socket.id);
        const target = players.get(targetId);
        
        if (target && !target.inGame) {
            // Here to create a temporary game record
            const gameId = `${socket.id}-${targetId}`;
            games.set(gameId, { 
                players: [socket.id, targetId],
                questions: [],
                scores: [0, 0],
                currentQuestion: 0
            });
            
            io.to(targetId).emit('challenge-received', {
                from: socket.id,
                gameId: gameId, 
                name: challenger.name
            });
        }
    });


    // Challenge response
    socket.on('challenge-response', ({ gameId, accepted }) => {
        console.log('Received challenge response:', gameId, accepted);
        if (accepted) {
            const game = games.get(gameId);
            if (!game) {
                console.error('Invalid game ID:', gameId);
                return;
            }
            
            game.players.forEach(id => {
                const player = players.get(id);
                if (player) player.inGame = true;
            });
            
            startGame(gameId);
        }
    });


    // Handling answer of players
    socket.on('answer', ({ gameId, answerIndex }) => {
        const game = games.get(gameId);
        if (!game || !game.questions?.length) {
            console.error('Invalid game state:', gameId);
            return;
        }

        if (game.currentQuestion >= game.questions.length) {
            console.error('Question index out of bounds');
            return;
        }

        const currentQ = game.questions[game.currentQuestion];
        if (!currentQ?.options || !currentQ.answer) {
            console.error('Invalid question format');
            return;
        }
        
        // Check the answerIndex is valid for sure
        if (typeof answerIndex !== 'number' || isNaN(answerIndex)) {
            console.error('Invalid answer index:', answerIndex);
            return;
        }
        
        // Ensure answerIndex is in the correct range
        if (answerIndex < 0 || answerIndex >= currentQ.options.length) {
            console.error('Answer index out of range:', answerIndex);
            return;
        }

        // Count scores
        const isCorrect = answerIndex === currentQ.answer;
        const playerIndex = game.players.indexOf(socket.id);
        const opponentIndex = 1 - playerIndex;
        
        if (isCorrect) {
            game.scores[playerIndex] += 2;
        } else {
            game.scores[opponentIndex] += 1;
        }

        // Show the result
        io.to(gameId).emit('round-result', {
            scores: game.scores,
            correctAnswer: currentQ.answer,
            playerIndex,
            opponentIndex
        });

        // Get into next question
        setTimeout(() => {
            game.currentQuestion++;
            if (game.currentQuestion < game.questions.length) {
                sendQuestion(gameId);
            } else {
                endGame(gameId);
            }
        }, 5000);
    });


    // Handling disconnections
    socket.on('disconnect', () => {
        players.delete(socket.id);
        updateOnlinePlayers();
    });


    function updateOnlinePlayers() {
        const online = Array.from(players.entries())
            .filter(([id, p]) => !p.inGame)
            .map(([id, p]) => ({ id, name: p.name, inGame: p.inGame }));
        io.emit('players-update', online);
    }


    function startGame(gameId) {
        console.log('Attempting to start game:', gameId);
        const game = games.get(gameId);
        if (!game) {
            console.error('Game not found:', gameId);
            return;
        }
        
        // Veryfing questions
        game.questions = getRandomQuestions();
        console.log('Loaded questions:', game.questions);
        
        if (game.questions.length === 0) {
            console.error('No questions for game:', gameId);
            return;
        }
        
        // Enter the room
        game.players.forEach(id => {
            const playerSocket = io.sockets.sockets.get(id);
            if (playerSocket) {
                playerSocket.join(gameId);
                console.log(`Player ${id} joined room ${gameId}`);
                playerSocket.emit('game-started', gameId);
            }
        });
        
        sendQuestion(gameId);
    }


    function sendQuestion(gameId) {
        const game = games.get(gameId);
        if (!game || !game.questions || game.currentQuestion < 0 || game.currentQuestion >= game.questions.length) {
            console.error('Invalid game state in sendQuestion');
            return;
        }
        
        const question = game.questions[game.currentQuestion];
        io.to(gameId).emit('new-question', {
            question: question.question,
            options: question.options,
            questionNumber: game.currentQuestion + 1
        });
    }


    function endGame(gameId) {
        const game = games.get(gameId);
        game.players.forEach(id => {
            const playerIndex = game.players.indexOf(id);
            const opponentIndex = 1 - playerIndex;
            
            const playerSocket = io.sockets.sockets.get(id);
            if (playerSocket) {
                playerSocket.emit('game-end', {
                    scores: game.scores,
                    playerIndex,
                    opponentIndex
                });
                playerSocket.leave(gameId);
            }
            
            const player = players.get(id);
            if (player) player.inGame = false;
        });
        
        // Update list here (after game)
        updateOnlinePlayers();
        games.delete(gameId);
    }
});




server.listen(3000, () => {
    console.log('listening on *:3000');
});