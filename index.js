const WebSocket = require("ws");
const { Game, WaitingRoom } = require("./game");
const { START, REDIRECT, GAME, PLAY, CREATE, JOIN } = require("./messages");

const server = new WebSocket.Server({ port: 8080 });
player1SocketsWaitingRoom = [];
waitingRooms = [];

player1Sockets = [];
games = [];

server.on("connection", (socket) => {
  socket.on("message", (playerString) => {
    const player = JSON.parse(playerString);

    //If a player 1 is creating a game
    if (player.playerNo === 1 && player.message === CREATE) {
      socket.player = player;
      player1SocketsWaitingRoom.push(socket);
      console.log(0);
    }

    //If player 1 is redirecting player 2 to game page
    if (player.playerNo === 1 && player.message === REDIRECT) {
      const waitingRoom = findWaitingRoom(player.gameId);
      if (waitingRoom) {
        console.log(2);
        waitingRoom.redirect();
      }
    }

    //If player 2 is joining game
    if (player.playerNo === 2 && player.message === JOIN) {
      const player1Socket = player1SocketsWaitingRoom.find(
        (playerSocket) => playerSocket.player?.gameId === player.gameId
      );
      console.log(1);
      if (player1Socket) {
        socket.player = player;

        const newWaitingRoom = new WaitingRoom(
          player.gameId,
          player1Socket,
          socket
        );
        waitingRooms.push(newWaitingRoom);

        newWaitingRoom.start();
      }
    }

    //If a player plays
    if (player.message === PLAY) {
      const game = findGame(player.gameId);
      if (game) {
        const { gridIdx, playerNo } = player;
        game.play(gridIdx, playerNo);
      }
    }

    //When game starts for player 1
    if (player.playerNo === 1 && player.message === GAME) {
      socket.player = player;
      player1Sockets.push(socket);
      console.log(3);
    }

    //When game starts for player 2
    if (player.playerNo === 2 && player.message === GAME) {
      const player1Socket = player1Sockets.find(
        (playerSocket) => playerSocket.player?.gameId === player.gameId
      );

      if (player1Socket) {
        socket.player = player;

        const newGame = new Game(player.gameId, player1Socket, socket);
        games.push(newGame);

        newGame.getPlayers();
        console.log(4);
      }
    }
  });
});

function findWaitingRoom(waitingRoomId) {
  return waitingRooms.find((waitingRoom) => waitingRoom.id === waitingRoomId);
}

function findGame(gameId) {
  return games.find((game) => game.id === gameId);
}
