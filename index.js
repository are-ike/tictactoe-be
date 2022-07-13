const WebSocket = require("ws");
const { Game } = require("./game");

const server = new WebSocket.Server({ port: 8080 });
player1Sockets = [];
games = [];

server.on("connection", (socket) => {
  socket.on("message", (playerString) => {
    const player = JSON.parse(playerString);

    if (
      player.player === 1 &&
      player.message !== "START" &&
      player.message !== "REDIRECT"
    ) {
      socket.player = player;
      player1Sockets.push(socket);
      console.log(0);
    }

    if (player.player === 1 && player.message === "REDIRECT") {
      const game = findGame(player.gameId);
      if (game) {
        console.log(2);
        game.redirect();
      }
    }

    if (player.player === 2) {
      const player1Socket = player1Sockets.find(
        (playerSocket) => playerSocket.player?.gameId === player.gameId
      );
      console.log(1);
      if (player1Socket) {
        socket.player = player;
        const newGame = new Game(player.gameId, player1Socket, socket);
        games.push(newGame);
        newGame.start();
      }
    }

    if (player.message === "PLAY") {
      const game = findGame(player.gameId);
      if (game) {
        const { gridIdx, player } = player;
        game.play(gridIdx, player);
      }
    }

    if (player.message === "GAME") {
      const game = findGame(player.gameId);
      if (game) {
        game.getPlayers();
      }
    }
  });
});

function findGame(gameId) {
  return games.find((game) => game.id === gameId);
}
