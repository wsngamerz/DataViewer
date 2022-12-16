import { render } from '@testing-library/react';

import PluginFacebookUi from './plugin-facebook-ui';

describe('PluginFacebookUi', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<PluginFacebookUi />);
        expect(baseElement).toBeTruthy();
    });
});
