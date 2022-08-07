const WebSocket = require("ws");
const { Game, WaitingRoom } = require("./game");
const {
  REDIRECT,
  GAME,
  PLAY,
  CREATE,
  JOIN,
  NEWGAME,
  NEWGAME_DECLINE,
  NEWGAME_ACCEPT,
  REDIRECT_NEWGAME,
} = require("./messages");

const server = new WebSocket.Server({ port: 8080 });

//Store player 1s in waiting room
player1SocketsWaitingRoom = [];
waitingRooms = [];

//Store player 1s in game room
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

    //If player 2 is joining game
    if (player.playerNo === 2 && player.message === JOIN) {
      const player1Socket = player1SocketsWaitingRoom.find(
        (playerSocket) => playerSocket.player?.gameId === player.gameId
      );

      const existingWaitingRoom = findWaitingRoom(player.gameId);
      console.log(1);
      if (player1Socket && !existingWaitingRoom) {
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

    //If player 1 is redirecting player 2 to game page
    if (player.playerNo === 1 && player.message === REDIRECT) {
      const waitingRoom = findWaitingRoom(player.gameId);
      if (waitingRoom) {
        console.log(2);
        waitingRoom.redirect();
      }
    }

    //When game starts for player 1
    if (player.playerNo === 1 && player.message === GAME) {
      socket.player = player;
      player1Sockets.unshift(socket);
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
        games.unshift(newGame);

        newGame.getPlayers();
        console.log(4);
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

    //If a player requests a new game
    if (player.message === NEWGAME) {
      const game = findGame(player.gameId);
      if (game) {
        game.newGame(player.playerNo === 1 ? 2 : 1);
      }
    }

    //If a player responds to a new game request
    if (player.message === NEWGAME_ACCEPT || player.message === NEWGAME_DECLINE ) {
      const game = findGame(player.gameId);
      if (game) {
        game.redirectOnNewGame(player.message)
      }
    }

    //If player 1 wants to redirect player 2 to a new game
    if (player.playerNo === 1 && player.message === REDIRECT_NEWGAME) {
      const game = findGame(player.gameId);
        if (game) {
          game.redirect()
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

/**
 * A player 1 sends a CREATE message to create a game and is pushed to a waiting room for player 1s
 * A player cannot send the same gameId when sending a CREATE message i.e no two CREATE messages
 * will have the same gameId so we dont have to worry about using unshift to put a player 1 in the
 * waiting room for player 1s
 *
 *
 * A player 2 sends a JOIN message and we check if there isnt an existing waiting room with the gameId
 * (in the case of a JOIN message sent more than once) and if there is a player 1 in the waiting room for player 1s
 * with the same gameId
 *
 * 1- if there is we create a waiting room, push the new waiting room into the list of waiting rooms.
 * we send a START message to player 1. When player 1 receives this message, they send a REDIRECT message
 * to player 2. we dont have to worry about using unshift to put a waiting room in the list of waiting rooms
 * because we prevented multiple waiting rooms with the same gameIds in the list
 *
 * 2- if there isnt, nothing is done and player 2 will be left waiting for player 1 to start on the fe. This
 * scenario won't happen
 *
 * 3- if there is and 1 is executed, but player 1 socket connection is lost, there will be no player 1
 * to receive the START message and player 2 will be left waiting for player 1 to start on the fe
 *
 *
 * A player 1 sends a REDIRECT message and the waiting room with the gameId is found and player 2 is sent
 * a REDIRECT message
 *
 *
 * A player 1 sends a GAME message and is pushed to the list of player 1s for games. We use unshift here because
 * multiple sockets can send a GAME message with the same gameId and we want to access the most recent socket when
 * using a find method
 *
 *
 * A player 2 sends a GAME message and we search the list of player 1s for games with the same gameId
 *
 * 1- if there is, we create a game and use unshift to add it to the list of games. We use unshift because
 * we can have multiple games with the same gameId and we want to access the most recent game first when
 * using a find method. We send the players information to both players
 *
 * 2- if there isnt, player 2 is left on a loading page on the fe. This can happen if player 2 sends their
 * GAME message before player 1
 *
 *
 * A player sends a PLAY message and we find the game they are in and play their move. if theres no game should
 * not happen
 */
