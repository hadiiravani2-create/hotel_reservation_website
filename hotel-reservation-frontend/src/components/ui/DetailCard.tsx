// src/components/ui/DetailCard.tsx
// version: 1.0.0
import React from 'react';

interface DetailCardProps {
    title: string;
    children: React.ReactNode;
    icon: React.ElementType;
}

export const DetailCard: React.FC<DetailCardProps> = ({ title, children, icon: Icon }) => (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
        <h2 className="flex items-center text-2xl font-bold mb-4 text-blue-700 border-b pb-2">
            <Icon className="w-6 h-6 ml-2 text-indigo-500" />
            {title}
        </h2>
        <div className="space-y-4">{children}</div>
    </div>
);
