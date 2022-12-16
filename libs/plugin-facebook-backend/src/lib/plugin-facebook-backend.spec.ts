import { pluginFacebookBackend } from './plugin-facebook-backend';

describe('pluginFacebookBackend', () => {
    it('should work', () => {
        expect(pluginFacebookBackend()).toEqual('plugin-facebook-backend');
    });
});
