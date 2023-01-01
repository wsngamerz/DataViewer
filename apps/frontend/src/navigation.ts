import {
    faAmazon,
    faDiscord,
    faFacebook,
    faGoogle,
    faTwitter,
} from '@fortawesome/free-brands-svg-icons';
import {
    faGear,
    faHome,
    faList,
    faTableCells,
    faUpload,
} from '@fortawesome/free-solid-svg-icons';

const navigationTree = [
    {
        name: 'Dashboard',
        path: '/app',
        icon: faHome,
        active: false,
    },
    {
        name: 'Services',
        children: [
            {
                name: 'All',
                path: '/app/services',
                icon: faList,
                active: false,
            },
            {
                name: 'Facebook',
                path: '/app/services/facebook',
                icon: faFacebook,
                active: false,
            },
            {
                name: 'Google',
                path: '/app/services/google',
                icon: faGoogle,
                active: false,
            },
            {
                name: 'Discord',
                path: '/app/services/discord',
                icon: faDiscord,
                active: false,
            },
            {
                name: 'Amazon',
                path: '/app/services/amazon',
                icon: faAmazon,
                active: false,
            },
            {
                name: 'Twitter',
                path: '/app/services/twitter',
                icon: faTwitter,
                active: false,
            },
        ],
        icon: faTableCells,
        active: false,
    },
    {
        name: 'Upload',
        path: '/app/upload',
        icon: faUpload,
        active: false,
    },
    {
        name: 'Settings',
        path: '/app/settings',
        icon: faGear,
        active: false,
    },
];

export function getNavigationTree(activePath: string) {
    return navigationTree;
}
