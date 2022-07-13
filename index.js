const WebSocket = require("ws");
const { v4: uuid } = require("uuid");

const server = new WebSocket.Server({ port: 8080 });
const gameId = '592f6e50-235d-4785-8f82-21b66738f3fb';

server.on("connection", (socket) => {
  let player1 = false;
  let player2 = false;
  let toSendMessage = {
    player: null,
    message: "",
  };

  //JOINING
  socket.on("message", (message) => {
    const receivedMessage = JSON.parse(message);

    if (receivedMessage.player === 1 && !player1) {
      player1 = true;

      toSendMessage.player = 1;
      toSendMessage.message = gameId;
    }

    if (receivedMessage.player === 2 && !player2) {
      player2 = true;

      if (receivedMessage.gameId === gameId) {
        toSendMessage.player = 'ALL';
        toSendMessage.message = "START";
    } else {
        toSendMessage.player = null;
        toSendMessage.message = "INVALID ID";
      }
    }
    socket.send(JSON.stringify(toSendMessage));
    console.log(receivedMessage);
  });

  socket.on('message', message => {
    const receivedMessage = JSON.parse(message);
      if(receivedMessage.player === 1 && receivedMessage.message === 'REDIRECT PLAYER 2'){
          const toSendMessage = {
              player: 2,
              message: receivedMessage.message
          }
          socket.send(JSON.stringify(toSendMessage))
      }
  })
});

