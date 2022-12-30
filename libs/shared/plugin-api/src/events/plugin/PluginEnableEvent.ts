import { Event } from '../Event';

export class PluginEnableEvent extends Event<{
    name: string;
    displayName: string;
    version: string;
}> {}
