function GameBoard() {
    const board = [];
    for(let i = 0;i<3;i++) {
        board[i]=[];
        for(let j = 0;j<3;j++) {
            board[i].push(Cell());
        }
    }

    const play = (x, y, val) => {
        if(x<0 || y<0 || board.length<=x || board.length<=y) return;
        board[y][x].setValue(val);
    }

    const isValidMove = (x, y) => {
        return !board[y][x].getValue();
    }

    const isWinningMove = (x, y, val) => {
        if(x<0 || y<0) return false;
        verticalCheck = true;
        horizontalCheck = true;
        diagonalCheck = false;
        for(let i =0;i<3;i++) {
            if(board[y][i].getValue()!==val){
                verticalCheck=false;
                break;
            }
        }
        for(let i =0;i<3;i++) {
            if(board[i][x].getValue()!==val){
                horizontalCheck=false;
                break;
            }
        }
        if((parseInt(x)+parseInt(y)) === 2) diagonalCheck = ((board[0][2].getValue() === board[1][1].getValue()) &&
            (board[2][0].getValue() === board[1][1].getValue()));
        if((x===y) && !diagonalCheck) diagonalCheck = (board[0][0].getValue() === board[1][1].getValue() &&
            board[1][1].getValue() === board[2][2].getValue());
        return horizontalCheck || verticalCheck || diagonalCheck;
    }

    const isDraw = () => {
        for(let i=0;i<3;i++) {
            for(let j=0;j<3;j++) {
                if(board[i][j].getValue()===0) return false;
            }
        }
        return true;
    }

    const reset = () => {
        for(let i=0;i<3;i++) {
            for(let j =0;j<3;j++) {
                board[i][j].setValue(0);
            }
        }
    }

    const getCellAt = (x, y) => {
        if(x<0 || y<0 || board.length<=x || board.length<=y) return null;
        return board[y][x];
    };

    return {play, isDraw, isWinningMove, reset, getCellAt, isValidMove};
}

function Cell() {
    let value = 0;
    const getValue = () => value;
    const setValue = (val) => value = Math.abs(val%3);
    return {getValue, setValue};
}

function GameController(player1 = "Player One", player2 = "Player Two", doc) {
    const board = GameBoard();
    const view = GameView(doc, board);

    const players = [
        {
            name : player1,
            val : 1,
            wins : 0
        },
        {
            name : player2,
            val : 2,
            wins : 0
        }
    ]

    let activePlayer = 0;
    let roundCount = 0;

    const getActivePlayer = () => players[activePlayer];

    const switchActivePlayer = () => activePlayer = (activePlayer + 1)%2;

    const getWinner = () => {
        if(players[0].wins>players[1].wins) return players[0];
        else if(players[1].wins>players[0].wins) return players[1];
        else return null;
    }

    const playTurn = (x, y) => {
        const currentPlayer = getActivePlayer();
        if(!board.isValidMove(x, y)) return;
        board.play(x, y, currentPlayer.val);
        if(board.isWinningMove(x, y, currentPlayer.val)) currentPlayer.wins++, startNewRound();// winning message
        else if(board.isDraw()) startNewRound();// Draw message;
        switchActivePlayer();
        view.updateCurrentPlayer(getActivePlayer().name);
        view.updateScores(players[0], players[1]);
    }

    const startNewRound = () => {
        board.reset();
        roundCount++;
    }

    const clickHandler = (e) => {
        const x = e.target.dataset.x;
        const y = e.target.dataset.y;
        if(!x || !y) return;

        playTurn(x, y);
        view.updateBoard();
        if(roundCount>=3) {
            if(getWinner()!==null) view.displayWinner(getWinner().name);
            else view.displayWinner("Nobody");
        }
    };

    doc.addEventListener('click', (e) => {
        if(e.target.id ==="restart") playGame();
        else clickHandler(e);
    });


    const playGame = () => {
        players[0].wins = 0;
        players[1].wins = 0;
        roundCount = 0;
        board.reset();
        view.resetWinnerDisplay();
        view.updateBoard();
        view.updateScores(players[0],players[1]);
        view.updateCurrentPlayer(players[0].name);
    }

    return {playGame};
}

function GameView(doc, board) {
    const boardDiv = doc.querySelector(".board");
    const player1NameDiv = doc.querySelector(".player1-name");
    const player2NameDiv = doc.querySelector(".player2-name");
    const player1ScoreDiv = doc.querySelector(".player1-score");
    const player2ScoreDiv = doc.querySelector(".player2-score");
    const winningMessageDiv = doc.querySelector(".winning-message");
    const currentPlayerDiv = doc.querySelector(".current-player");

    const updateBoard = () => {
        boardDiv.textContent = "";
        for(let i =0;i<3;i++) {
            for(let j=0;j<3;j++) {
                const cellDiv = doc.createElement("button");
                cellDiv.classList.add("cell");
                cellDiv.dataset.x=j;
                cellDiv.dataset.y=i;
                cellDiv.textContent = valToSymbol(board.getCellAt(j, i).getValue());
                boardDiv.appendChild(cellDiv);
            }
        }
    }

    const valToSymbol = (val) => {
        switch(val) {
            case 1: return "X";
            case 2: return "O";
            default: return "";
        }
    }

    const updateScores = (player1, player2) => {
        player1NameDiv.textContent = `${player1.name}`;
        player2NameDiv.textContent = `${player2.name}`;
        player1ScoreDiv.textContent = `${player1.wins}`;
        player2ScoreDiv.textContent = `${player2.wins}`;
    }

    const displayWinner = (winner) => {
        winningMessageDiv.textContent = `Good Job ${winner}`;
        winningMessageDiv.style.visibility = "visible";
    }

    const resetWinnerDisplay = () => {
        winningMessageDiv.style.visibility ="hidden";
    }

    const updateCurrentPlayer = (current) => {
        currentPlayerDiv.textContent = `Current player : ${current}`;
    }

    return {displayWinner, updateScores, updateBoard, updateCurrentPlayer, resetWinnerDisplay};
}

const game = GameController("Cimeau", "Zitro", document);
game.playGame();
