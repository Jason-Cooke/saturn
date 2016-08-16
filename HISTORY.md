## vNEXT
 - update dependency to apollo-server 0.2.1 and apollo-client 0.4.x
 - update skel app according to (Migrating from v0.1)[http://docs.apollostack.com/apollo-server/migration.html] and other known issues

## 0.2.4
 - Fix to ensure request headers get sent to proxy server

## 0.2.3
 - Fixes to allow SSR without requiring users to install `isomorphic-fetch` [Issue #21](https://github.com/apollostack/saturn/issues/21)

## 0.2.2
 - Allow custom webpack config [PR #18](https://github.com/apollostack/saturn/pull/18), [Issue #5](https://github.com/apollostack/saturn/issues/5)
 - Removed `registerGqlTag` usage [PR #16](https://github.com/apollostack/saturn/pull/16) [Issue #14](https://github.com/apollostack/saturn/issues/14)

## 0.2.1

 - Ensure SSR works when you *aren't* fetching data from graphql
 - Reload when HMR isn't handled
 - Allow single `app` entry-point
 - Added `graphql` as a dependency to skel
