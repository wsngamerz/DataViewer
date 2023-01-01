import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

import { ReactComponent as GoogleLogo } from '../assets/Google_Logo.svg';
import { ReactComponent as FacebookLogo } from '../assets/Facebook_Logo.svg';
import { ReactComponent as InstagramLogo } from '../assets/Instagram_Logo.svg';
import { ReactComponent as DiscordLogo } from '../assets/Discord_Logo.svg';
import { ReactComponent as SkypeLogo } from '../assets/Skype_Logo.svg';
import { ReactComponent as AmazonLogo } from '../assets/Amazon_Logo.svg';
import { ReactComponent as SpotifyLogo } from '../assets/Spotify_Logo.svg';

export default function Home() {
    return (
        <>
            <section className="w-full px-3 bg-emerald-500 lg:px-6">
                <div className="mx-auto max-w-7xl">
                    <Navigation />

                    {/* Hero Heading */}
                    <div className="container py-32 mx-auto text-center sm:px-4">
                        <h1 className="text-6xl font-extrabold leading-10 tracking-tight text-white sm:leading-none md:text-8xl lg:m-0">
                            DataViewer
                        </h1>
                        <div className="my-8 max-w-lg mx-auto text-lg text-center text-emerald-100 sm:text-xl md:max-w-xl xl:text-2xl">
                            A powerful software solution for visualising data
                            exports from popular 3rd party services.
                        </div>
                    </div>
                </div>
            </section>

            {/* Services section */}
            <section className="container mx-auto py-8 text-center">
                <div className="my-8">
                    <h2 className="text-xl font-extrabold leading-10 tracking-tight sm:text-2xl sm:leading-none md:text-3xl xl:text-4xl">
                        Import From Your Favourite Services.
                    </h2>
                    <span className="font-lighter text-gray-700">
                        We've built integrations with some of your favourite
                        services. Check them out below
                    </span>
                </div>

                {/* Grid of some supported services */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mx-4 sm:mx-8 md:mx-16 lg:mx-24 xl:mx-36 mb-8">
                    {[
                        { name: 'Google', icon: GoogleLogo },
                        { name: 'Facebook', icon: FacebookLogo },
                        { name: 'Instagram', icon: InstagramLogo },
                        { name: 'Discord', icon: DiscordLogo },
                        { name: 'Skype', icon: SkypeLogo },
                        { name: 'Amazon', icon: AmazonLogo },
                        { name: 'Spotify', icon: SpotifyLogo },
                        { name: 'Many more...', icon: '' },
                    ].map((service) => (
                        <div
                            key={service.name}
                            className="p-4 text-center bg-white rounded-md flex flex-col items-center drop-shadow-sm">
                            {service.icon && (
                                <service.icon width={96} height={96} />
                            )}
                            <span className="font-bold mt-2">
                                {service.name}
                            </span>
                        </div>
                    ))}
                </div>

                <button className="border border-emerald-500 bg-emerald-500 text-white rounded-md px-8 py-2 m-2 hover:bg-emerald-600">
                    View All Integrations
                </button>
            </section>

            <Footer />
        </>
    );
}
