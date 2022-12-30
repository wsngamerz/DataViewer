import Logger from '@data-viewer/shared/logger';
import {
    EventManager,
    PluginDisableEvent,
    PluginEnableEvent,
    PluginManager,
} from '@data-viewer/shared/plugin-api';

export default async () => {
    // get local logger
    const logger = Logger.getLogger('PluginLoader');
    logger.debug('Initialising plugins');

    // TODO: Move public
    const eventManager = new EventManager();

    // add handlers to listen to when plugins are enabled
    eventManager.addListener(PluginEnableEvent, onPluginEnabled);
    eventManager.addListener(PluginDisableEvent, onPluginDisabled);

    // create the plugin manager
    const pluginManager = new PluginManager(eventManager);

    // TODO: Load plugins
    // pluginManager.loadPlugin();

    // enable all the plugins that have been loaded
    pluginManager.enablePlugins();

    logger.debug('Initialised plugins');
};

const onPluginEnabled = (event: PluginEnableEvent) => {
    const data = event.data;
    const logger = Logger.getLogger('PluginLoader');
    logger.info(
        `Plugin ${data.displayName} (${data.name}) v${data.version} Enabled`
    );
};

const onPluginDisabled = (event: PluginDisableEvent) => {
    const data = event.data;
    const logger = Logger.getLogger('PluginLoader');
    logger.info(
        `Plugin ${data.displayName} (${data.name}) v${data.version} Disabled`
    );
};
