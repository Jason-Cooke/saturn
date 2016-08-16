import Express from 'express';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { ApolloProvider } from 'react-apollo';
import { renderToStringWithData } from 'react-apollo/server';
import favicon from 'serve-favicon';
import compression from 'compression';
import httpProxy from 'http-proxy';
import path from 'path';
import PrettyError from 'pretty-error';
import http from 'http';
import _ from 'lodash';

import { match, RouterContext } from 'react-router';

import config from '../config';
import Html from './Html';
import ourCreateClient from './apollo-client';
import ourCreateStore from './store';

const targetUrl = 'http://' + config.apiHost + ':' + config.apiPort;
const pretty = new PrettyError();

export default ({
  routes,
  disableSSR = false,
  createClient = ourCreateClient,
  createStore = ourCreateStore }) => {
  const app = new Express();
  const server = new http.Server(app);
  const proxy = httpProxy.createProxyServer({
    target: targetUrl,
    ws: true
  });

  app.use(compression());
  // XXX: ??
  // app.use(favicon(path.join(__dirname, '..', 'static', 'favicon.ico')));

  app.use(Express.static(path.join(process.cwd(), 'static')));

  // Proxy to API server
  app.use('/graphql', (req, res) => {
    proxy.web(req, res, {target: targetUrl + '/graphql'});
  });
  app.use('/graphiql', (req, res) => {
    proxy.web(req, res, {target: targetUrl + '/graphiql'});
  });
  app.use('/login', (req, res) => {
    proxy.web(req, res, {target: targetUrl + '/login'});
  });
  app.use('/logout', (req, res) => {
    proxy.web(req, res, {target: targetUrl + '/logout'});
  });

  // added the error handling to avoid https://github.com/nodejitsu/node-http-proxy/issues/527
  proxy.on('error', (error, req, res) => {
    let json;
    if (error.code !== 'ECONNRESET') {
      console.error('proxy error', error);
    }
    if (!res.headersSent) {
      res.writeHead(500, {'content-type': 'application/json'});
    }

    json = {error: 'proxy_error', reason: error.message};
    res.end(JSON.stringify(json));
  });

  app.use((req, res) => {
    if (__DEVELOPMENT__) {
      // Do not cache webpack stats: the script file would change since
      // hot module replacement is enabled in the development env
      webpackIsomorphicTools.refresh();
    }

    if (disableSSR) {
      return res.send('<!doctype html>\n' +
        ReactDOM.renderToString(
          <Html assets={webpackIsomorphicTools.assets()}/>
        )
      );
    }

    match({ routes: routes, location: req.originalUrl },
        (error, redirectLocation, renderProps) => {
      if (redirectLocation) {
        res.redirect(redirectLocation.pathname + redirectLocation.search);
      } else if (error) {
        console.error('ROUTER ERROR:', pretty.render(error));
        res.status(500);
        hydrateOnClient();
      } else if (renderProps) {
        // transfer request headers to networkInterface so that they're accessible to proxy server
        // Addresses this issue: https://github.com/matthew-andrews/isomorphic-fetch/issues/83
        const client = createClient(req.headers);
        const store = createStore({ client });


        const component = (
          <ApolloProvider client={client} store={store}>
            <RouterContext {...renderProps} />
          </ApolloProvider>
        );

        renderToStringWithData(component).then(content => {
          res.status(200);

          global.navigator = {userAgent: req.headers['user-agent']};

          const html = (
            <Html assets={webpackIsomorphicTools.assets()}
              content={content} store={store} />
          );
          res.send('<!doctype html>\n' + ReactDOM.renderToStaticMarkup(html));
        });
      } else {
        res.status(404).send('Not found');
      }
    });
  });

  if (config.port) {
    server.listen(config.port, (err) => {
      if (err) {
        console.error(err);
      }
      console.info('----\n==> ✅  app is running, talking to API server on %s.', config.apiPort);
      console.info('==> 💻  Open http://%s:%s in a browser to view the app.', config.host, config.port);
    });
  } else {
    console.error('==>     ERROR: No PORT environment variable has been specified');
  }

  return app;
};
