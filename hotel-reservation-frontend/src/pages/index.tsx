// hotel-reservation-frontend/src/pages/index.tsx
// نسخه به‌روز شده برای افزودن کامپوننت هتل‌های پیشنهادی

import Header from "../components/Header";
import SearchForm from "../components/SearchForm";
import Footer from "../components/Footer";
import SuggestedHotels from "../components/SuggestedHotels"; // NEW IMPORT

export default function Home() {
    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <Header />
            <main className="container mx-auto p-4 flex-grow">
                {/* سکشن جستجو در بالای صفحه */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    {" "}
                    {/* ADDED mb-8 for separation */}
                    <h1 className="text-3xl font-bold mb-4 text-center">
                        بهترین هتل را برای اقامت خود پیدا کنید
                    </h1>
                    <SearchForm />
                </div>

                {/* سکشن جدید هتل‌های پیشنهادی (Suggested Hotels) */}
                <SuggestedHotels />
            </main>
            <Footer />
        </div>
    );
}

// توضیحات حذف شده: getServerSideProps و وارد کردن‌های مربوطه.
