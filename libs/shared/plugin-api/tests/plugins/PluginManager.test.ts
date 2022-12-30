import {
    PluginManager,
    PluginBase,
    EventManager,
    PluginEnableEvent,
    PluginDisableEvent,
} from '../../src/index';

class TestPlugin extends PluginBase {
    name = 'plugin-test';
    displayName = 'Test Plugin';
    version = '0.0.0';
}

describe('PluginManager', () => {
    let eventManager;
    let pluginManager;

    beforeAll(() => {
        // create event manager for the plugin manager
        eventManager = new EventManager();

        // create the plugin manager
        pluginManager = new PluginManager(eventManager);
    });

    beforeEach(() => {
        // before each test, remove all event listerers
        eventManager.removeAllListeners();
    });

    it('should be able to load a plugin', () => {
        // load plugin
        pluginManager.loadPlugin(TestPlugin);
    });

    it('should be able to enable all plugins', () => {
        expect.assertions(1);

        // add plugin enable listener
        eventManager.addListener(PluginEnableEvent, (d) => {
            expect(d.data).toStrictEqual({
                name: 'plugin-test',
                displayName: 'Test Plugin',
                version: '0.0.0',
            });
        });

        // enable all plugins
        pluginManager.enablePlugins();
    });

    it('should be able to disable all plugins', () => {
        expect.assertions(1);

        // add plugin disable listener
        eventManager.addListener(PluginDisableEvent, (d) => {
            expect(d.data).toStrictEqual({
                name: 'plugin-test',
                displayName: 'Test Plugin',
                version: '0.0.0',
            });
        });

        // enable all plugins
        pluginManager.disablePlugins();
    });

    it('should clear all plugins', () => {
        // clear all the plugins
        pluginManager.clearPlugins();
    });
});
