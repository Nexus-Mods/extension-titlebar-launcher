import { createAction } from 'redux-act';

export const setAddToTitleBar = createAction('SET_ADD_TO_TITLEBAR',
  (gameId: string, addToTitleBar: boolean) => ({ gameId, addToTitleBar }));
