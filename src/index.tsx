import * as path from 'path';
import * as React from 'react';
import { selectors, types } from 'vortex-api';

import settingsReducer from './reducers';

import ToolStarter from './ToolStarter';
import TitleBarToggle from './TitlebarToggle';

function init(context: types.IExtensionContext) {
  context.registerReducer(['settings', 'interface'], settingsReducer);
  (context as any).registerDynDiv('main-toolbar', ToolStarter, {
    condition: (props: any): boolean => {
      return selectors.activeGameId(context.api.store.getState()) !== undefined;
    },
  });

  (context as any).registerDynDiv('starter-dashlet-tools-controls', TitleBarToggle, {
    condition: (props: any): boolean => {
      return selectors.activeGameId(context.api.store.getState()) !== undefined;
    },
  });

  context.once(() => {
    context.api.setStylesheet('titlebar-launcher', path.join(__dirname, 'titlebar-launcher.scss'));
  });

  return true;
}

export default init;
