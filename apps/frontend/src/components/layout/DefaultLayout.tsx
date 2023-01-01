import React from 'react';

import Sidebar from '../sidebar';
import { SidebarRoute } from '../sidebar/Sidebar';

type DefaultLayoutProps = {
    navItems: SidebarRoute[];
    breadcrumbs: string[];
    children: React.ReactNode;
};

export default function DefaultLayout(props: DefaultLayoutProps) {
    return (
        <>
            <Sidebar items={props.navItems} breadcrumbs={props.breadcrumbs} />

            <div className="w-full pt-10 px-4 sm:px-6 md:px-8 lg:pl-72">
                {props.children}
            </div>
        </>
    );
}
