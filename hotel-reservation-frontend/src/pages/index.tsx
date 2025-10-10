// hotel-reservation-frontend/src/pages/index.tsx
// version: 1.0.0

import Header from "../components/Header";
import SearchForm from "../components/SearchForm";
import Footer from "../components/Footer"; // Import the Footer component
import { GetServerSideProps } from "next";
import { getSiteSettings } from "../api/coreService";
import { SiteSettings } from "../types/hotel";

interface HomeProps {
    settings: SiteSettings | null;
}

export default function Home({ settings }: HomeProps) {
    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <Header settings={settings} />
            <main className="container mx-auto p-4 flex-grow">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold mb-4 text-center">
                        بهترین هتل را برای اقامت خود پیدا کنید
                    </h1>
                    <SearchForm />
                </div>
            </main>
            <Footer /> {/* Add the Footer component here */}
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    try {
        const settings = await getSiteSettings();
        return {
            props: {
                settings,
            },
        };
    } catch (error) {
        console.error("Failed to fetch site settings:", error);
        return {
            props: {
                settings: null,
            },
        };
    }
};
