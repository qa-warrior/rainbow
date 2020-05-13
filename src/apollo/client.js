import { ApolloClient, HttpLink } from '@apollo/client';
import { cache } from './cache';

export const compoundClient = new ApolloClient({
  cache,
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v2',
  }),
});

export const uniswapClient = new ApolloClient({
  cache,
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswapbackup',
  }),
});
