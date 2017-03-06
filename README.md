# Saturn

[![Greenkeeper badge](https://badges.greenkeeper.io/apollographql/saturn.svg)](https://greenkeeper.io/)

**NOTE: This project is deprecated. Most of the design goals are achieved by the combination of Next.js and Apollo, See [this example](https://github.com/zeit/next.js/tree/master/examples/with-apollo). In this configuration, you'd treat the GraphQL server as a separate project.**

Saturn is a microframework for building modern node/browser based JS apps, using [Apollo](http://apollostack.com). It is intended to provide the building blocks that the majority of such apps would need, such as:

 - A client side build system
 - Server side rendering
 - A production deployment setup
 - A hot-module-reload system for development
 - A test setup using Mocha
 - A babel setup for all of the above

Saturn runs your app in two modes; in development, it starts:

 - An API server, typically for a [`apollo-server`](https://github.com/apollostack/apollo-server) driven GraphQL API.
 - A webpack development server to serve JS files and drive hot module reload. Think of this as your "client app".
 - An application server (the "server app") which renders your app on the server.

In production, it only starts the API server and server app, the client app is pre-compiled and will never change (so no server is required).

## Installation

The easiest way to start a Saturn project is to install saturn-framework globally and use the CLI:

```bash
npm install -g saturn-framework
saturn create my-app
```

Alternatively, you can add `saturn-framework` as a dependency (not a `devDependency`!) of your app. You will also need a couple of other dependencies; see the [Skeleton's `package.json`](https://github.com/apollostack/saturn/blob/master/skel/package.json) for the latest list.

## Configuration

In order to make using the commands easier, typically you should configure the `"saturn"` section of your `package.json` to define the entry points for the three parts of your app (see above):

```
{
  "saturn": {
    "app-client": "path/to/client/entrypoint.js",
    "app-server": "path/to/server/entrypoint.js",
    "api-server": "path/to/api/entrypoint.js",
    "webpack-dev": "path/to/webpack/dev.config",
    "webpack-prod": "path/to/webpack/prod.config"
  }
}
```

The paths for the app-client and server can be the same, if you write a universal entrypoint.

### Webpack configs

In order to provide a custom Webpack config, you must specify a path to the file within the `"saturn"` section of your `package.json`. The config file must provide a default export of your Webpack config.

Within your specified config file you may import Saturn's default Webpack configuration.

```js
import config from 'saturn-framework/webpack/dev.config';

export default config;
```

## Entry points

The entry points are really just files that will be started in the various processes above, however Saturn provides some utilities that make sense to be imported by each of the above.

### API server entrypoint

[`'saturn-framework/api'`](https://github.com/apollostack/saturn/blob/master/api/index.js) provides a simple express server.

Typically you would just attach a `apollo-server` to the `/graphql` path.

The simplest possible API server entrypoint looks like:

```js
import apiServer from 'saturn-framework/api';
import { apolloServer } from 'apollo-server';
import { schema, mocks } from './schema';

apiServer.use('/graphql', apolloServer({ schema, mocks }));

apiServer.start();
```

### Client/server app entrypoint
  - [`saturn-framework/app`](https://github.com/apollostack/saturn/blob/master/app/index.js) exports a `createApp` function which provides a universal API also avaliable at:

  - [`saturn-framework/app/client`](https://github.com/apollostack/saturn/blob/master/app/client.js) - takes a object of arguments:

    - Creates an [`ApolloClient`](http://github.com/apollostack/apollo-client) in [a straightforward way](https://github.com/apollostack/saturn/blob/master/app/apollo-client.js), or you can pass in your own client creation function in the `createClient` argument.

    - Creates a [Redux store](http://redux.js.org) based on that client, also in [a straightforward way](https://github.com/apollostack/saturn/blob/master/app/store.js), loading hydrated data from the server, or you can pass in your own store creation function in the `createStore` argument.

    - sets up a [React Router](https://github.com/reactjs/react-router) using the routes provided in the `routes` argument, and renders it with a [`ApolloProvider`](https://github.com/apollostack/react-apollo) setup using the store and client above.

  - [`saturn-framework/app/server`](https://github.com/apollostack/saturn/blob/master/app/server.js) - takes the same object of arguments, and unless server rendering is disabled with the `noSSR` argument:

   - Sets up an express server which renders the provided routes, and on each request, creates a client and store in a similar way, server-side-renders them, and returns the HTML + dehydrated data to the client, ready to be consumed by the client app.

The simplest possible universal entrypoint looks like:

```js
import createApp from 'saturn-framework/app';
import routes from './routes';
createApp({ routes });
```

> Note that you don't have to import any of the above code from Saturn in your app if you don't want to. You can simply copy the relevant sections of code into your app where it makes sense. Of course if you import it, it will be easier to receive updates as the framework improves.

## Commands

Saturn ships with various commands to start and stop servers and various other things. If you have globally installed Saturn, you can run the directly with `saturn X`, although in general it's probably better to add them as an `npm run`  command in case of subtle differences with saturn versions. (If you use "`saturn`" in a npm script, it'll use the app's version of Saturn's CLI)

- `saturn create` - create a simple app, and set up required dependencies.

- `saturn dev` - run the three development servers concurrently, to run separately:
  - `saturn start-dev` - run the dev app ("server app")
  - `saturn watch-client` - run the webpack dev server ("client app")
  - `saturn start-dev-api` - run the dev API server

- `saturn build` - build the production JS bundle ("client app")

- `saturn start` - run the two production servers concurrently, to run separately:
  - `saturn start` - run the production app ("server app")
  - `saturn start-api` - run the production API server

- `saturn test` - run the mocha test runner (define test files in files name `*-test[s]-*.js`).

- `saturn deploy` - **experimental command** -  deploy to galaxy. Requires the `deploy-node` branch of Meteor checked out and available as `curmeteor`.

## Saturn Development

To run a local copy of Saturn, you need to npm link it. This can be a total pain, but in theory this should work (YMMV, keep trying things, npm link is thoroughly broken):

```bash
git clone https://github.com/apollostack/saturn
cd saturn
npm install
npm link

cd /path/to/app
npm install
npm link saturn-framework
```

- It can be helpful to run commands with the `NO_PIPING=true` environment variable. This stops processes from restarting when files change and sometimes leads to more comprehensible error messages.

- If you are developing an Apollo package you may need to `npm link` it both within your app and saturn (good luck with that!)

## Credits

Thanks to all [Contributors!](https://github.com/apollostack/saturn/graphs/contributors)

Saturn (at least initially) is heavily inspired by (/ outright copied from) the [React Redux Universal Hot Example](https://github.com/erikras/react-redux-universal-hot-example), and [`hjs-webpack`](https://github.com/HenrikJoreteg/hjs-webpack).
