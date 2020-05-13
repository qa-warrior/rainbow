/*global storage*/
import { InMemoryCache } from '@apollo/client';
import { persistCache } from 'apollo-cache-persist-dev';
import { logger } from '../utils';

export const cache = new InMemoryCache();

export default async function initApolloCache() {
  try {
    // await before instantiating ApolloClient, else queries might run before the cache is persisted
    await persistCache({ cache, debug: true, storage });
  } catch (err) {
    logger.error('error persisting apollo cache', err);
  }
}
