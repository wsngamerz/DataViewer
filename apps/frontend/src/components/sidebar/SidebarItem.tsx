import {
    faChevronDown,
    faChevronUp,
    IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type SidebarItemProps = {
    name: string;
    children?: SidebarItemProps[];
    active: boolean;
    path?: string;
    icon?: IconDefinition;
};

export default function SidebarItem({
    name,
    children,
    active,
    path,
    icon,
}: SidebarItemProps) {
    const isDropdown = children !== undefined;

    return (
        <li className={`select-none ${isDropdown && 'hs-accordion'}`}>
            <a
                className={`flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-slate-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-slate-400 dark:hover:text-slate-300 ${
                    active && 'bg-gray-100 dark:bg-gray-900 dark:text-white'
                } ${
                    isDropdown &&
                    'hs-accordion-toggle hs-accordion-active:text-blue-600 hs-accordion-active:hover:bg-transparent dark:bg-gray-800 dark:hs-accordion-active:text-white'
                }`}
                href={path}>
                {icon && <FontAwesomeIcon className="w-4 h-4" icon={icon} />}
                {name}
                {isDropdown && (
                    <span className="ml-auto text-gray-600 group-hover:text-gray-500 dark:text-gray-400">
                        <FontAwesomeIcon
                            className="hs-accordion-active:block hidden w-3 h-3"
                            icon={faChevronUp}
                        />

                        <FontAwesomeIcon
                            className="hs-accordion-active:hidden block w-3 h-3"
                            icon={faChevronDown}
                        />
                    </span>
                )}
            </a>

            {isDropdown && (
                <div className="hs-accordion-content w-full overflow-hidden transition-[height] duration-300 hidden">
                    <ul className="pt-2 pl-2">
                        {children.map((child) => (
                            <SidebarItem
                                key={child.name}
                                name={child.name}
                                active={child.active}
                                children={child.children}
                                path={child.path}
                                icon={child.icon}
                            />
                        ))}
                    </ul>
                </div>
            )}
        </li>
    );
}
