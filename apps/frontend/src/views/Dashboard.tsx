import DefaultLayout from '../components/layout/DefaultLayout';
import StatCard from '../components/StatCard';

import { getNavigationTree } from '../navigation';

export default function Dashboard() {
    const navBreadcrumbs = ['DataViewer', 'Dashboard'];

    const stats = [
        { name: 'Services', value: '12' },
        { name: 'Entries', value: '41.6K' },
        { name: 'Imports', value: '179' },
        { name: 'Size', value: '12.42GB' },
    ];

    return (
        <DefaultLayout
            navItems={getNavigationTree('/app')}
            breadcrumbs={navBreadcrumbs}>
            <StatCard
                title="Metrics"
                description="General statistics on data that has been imported and processed by DataViewer."
                stats={stats}
            />
        </DefaultLayout>
    );
}
