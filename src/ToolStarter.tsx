import memoize from 'memoize-one';
import * as path from 'path';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { fs, selectors, Spinner, ToolIcon, types, util } from 'vortex-api';

// tslint:disable-next-line:no-var-requires
const { MainContext } = require('vortex-api');

interface IConnectedProps {
  addToTitleBar: boolean;
  toolsOrder: types.IStarterInfo[];
  game: types.IGameStored;
  discovery: types.IDiscoveryResult;
  discoveredTools: { [id: string]: types.IDiscoveredTool };
  primaryTool: string;
  toolsRunning: { [exeId: string]: types.IRunningTool };
}

interface IToolStarterIconProps {
  tool: types.IStarterInfo;
  running: boolean;
  iconLocation: string;
}

function toolIconRW(gameId: string, toolId: string) {
  return path.join((util as any).getVortexPath('userData'), gameId, 'icons', toolId + '.png');
}

async function toolIcon(gameId: string, extensionPath: string,
                        toolId: string, toolLogo: string): Promise<string> {
  try {
    const iconPath = toolIconRW(gameId, toolId);
    await fs.statAsync(iconPath);
    return iconPath;
  } catch (err) {
    if (toolLogo === undefined) {
      return undefined;
    }
    try {
      const iconPath = path.join(extensionPath, toolLogo);
      await fs.statAsync(iconPath);
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
                         tools: types.IDiscoveredTool[]): types.IStarterInfo[] {
  return tools.filter(tool => tool.id !== undefined)
    .map(toolDiscovery => {
      const tool = game.supportedTools.find(iter => iter.id === toolDiscovery.id);
      try {
        return toStarterInfo(game, discovery, tool, toolDiscovery);
      } catch (err) {
        // not the job of this extension to report this
        return undefined;
      }
    })
    .filter(iter => iter !== undefined);
}

function ToolStarterIcon(props: IToolStarterIconProps) {
  const { api }: { api: types.IExtensionApi } = React.useContext(MainContext);
  const { primaryTool } = useSelector(mapStateToProps);
  const onShowError = React.useCallback((message: string, details: any, allowReport: boolean) => {
    api.showErrorNotification(message, details, { allowReport });
  }, [api]);
  const [valid, setValid] = React.useState(false);
  React.useEffect(() => {
    const isValid = async () => {
      try {
        await fs.statAsync(props.tool.exePath);
        setValid(true);
      } catch (err) {
        setValid(false);
      }
    };
    isValid();
  }, [props.tool]);

  const startCB = React.useCallback(() => {
    this.context.api.events.emit('analytics-track-click-event', 'Tools', 'Manually ran tool');
    util.StarterInfo.run(props.tool as any, api, onShowError);
  }, [props]);

  return valid ? (
    <ToolIcon
      t={api.translate}
      valid={true}
      item={props.tool}
      isPrimary={props.tool.id === primaryTool}
      imageUrl={props.iconLocation}
      onRun={startCB}
    >
      {props.running ? <Spinner className='running-overlay' /> : null}
    </ToolIcon>
  ) : null;
}

const toStarters = memoize(starterMemoizer);

function makeExeId(exePath: string): string {
  return path.basename(exePath).toLowerCase();
}

function ToolStarter() {
  const { addToTitleBar, discovery, game, discoveredTools,
          primaryTool, toolsRunning, toolsOrder } = useSelector(mapStateToProps);

  const [toolImages, setToolImages] = React.useState({});
  const starters = toStarters(game, discovery, primaryTool, Object.values(discoveredTools || {}));
  const idxOfTool = (tool) => {
    const idx = toolsOrder.findIndex(id => tool.id === id);
    return idx !== -1 ? idx : starters.length;
  };
  starters.sort((lhs, rhs) => idxOfTool(lhs) - idxOfTool(rhs));
  React.useEffect(() => {
    const getImagePath = async () => {
      const imageMap = {};
      for (const starter of starters) {
        imageMap[starter.id] = await toolIcon(game.id, game.extensionPath,
                                              starter.id, starter.logoName);
      }
      setToolImages(imageMap);
    };
    getImagePath();
  }, [discoveredTools]);
  if (!addToTitleBar) {
    return null;
  }
  return (
    <div id='titlebar-starter'>
      {starters.map((starter, idx) => {
        const running = (starter.exePath !== undefined)
          && (toolsRunning[makeExeId(starter.exePath)] !== undefined);

        return (
          <ToolStarterIcon
            running={running}
            key={idx}
            tool={starter}
            iconLocation={toolImages[starter.id]}
          />
        );
      })}
    </div>
  );
}

const emptyObj = {};

function mapStateToProps(state: types.IState): IConnectedProps {
  const game: types.IGameStored = selectors.currentGame(state);
  const discovery: types.IDiscoveryResult = selectors.currentGameDiscovery(state);

  return {
    addToTitleBar: util.getSafe(state,
      ['settings', 'interface', 'tools', 'addToolsToTitleBar', game.id], false),
    toolsOrder: util.getSafe(state,
      ['settings', 'interface', 'tools', 'order', game.id], []),
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
