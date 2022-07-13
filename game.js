class Game {
  constructor(id, player1Socket, player2Socket) {
    this.id = id;
    this.players = [player1Socket.player, player2Socket.player];
    this.player1Socket = player1Socket;
    this.player2Socket = player2Socket;

    this.gridValues = Array.from({ length: 9 });
    this.hasWinner = false;
    this.gameOver = false;
    this.winnerIdx = null;
  }

  send(message, player = "ALL") {
    if (player === 1 || player === "ALL") {
      this.player1Socket.send(JSON.stringify(message));
    }
    if (player === 2 || player === "ALL") {
      this.player2Socket.send(JSON.stringify(message));
    }
  }

  getPlayers() {
    this.send({
        players:this.players,
        message: 'GAME'
    });
  }

  start() {
    this.send(
      {
        player: 1,
        message: "START",
      },
      1
    );
  }

  redirect() {
    this.send(
      {
        player: 2,
        message: "REDIRECT",
      },
      2
    );
  }

  play(gridIdx, player) {
    this.gridletters[gridIdx] = letter;

    this.send({
      player,
      gridIdx,
      letter: player === 1 ? "X" : "O",
      message: "PLAYED",
    });

    this.getWinner();
    this.checkGridFull();

    if (this.gameOver) {
      this.send({
        gameOver: this.gameOver,
        hasWinner: this.hasWinner,
        winner: this.hasWinner ? this.players[this.winnerIdx] : null,
      });
      return;
    }
  }

  checkGridFull() {
    for (let i = 0; i < this.gridValues.length; i++) {
      if (!this.gridValues[i]) {
        this.gameOver = true;
      }
    }
  }

  checkWin(letter) {
    const winNumbers = [
      [0, 1, 2],
      [1, 4, 7],
      [3, 4, 5],
      [0, 4, 8],
      [2, 4, 6],
      [6, 7, 8],
      [0, 3, 6],
      [2, 5, 8],
    ];

    for (let i = 0; i < winNumbers.length; i++) {
      if (
        this.gridValues[winNumbers[i][0]] === letter &&
        this.gridValues[winNumbers[i][1]] === letter &&
        this.gridValues[winNumbers[i][2]] === letter
      ) {
        return true;
      }
    }

    return false;
  }
  getWinner() {
    for (let i = 0; i < 2; i++) {
      const letter = i === 1 ? "X" : "O";
      if (this.checkWin(letter)) {
        (this.hasWinner = true), (this.winnerIdx = i);
        this.gameOver = true;
      }
    }
  }
}

// store player 1s in Array, look for match with player 2
// if match create game
// on start click send redirect
// on redirect start stop loading

module.exports = {
  Game,
};
