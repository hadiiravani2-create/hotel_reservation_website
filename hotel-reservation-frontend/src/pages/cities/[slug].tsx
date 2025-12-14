// src/pages/cities/[slug].tsx
// version: 1.0.2
// FIX: Added '/api' prefix to all endpoints to match Django URL configuration.

import { GetServerSideProps } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HotelCard from '@/components/HotelCard';
import AttractionCard from '@/components/attraction/AttractionCard';

import { getCityAttractions } from '@/api/attractionService';
import api from '@/api/coreService';
import { City, HotelSummary } from '@/types/hotel';
import { Attraction } from '@/types/attraction';

const CityMap = dynamic(() => import('@/components/map/CityMap'), { ssr: false });

interface CityPageProps {
    city: City;
    hotels: HotelSummary[];
    attractions: Attraction[];
}

const CityPage = ({ city, hotels, attractions }: CityPageProps) => {
    // Safety check for coordinates
    const lat = (city as any).latitude;
    const lng = (city as any).longitude;
    const cityCenter: [number, number] = (lat && lng) ? [lat, lng] : [35.6892, 51.3890];

    return (
        <div className="bg-gray-50 min-h-screen" dir="rtl">
            <Head>
                <title>سفر به {city.name} | رزرو هتل و جاهای دیدنی</title>
                <meta name="description" content={`راهنمای سفر به ${city.name}، لیست بهترین هتل‌ها و جاذبه‌های گردشگری ${city.name}`} />
            </Head>

            <Header />

            {/* Hero Section */}
            <div className="relative h-[300px] md:h-[400px] w-full">
                {city.image ? (
                    <img src={city.image} alt={city.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-blue-900 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">{city.name}</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
                    <div className="container mx-auto">
                        <h1 className="text-4xl font-bold text-white mb-2">{city.name}</h1>
                        <p className="text-white/90 text-lg max-w-2xl">{city.description}</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4 md:p-8 space-y-12">
                
                {/* 1. Map Section */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-8 bg-blue-600 rounded-full"></span>
                        نقشه گردشگری {city.name}
                    </h2>
                    <CityMap 
                        center={cityCenter} 
                        hotels={hotels} 
                        attractions={attractions} 
                    />
                </section>

                {/* 2. Hotels Section */}
                <section>
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-1 h-8 bg-orange-500 rounded-full"></span>
                            اقامت در {city.name}
                        </h2>
                        <a href={`/search?city=${city.slug}`} className="text-blue-600 hover:text-blue-800">
                            مشاهده همه هتل‌ها &larr;
                        </a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {hotels.slice(0, 4).map((hotel) => (
                            <HotelCard key={hotel.id} hotel={hotel} />
                        ))}
                        {hotels.length === 0 && <p className="text-gray-500">هتلی یافت نشد.</p>}
                    </div>
                </section>

                {/* 3. Attractions Section */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                        جاهای دیدنی {city.name}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {attractions.map((attraction) => (
                            <AttractionCard key={attraction.id} attraction={attraction} />
                        ))}
                        {attractions.length === 0 && <p className="text-gray-500">جاذبه‌ای ثبت نشده است.</p>}
                    </div>
                </section>

            </div>

            <Footer />
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { slug } = context.params as { slug: string };

    try {
        // FIX 1: Add '/api' prefix explicitly
        const cityRes = await api.get(`/api/hotels/cities/?search=${slug}`); 
        
        const cityData = cityRes.data.results ? cityRes.data.results : cityRes.data;
        const city = Array.isArray(cityData) ? cityData.find((c: any) => c.slug === slug) : cityData;

        if (!city) return { notFound: true };

        const [hotelsRes, attractions] = await Promise.all([
            // FIX 2: Add '/api' prefix explicitly here too
            api.get(`/api/hotels/?city=${city.id}`), 
            getCityAttractions(slug)
        ]);

        return {
            props: {
                city,
                hotels: hotelsRes.data.results || hotelsRes.data || [],
                attractions: attractions || [],
            }
        };
    } catch (error) {
        console.error("City Page Error:", error);
        return { notFound: true };
    }
};

export default CityPage;
