module.exports = {
  CREATE: "CREATE", //Sent by player 1 to create a game
  JOIN: "JOIN", //Sent by a player to join a game(for player 2)
  START: "START", //Sent to player 1 to start the game
  PLAY: "PLAY", //Sent by both players for each play
  PLAYED: "PLAYED", //Sent to indicate a player has played
  REDIRECT: "REDIRECT", //Sent by player 1 to redirect player 2 to game page
  GAME: "GAME", //Sent at the start of the game
  NEWGAME: "NEWGAME", //Sent to indicate a player wants a new game
  NEWGAME_DECLINE: "NEWGAME_DECLINE", //Sent by a player to decline a new game request
  NEWGAME_ACCEPT: "NEWGAME_ACCEPT", //Sent by a player to accept a new game request
  REDIRECT_NEWGAME: 'REDIRECT_NEWGAME', //Sent to redirect to new game
  REDIRECT_ENDGAME: 'REDIRECT_ENDGAME', //Sent to redirect to end game
};
