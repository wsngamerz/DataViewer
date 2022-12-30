import Logger from '@data-viewer/shared/logger';

import { EventManager, PluginDisableEvent, PluginEnableEvent } from '../events';

export interface Plugin {
    /**
     * The internal name of the plugin, will not contain spaces
     * e.g. "plugin-facebook"
     *
     * @type {string}
     * @memberof Plugin
     */
    name: string;

    /**
     * A pretty name; used when needed to display to the user
     * e.g. "Facebook plugin"
     *
     * @type {string}
     * @memberof Plugin
     */
    displayName: string;

    /**
     * The version of the plugin
     *
     * @type {string}
     * @memberof Plugin
     */
    version: string;

    /**
     * Whether the plugin is enabled or not
     */
    enabled: boolean;
}

export interface IPluginBase {
    new (eventManager: EventManager): PluginBase;
}

export abstract class PluginBase implements Plugin {
    name: string;
    displayName: string;
    version: string;
    enabled: boolean;

    private logger: Logger;
    private eventManager: EventManager;

    constructor(eventManager: EventManager) {
        this.eventManager = eventManager;
        this.logger = Logger.getLogger(this.name);

        // add event listeners
        if (this.onPluginEnable) {
            this.getEventManager().addListener(
                PluginEnableEvent,
                this.onPluginEnable
            );
        }

        if (this.onPluginDisable) {
            this.getEventManager().addListener(
                PluginDisableEvent,
                this.onPluginDisable
            );
        }
    }

    getEventManager() {
        return this.eventManager;
    }

    getLogger() {
        return this.logger;
    }

    onPluginEnable?(): void;
    onPluginDisable?(): void;
}
