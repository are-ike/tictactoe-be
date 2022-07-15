module.exports = {
  CREATE: "CREATE", //Sent by player 1 to create a game
  JOIN: "JOIN", //Sent by a player to join a game(for player 2)
  START: "START", //Sent by player 1 to start the game
  PLAY: "PLAY", //Sent by both players for each play
  PLAYED: "PLAYED", //Sent to indicate a player has played
  REDIRECT: "REDIRECT", //Sent by player 1 to redirect player 2 to game page
  GAME: "GAME", //Sent at the start of the game
};
