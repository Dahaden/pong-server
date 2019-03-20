import express from 'express';
import errorHandler from 'errorhandler';

import bodyParser from 'body-parser';
import Stats from './stats';

// Create Express server
const app = express();
const stats = new Stats();

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());
app.set("port", process.env.PORT || 3000);

app.use(express.static('static'));

app.use(bodyParser.json());

app.get('/featureflags', (request, response) => {
  response.json({
    flags: {
      useSmartAI: stats.shouldRunExperiment()
    },
  });
  response.send();
});

app.get('/stats', (request, response) => {
  response.json(stats.getStats());
  response.send();
});

app.get('/stats/paddleHitAverage', (request, response) => {
  response.json(stats.getAveragePaddleHist());
  response.send();
});
app.get('/stats/scorediffaverage', (request, response) => {
  response.json(stats.getAverageScoreDifference());
  response.send();
});
app.get('/stats/consecutivegames', (request, response) => {
  response.json(stats.getConsecutiveGamePlayed());
  response.send();
});
app.get('/stats/aiwins', (request, response) => {
  response.json(stats.getProportionsAIWon());
  response.send();
});

export interface GameStats { 
  paddleHitCounter: number,
  consecutiveGame: boolean,
  activeFlags: string[],
  score: {
    left: number,
    right: number
  }
}

app.post('/gameresult', (request, response) => {
  // Get game data and store
  const gameData: GameStats = request.body;
  console.log('GameData:', gameData);
  stats.addResult(gameData);
  response.sendStatus(204);
});

/**
 * Start Express server.
 */
const server = app.listen(app.get("port"), () => {
  console.log(
    "  App is running at http://localhost:%d in %s mode",
    app.get("port"),
    app.get("env")
  );
  console.log("  Press CTRL-C to stop\n");
});

export default server;