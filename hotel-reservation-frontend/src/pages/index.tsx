// hotel-reservation-frontend/src/pages/index.tsx
// version: 2.0.0

import Header from "../components/Header";
import SearchForm from "../components/SearchForm";
import Footer from "../components/Footer"; // Import the Footer component

// Since Header component now fetches settings internally via useQuery (v0.0.3), 
// we remove unnecessary getServerSideProps logic and SiteSettings dependency.

export default function Home() {
    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <Header />
            <main className="container mx-auto p-4 flex-grow">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold mb-4 text-center">
                        بهترین هتل را برای اقامت خود پیدا کنید
                    </h1>
                    <SearchForm />
                </div>
            </main>
            <Footer />
        </div>
    );
}
// Removed getServerSideProps as settings fetching is now handled client-side in the Header component.
// Removed imports: GetServerSideProps, getSiteSettings, SiteSettings.
