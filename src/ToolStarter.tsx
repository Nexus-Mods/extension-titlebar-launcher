import memoize from 'memoize-one';
import * as path from 'path';
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { fs, selectors, Spinner, types, util } from 'vortex-api';
import ToolIcon from './ToolIcon';

// tslint:disable-next-line:no-var-requires
const { MainContext } = require('vortex-api');

interface IConnectedProps {
  game: types.IGameStored;
  discovery: types.IDiscoveryResult;
  discoveredTools: { [id: string]: types.IDiscoveredTool };
  primaryTool: string;
  toolsRunning: { [exeId: string]: types.IRunningTool };
}

type IProps = IConnectedProps;

function toolIconRW(gameId: string, toolId: string) {
  return path.join((util as any).getVortexPath('userData'), gameId, 'icons', toolId + '.png');
}

function toolIcon(gameId: string, extensionPath: string,
                  toolId: string, toolLogo: string): string {
  try {
    const iconPath = toolIconRW(gameId, toolId);
    fs.statSync(iconPath);
    return iconPath;
  } catch (err) {
    if (toolLogo === undefined) {
      return undefined;
    }
    try {
      const iconPath = path.join(extensionPath, toolLogo);
      fs.statSync(iconPath);
      return iconPath;
    } catch (err) {
      return undefined;
    }
  }
}

function toStarterInfo(game: types.IGameStored,
                       gameDiscovery: types.IDiscoveryResult,
                       tool: types.IToolStored,
                       toolDiscovery: types.IDiscoveredTool): types.IStarterInfo {
  return new util.StarterInfo(game, gameDiscovery, tool, toolDiscovery);

}

function starterMemoizer(game: types.IGameStored,
                         discovery: types.IDiscoveryResult,
                         primaryTool: string,
                         tools: types.IDiscoveredTool[]) {
  return tools
    .filter(tool => tool.id !== primaryTool)
    .map(toolDiscovery => {
      const tool = game.supportedTools.find(iter => iter.id === toolDiscovery.id);
      return toStarterInfo(game, discovery, tool, toolDiscovery);
    });
}

function ToolStarterIcon(props: { tool: types.IStarterInfo, running: boolean }) {
  const { api }: { api: types.IExtensionApi } = React.useContext(MainContext);
  const onShowError = React.useCallback((message: string, details: any, allowReport: boolean) => {
    api.showErrorNotification(message, details, { allowReport });
  }, [api]);

  const startCB = React.useCallback(() => {
    util.StarterInfo.run(props.tool as any, api, onShowError);
  }, [props]);

  return (
    <Button
      className='titlebar-button'
      title={props.tool.name}
      onClick={startCB}
      disabled={props.running}
    >
      <ToolIcon imageUrl={props.tool.iconPath} />
      {props.running ? <Spinner className='running-overlay' /> : null}
    </Button>
  );
}

const toStarters = memoize(starterMemoizer);

function makeExeId(exePath: string): string {
  return path.basename(exePath).toLowerCase();
}

function ToolStarter() {
  const { discovery, game, discoveredTools,
          primaryTool, toolsRunning } = useSelector(mapStateToProps);

  const starters = toStarters(game, discovery, primaryTool, Object.values(discoveredTools));

  return (
    <div id='titlebar-starter'>
      {starters.map((starter, idx) => {
        const running = (starter.exePath !== undefined)
          && (toolsRunning[makeExeId(starter.exePath)] !== undefined);

        return <ToolStarterIcon running={running} key={idx} tool={starter} />;
      })}
    </div>
  );
}

const emptyObj = {};

function mapStateToProps(state: types.IState): IConnectedProps {
  const game: types.IGameStored = selectors.currentGame(state);
  const discovery: types.IDiscoveryResult = selectors.currentGameDiscovery(state);

  return {
    game,
    discovery,
    discoveredTools: game !== undefined
      ? util.getSafe(state, ['settings', 'gameMode', 'discovered', game.id, 'tools'], emptyObj)
      : undefined,
    primaryTool: game !== undefined
      ? util.getSafe(state, ['settings', 'interface', 'primaryTool', game.id], undefined)
      : undefined,
    toolsRunning: state.session.base.toolsRunning,
  };
}

export default ToolStarter;
