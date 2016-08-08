import express from 'express';
import session from 'express-session';

const app = express();

import config from '../config';
app.start = () => {
  if (config.apiPort) {
    app.listen(config.apiPort, () => {
      console.info('----\n==> 🌎  GraphQL Server is running on port %s', config.apiPort);
      console.info('==> 💻  Send queries to http://%s:%s/graphql', config.apiHost, config.apiPort);
    });
  } else {
    console.error('==>     ERROR: No PORT environment variable has been specified');
  }
}

export default app;
