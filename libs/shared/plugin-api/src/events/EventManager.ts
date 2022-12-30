import { Event } from './Event';

/**
 * The constructor of an event
 */
export interface IEventConstructor<T = any> {
    new (...args: T extends null ? [] : [T]): Event<T>;
}

/**
 * The event Handler type
 * describes the function that will be called on an event emit
 */
export type EventHandler<T = any> = (event: Event<T>) => void | Promise<void>;

/**
 * The Event Manager
 */
export class EventManager {
    /**
     * A map containing with key-value pairing of an event and an array of event listeners
     *
     * @private
     * @memberof EventManager
     */
    private listeners = new Map<IEventConstructor<any>, EventHandler[]>();

    /**
     * Emit an event
     * @param event The event to emit
     */
    public async emit(event: Event<any>): Promise<void> {
        // get the list of listeners for the event
        const listeners = this.getListeners(
            event.constructor as IEventConstructor
        ).slice(0);

        // for each listener, call the handler
        for (const listener of listeners) {
            await listener(event);
        }
    }

    /**
     * Add an event listener for a specified event
     * @param eventClass the event class
     * @param handler the handler to call when the event is emited
     * @returns EventManager
     */
    public addListener<T>(
        eventClass: IEventConstructor<T>,
        handler: EventHandler<T>
    ): EventManager {
        // get listeners for specific event
        const listeners = this.getListeners(eventClass);

        // add handler to that events listeners
        listeners.push(handler);

        return this;
    }

    /**
     * Gets the list of event handlers for a specific event
     * @param eventClass the class of the event
     * @returns EventHandler[]
     */
    public getListeners<T>(eventClass: IEventConstructor<T>) {
        // if doesn't include this event, add empty array to the listeners map for that event
        if (!this.listeners.has(eventClass)) {
            this.listeners.set(eventClass, []);
        }

        // return list of handlers
        return this.listeners.get(eventClass);
    }

    /**
     * Removes a specific event handler from an event class
     * @param eventClass the class of the event
     * @param handler the handler to remove from the event
     * @returns EventManager
     */
    public removeListener<T>(
        eventClass: IEventConstructor<T>,
        handler: EventHandler<T>
    ): EventManager {
        // get listeners for the event
        let listeners = this.getListeners(eventClass);

        // return early of there are no listeners to remove
        if (!listeners) return this;

        // filter the list of listeners, removing the specified listener if it exists
        // and then update the map of listeners for the event
        listeners = listeners.filter((l) => l !== handler);
        this.listeners.set(eventClass, listeners);

        return this;
    }

    public removeAllListeners(): EventManager {
        this.listeners.clear();
        return this;
    }
}
