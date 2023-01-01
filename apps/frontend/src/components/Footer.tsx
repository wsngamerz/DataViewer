import Brand from './Brand';

import { ReactComponent as GitHubLogo } from '../assets/GitHub_Logo.svg';

export default function Footer() {
    return (
        <footer className="bg-white">
            <div className="container mx-auto py-8 px-4 flex items-center">
                <Brand monochrome={true} />
                <span className="flex-grow text-gray-700 font-light mx-2">
                    &copy; William Neild 2022
                </span>
                <a href="https://github.com/wsngamerz/DataViewer">
                    <GitHubLogo width={24} height={24} />
                </a>
            </div>
        </footer>
    );
}
