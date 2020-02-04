import * as path from 'path';
import * as React from 'react';
import { selectors, types } from 'vortex-api';

import ToolStarter from './ToolStarter';

function init(context: types.IExtensionContext) {
  (context as any).registerDynDiv('main-toolbar', ToolStarter, {
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
