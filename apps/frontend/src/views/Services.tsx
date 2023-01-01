import DefaultLayout from '../components/layout/DefaultLayout';
import StatCard from '../components/StatCard';

import { getNavigationTree } from '../navigation';

export default function Services() {
    const navBreadcrumbs = ['DataViewer', 'Services'];
    const services = [
        {
            name: 'Facebook',
            description:
                'Data relating to your Facebook account which includes personal information, friends, posts and messages sent via Messenger.',
            colour: '#1877F2',
            stats: [
                { name: 'Friends', value: '915' },
                { name: 'Entries', value: '923K' },
                { name: 'Posts', value: '542' },
                { name: 'Messages', value: '822K' },
            ],
            textColour: null,
        },
        {
            name: 'Google',
            description:
                "Data relating to your Google account and it's many services such as YouTube, Calendar, Drive, Contacts, Fit, Photos and many more.",
            colour: '#EA4335',
            stats: [
                { name: 'Wntries', value: '915' },
                { name: 'Sub-services', value: '923K' },
                { name: 'Contacts', value: '542' },
                { name: 'Photos', value: '822K' },
            ],
            textColour: null,
        },
        {
            name: 'Discord',
            description:
                'Data relating to your Discord account which includes personal information, friends, messages and servers you participate in.',
            colour: '#5865F2',
            stats: [
                { name: 'Friends', value: '91' },
                { name: 'Entries', value: '570K' },
                { name: 'Guilds', value: '83' },
                { name: 'Messages', value: '12K' },
            ],
            textColour: null,
        },
        {
            name: 'Amazon',
            description:
                'Data relating to your Amazon account including personal information, Advertising data and Alexa data.',
            colour: '#FF9900',
            stats: [
                { name: 'Entries', value: '915' },
                { name: 'Orders', value: '923K' },
                { name: 'Searches', value: '542' },
                { name: 'Prime Video Watched', value: '822K' },
            ],
            textColour: 'text-black',
        },
        {
            name: 'Twitter',
            description:
                'Data relating to your Twitter account which includes followers, tweets and direct messages.',
            colour: '#1DA1F2',
            stats: [
                { name: 'Followers', value: '915' },
                { name: 'Entries', value: '923K' },
                { name: 'Tweets', value: '542' },
                { name: 'Messages', value: '822K' },
            ],
            textColour: null,
        },
    ];

    return (
        <DefaultLayout
            navItems={getNavigationTree('/app/services')}
            breadcrumbs={navBreadcrumbs}>
            {services.map((service) => (
                <div key={service.name} className="pb-4">
                    <StatCard
                        title={service.name}
                        description={service.description}
                        stats={service.stats}
                        colour={service.colour}
                        {...(service.textColour && {
                            textColour: service.textColour,
                        })}
                    />
                </div>
            ))}
        </DefaultLayout>
    );
}
