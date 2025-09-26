// src/pages/index.tsx
import React from 'react';
import Header from '../components/Header'; // نمایش تنظیمات سایت (گام ۱)
import SearchForm from '../components/SearchForm'; // فرم جستجوی اصلی (گام ۳)

const HomePage: React.FC = () => {
  return (
    // از dir="rtl" و Tailwind Layouts استفاده می‌کنیم
    <div dir="rtl" className="min-h-screen bg-gray-50 pb-16">
      
      {/* 1. هدر اصلی (که تنظیمات سایت را واکشی می‌کند) */}
      <div className="shadow-md bg-white">
        <Header /> 
      </div>
      
      {/* 2. بخش اصلی و فرم جستجو */}
      <main className="container mx-auto p-4 md:p-8">
        <div className="mt-10">
            {/* فرم جستجو که هسته پروژه است */}
            <SearchForm />
        </div>
      </main>
      
      {/* می‌توانید فوتر یا سایر بخش‌ها را در اینجا اضافه کنید */}
    </div>
  );
};

export default HomePage;