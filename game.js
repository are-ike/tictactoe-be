const {
  START,
  REDIRECT,
  GAME,
  PLAYED,
  NEWGAME,
  NEWGAME_ACCEPT,
  REDIRECT_ENDGAME,
  REDIRECT_NEWGAME,
} = require("./messages");
const letters = {
  1: "X",
  2: "O",
};

class WaitingRoom {
  constructor(id, player1Socket, player2Socket) {
    this.id = id;
    this.players = [player1Socket.player, player2Socket.player];
    this.player1Socket = player1Socket;
    this.player2Socket = player2Socket;
  }

  send(message, player = "ALL") {
    if (player === 1 || player === "ALL") {
      this.player1Socket.send(JSON.stringify(message));
    }
    if (player === 2 || player === "ALL") {
      this.player2Socket.send(JSON.stringify(message));
    }
  }

  start() {
    this.send(
      {
        player: 1,
        message: START,
      },
      1
    );
  }

  redirect() {
    this.send(
      {
        player: 2,
        message: REDIRECT,
      },
      2
    );
  }
}

class Game extends WaitingRoom {
  constructor(id, player1Socket, player2Socket) {
    super(id, player1Socket, player2Socket);
    this.gridValues = Array.from({ length: 9 });
    this.hasWinner = false;
    this.gameOver = false;
    this.winner = null;
    this.winningIdxs = [];
  }

  getPlayers() {
    this.send({
      players: this.players,
      message: GAME,
    });
  }

  play(gridIdx, playerNo) {
    this.gridValues[gridIdx] = letters[playerNo];
    this.checkGridFull();
    this.getWinner();

    this.send({
      playerNo,
      gridValues: this.gridValues,
      winningIdxs: this.winningIdxs,
      gameOver: this.gameOver,
      hasWinner: this.hasWinner,
      winner: this.hasWinner ? this.winner : null,
      message: PLAYED,
    });
  }

  checkGridFull() {
    for (let i = 0; i < this.gridValues.length; i++) {
      if (!this.gridValues[i]) {
        return;
      }
    }
    this.gameOver = true;
  }

  checkWin(letter) {
    const winNumbers = [
      [0, 1, 2],
      [0, 3, 6],
      [0, 4, 8],
      [1, 4, 7],
      [2, 4, 6],
      [2, 5, 8],
      [3, 4, 5],
      [6, 7, 8],
    ];

    for (let i = 0; i < winNumbers.length; i++) {
      if (
        this.gridValues[winNumbers[i][0]] === letter &&
        this.gridValues[winNumbers[i][1]] === letter &&
        this.gridValues[winNumbers[i][2]] === letter
      ) {
        this.hasWinner = true;
        this.winningIdxs = winNumbers[i];
      }
    }
  }

  getWinner() {
    for (let i = 0; i < 2; i++) {
      const playerNo = i + 1;
      const letter = letters[playerNo];

      this.checkWin(letter);

      if (this.hasWinner) {
        this.winner = playerNo;
        this.gameOver = true;
        return;
      }
    }
  }

  newGame(playerNo) {
    this.send({ playerNo, message: NEWGAME }, playerNo);
  }

  redirectOnNewGame(message) {
    this.send(
      {
        message:
          message === NEWGAME_ACCEPT ? REDIRECT_NEWGAME : REDIRECT_ENDGAME,
      },
      message === NEWGAME_ACCEPT ? 1 : "ALL"
    );
  }
}

module.exports = {
  Game,
  WaitingRoom,
};
