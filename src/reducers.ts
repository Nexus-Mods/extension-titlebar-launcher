import { types, util } from 'vortex-api';
import * as actions from './actions';

const reducer: types.IReducerSpec = {
  reducers: {
    [actions.setAddToTitleBar as any]: (state, payload) => {
      const { gameId, addToTitleBar } = payload;
      return util.setSafe(state, ['tools', 'addToolsToTitleBar', gameId], addToTitleBar);
    },
  },
  defaults: {
    tools: {
      addToolsToTitleBar: false,
    },
  },
};

export default reducer;
