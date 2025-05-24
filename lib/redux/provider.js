'use client';

import { Provider } from 'react-redux';
import { makeStore } from './store';

const store = makeStore();

export function ReduxProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
