/**
 * An event
 */
export class Event<T = null> {
    /**
     * The data that is stored with the event
     *
     * @type {T} the data ts type
     * @memberof Event
     */
    public data: T;

    /**
     * The constructor stores the data
     * @param args
     */
    constructor(...args: T extends null ? [] : [T]) {
        if (args[0] !== undefined) {
            this.data = args[0];
        }
    }

    /**
     * Returns the name of the event
     *
     * @readonly
     * @memberof Event
     */
    get name() {
        return this.constructor.name;
    }
}
