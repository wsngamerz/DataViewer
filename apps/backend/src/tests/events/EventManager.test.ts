import { EventManager } from '../../events/EventManager';
import { Event } from '../../events/Event';

describe('EventManager', () => {
    it('should work properly', (done) => {
        // create the event manager
        const manager = new EventManager();

        // create the test event
        class TestEvent extends Event<{ hello: string }> {}

        // add a listener for the test event
        manager.addListener(TestEvent, (e: TestEvent) => {
            // make sure that the name is correct
            expect(e.name).toBe('TestEvent');

            // make sure that the event data is correct
            expect(e.data).toStrictEqual({ hello: 'World' });
            done();
        });

        // emit the event
        manager.emit(new TestEvent({ hello: 'World' }));
    });

    it('should remove listeners correctly', (done) => {
        // create the event manager
        const manager = new EventManager();

        // create the test event
        class TestEvent extends Event<{ hello: string }> {}

        // create a test listener
        const listener = () => {
            done(`TestEvent emitted when it should have been removed`);
        };

        // remove it if it has never been added
        manager.removeListener(TestEvent, listener);

        // add it then remove it
        manager.addListener(TestEvent, listener);
        manager.removeListener(TestEvent, listener);

        // then we emit the event
        manager.emit(
            new TestEvent({
                hello: 'World',
            })
        );

        done();
    });
});
