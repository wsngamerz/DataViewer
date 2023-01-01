import { IconDefinition, faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Brand from '../Brand';
import Breadcrumbs from '../Breadcrumbs';
import SidebarItem from './SidebarItem';

const NavigationToggle = () => (
    <button
        type="button"
        className="text-gray-500 hover:text-gray-600"
        data-hs-overlay="#application-sidebar"
        aria-controls="application-sidebar"
        aria-label="Toggle navigation">
        <span className="sr-only">Toggle Navigation</span>
        <FontAwesomeIcon className="w-4 h-4" icon={faBars} />
    </button>
);

export type SidebarRoute = {
    name: string;
    path?: string;
    icon: IconDefinition;
    active: boolean;
    children?: SidebarRoute[];
};

export type SidebarProps = {
    items: SidebarRoute[];
    breadcrumbs: string[];
};

export default function Sidebar(props: SidebarProps) {
    return (
        <div>
            {/* Sidebar Toggle */}
            <div className="sticky top-0 inset-x-0 z-20 bg-white border-y px-4 sm:px-6 md:px-8 lg:hidden dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center py-4">
                    <NavigationToggle />
                    <Breadcrumbs items={props.breadcrumbs} />
                </div>
            </div>
            {/* End Sidebar Toggle */}

            {/* Sidebar */}
            <div
                id="application-sidebar"
                className="hs-overlay hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform hidden fixed top-0 left-0 bottom-0 z-[60] w-64 bg-white border-r border-gray-200 pt-7 pb-10 overflow-y-auto scrollbar-y lg:block lg:translate-x-0 lg:right-auto lg:bottom-0 dark:scrollbar-y dark:bg-gray-800 dark:border-gray-700">
                <div className="px-6 text-center">
                    <a
                        className="flex-none text-xl font-semibold dark:text-white"
                        href="/app"
                        aria-label="Brand">
                        <Brand monochrome={true} />
                    </a>
                </div>

                <nav
                    className="hs-accordion-group p-6 w-full flex flex-col flex-wrap"
                    data-hs-accordion-always-open>
                    <ul className="space-y-1.5">
                        {props.items.map((navItem) => (
                            <SidebarItem
                                key={navItem.name}
                                name={navItem.name}
                                active={navItem.active}
                                children={navItem.children}
                                path={navItem.path}
                                icon={navItem.icon}
                            />
                        ))}
                    </ul>
                </nav>
            </div>
            {/* End Sidebar */}
        </div>
    );
}
