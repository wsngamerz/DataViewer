import { Event } from '../Event';

export class PluginDisableEvent extends Event<{
    name: string;
    displayName: string;
    version: string;
}> {}
