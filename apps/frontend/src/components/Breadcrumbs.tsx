import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type BreadcrumbsProps = {
    items: string[];
};

export default function Breadcrumbs(props: BreadcrumbsProps) {
    return (
        <ol
            className="ml-3 flex items-center whitespace-nowrap min-w-0"
            aria-label="Breadcrumb">
            {props.items.map((item, index) => {
                return index !== props.items.length - 1 ? (
                    <li
                        key={item}
                        className="flex items-center text-sm text-gray-800 dark:text-gray-400">
                        {item}
                        <FontAwesomeIcon
                            className="flex-shrink-0 mx-3 overflow-visible h-2.5 w-2.5 text-gray-400 dark:text-gray-600"
                            icon={faChevronRight}
                        />
                    </li>
                ) : (
                    <li
                        key={item}
                        className="text-sm font-semibold text-gray-800 truncate dark:text-gray-400"
                        aria-current="page">
                        {item}
                    </li>
                );
            })}
        </ol>
    );
}
