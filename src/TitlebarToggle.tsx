import * as React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { MainContext, selectors, Toggle, types, util } from 'vortex-api'

import { setAddToTitleBar } from './actions';

interface IConnectedProps {
  gameMode: string;
  addToTitleBar: boolean;
  toolsOrder: string[];
}

export default function TitlebarToggle() {
  const [t] = useTranslation();
  const context = React.useContext(MainContext);
  const { gameMode, addToTitleBar, toolsOrder } = useSelector(mapStateToProps);
  const onToggle = React.useCallback(() => {
    context.api.store.dispatch(setAddToTitleBar(!addToTitleBar));
    if (!addToTitleBar === true) {
      context.api.events.emit('analytics-track-click-event', 'Tools', 'Added to Titlebar');
    }
  }, [addToTitleBar]);
  if (!gameMode || toolsOrder.length === 0) {
    return null;
  }
  return (
    <div id='titlebar-tools-toggle-container'>
      <p className='titlebar-tools-toggle-text'>{t('Enable toolbar')}</p>
      <Toggle
        className='titlebar-tools-toggle'
        checked={addToTitleBar}
        onToggle={onToggle}
      />
    </div>
  )
}

function mapStateToProps(state: types.IState): IConnectedProps {
  const game: types.IGameStored = selectors.currentGame(state);
  if (game?.id === undefined) {
    return {
      gameMode: '',
      addToTitleBar: false,
      toolsOrder: [],
    };
  }

  return {
    gameMode: game.id,
    addToTitleBar: util.getSafe(state,
      ['settings', 'interface', 'tools', 'addToolsToTitleBar'], false),
    toolsOrder: util.getSafe(state,
      ['settings', 'interface', 'tools', 'order', game.id], []),
  };
}
