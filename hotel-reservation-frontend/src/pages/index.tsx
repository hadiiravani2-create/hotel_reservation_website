// src/pages/index.tsx
import React from 'react';
import Header from '../components/Header';
import SearchForm from '../components/SearchForm';

const HomePage: React.FC = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="relative flex items-center justify-center h-[50vh] bg-gradient-to-tr from-blue-500 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold !text-white">
            بهترین هتل‌ها را پیدا کنید
          </h1>
          <p className="mt-4 text-lg text-slate-200">
            جستجوی آسان و رزرو سریع در سراسر ایران
          </p>
        </div>
      </main>

      {/* FIX: Changed container width to 80% and added vertical padding */}
      <div className="w-[80%] mx-auto -mt-24 z-20 relative py-15">
        <SearchForm />
      </div>
      
      {/* FIX: Changed container width to 80% */}
      <div className="w-[80%] mx-auto p-4 md:p-8 mt-10">
        <h2 className="text-3xl font-bold text-center mb-6">چرا ما را انتخاب کنید؟</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-primary-brand mb-2">پشتیبانی ۲۴/۷</h3>
                <p>تیم ما همیشه آماده پاسخگویی به سوالات شماست.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-primary-brand mb-2">بهترین قیمت‌ها</h3>
                <p>ما بهترین نرخ‌ها را برای اقامت شما تضمین می‌کنیم.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-primary-brand mb-2">رزرو آنی و مطمئن</h3>
                <p>فرآیند رزرو ساده، سریع و با امنیت بالا انجام می‌شود.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
