import { EventManager, PluginDisableEvent, PluginEnableEvent } from '../events';
import { PluginBase, IPluginBase } from './Plugin';

export class PluginManager {
    private plugins: Map<string, PluginBase>;
    private eventManager: EventManager;

    constructor(eventManager: EventManager) {
        this.eventManager = eventManager;
        this.plugins = new Map<string, PluginBase>();
    }

    /**
     * Loads a plugin
     *
     * @param {IPluginBase} plugin plugin class
     * @memberof PluginManager
     */
    loadPlugin(PluginClass: IPluginBase) {
        // create the plugin
        const plugin = new PluginClass(this.eventManager, null);

        // add plugin to list
        if (!this.plugins.has(plugin.name)) {
            this.plugins.set(plugin.name, plugin);
        }
    }

    /**
     * Unloads a plugin
     *
     * @param {PluginBase} plugin
     * @memberof PluginManager
     */
    unloadPlugin(plugin: PluginBase) {
        // remove plugin if it exists
        if (this.plugins.has(plugin.name)) {
            this.plugins.delete(plugin.name);
        }
    }

    /**
     * Enable a plugin
     *
     * @param {PluginBase} plugin
     * @memberof PluginManager
     */
    enablePlugin(plugin: PluginBase) {
        // check whether the plugin is already enabled
        if (plugin.enabled) return;

        // if it isn't, we enable it and emit the enabled event
        plugin.enabled = true;
        this.eventManager.emit(
            new PluginEnableEvent({
                name: plugin.name,
                displayName: plugin.displayName,
                version: plugin.version,
            })
        );
    }

    /**
     * Disable a plugin
     *
     * @param {PluginBase} plugin
     * @memberof PluginManager
     */
    disablePlugin(plugin: PluginBase) {
        // check if the plugin has already been disabled
        if (!plugin.enabled) return;

        // if it hasn't, disable it and emit the event
        plugin.enabled = false;
        this.eventManager.emit(
            new PluginDisableEvent({
                name: plugin.name,
                displayName: plugin.displayName,
                version: plugin.version,
            })
        );
    }
    /**
     * Enable all plugins
     *
     * @memberof PluginManager
     */
    enablePlugins() {
        this.plugins.forEach((plugin) => {
            this.enablePlugin(plugin);
        });
    }

    /**
     * Disable all plugins
     *
     * @memberof PluginManager
     */
    disablePlugins() {
        this.plugins.forEach((plugin) => {
            this.disablePlugin(plugin);
        });
    }

    /**
     * Disable and unregisters all plugins
     *
     * @memberof PluginManager
     */
    clearPlugins() {
        this.plugins.forEach((plugin) => {
            this.disablePlugin(plugin);
            this.unloadPlugin(plugin);
        });
    }

    /**
     * Get a plugin by name
     *
     * @param {string} name
     * @memberof PluginManager
     */
    getPlugin(name: string): PluginBase {
        if (this.plugins.has(name)) {
            return this.plugins.get(name);
        } else {
            return null;
        }
    }

    /**
     * Get all plugins
     *
     * @return {*}  {PluginBase[]}
     * @memberof PluginManager
     */
    getPlugins(): PluginBase[] {
        return [...this.plugins.values()];
    }
}
