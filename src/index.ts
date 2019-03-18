import express from 'express';
import errorHandler from 'errorhandler';

// Create Express server
const app = express();

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());
app.set("port", process.env.PORT || 3000);


app.get('/variation', (request, response) => {
  response.json({
    variation: 1,
  });
  response.send();
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