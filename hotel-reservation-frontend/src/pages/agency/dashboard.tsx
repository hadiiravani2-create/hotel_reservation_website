// src/pages/agency/dashboard.tsx v0.0.3
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getAgencyReport, AgencyReportResponse } from '../../api/agencyService'; 


// REMOVED: interface AgencyReport { ... }

const AgencyDashboardPage: React.FC = () => {
    // Note: useAuth returns user: User | null. The User interface now has agency_role.
    // FIX: useAuth returns 'isLoading', not 'loading'
    const { isAuthenticated, user, isLoading: authLoading } = useAuth(); 
    const router = useRouter();

    // Check if user is an agency user (This check now works due to the User interface update)
    const isAgencyUser = user?.agency_role !== null;

    // Report query uses the correct AgencyReportResponse type
    const { data: report, isLoading: isReportLoading } = useQuery<AgencyReportResponse>({
        queryKey: ['agencyReport'],
        queryFn: getAgencyReport,
        enabled: isAuthenticated && isAgencyUser,
    });

    // Handle authentication and redirection
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login'); // Redirect unauthenticated users
        } else if (!authLoading && isAuthenticated && !isAgencyUser) {
            // Redirect non-agency users to a standard dashboard/homepage
            router.push('/'); 
        }
    }, [isAuthenticated, isAgencyUser, authLoading, router]);


    // Show loading while auth status is being determined or redirect logic runs
    if (authLoading || (isAuthenticated && !isAgencyUser)) {
        return (
            <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-100">
                <p>Loading user status...</p>
            </div>
        );
    }
    
    // Only proceed if authenticated and confirmed as an agency user
    if (!isAuthenticated || !isAgencyUser) {
        return null; // Should be handled by useEffect redirect, but good for safety
    }

    // Main Dashboard Content
    return (
        <div dir="rtl" className="min-h-screen bg-gray-100">
            <div className="shadow-md bg-white">
                <Header /> 
            </div>
            
            <main className="container mx-auto p-4 md:p-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">
                    {/* FIX: Use non-null assertion operator (!) on 'user' to resolve Type Error */}
                    Agency Dashboard - {user!.username}
                </h1>
                
                {isReportLoading ? (
                    <p>Loading agency report...</p>
                ) : report ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Example Report Card - These properties now exist on AgencyReportResponse */}
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-lg font-semibold text-gray-600">Total Bookings</h2>
                            <p className="text-4xl font-extrabold text-blue-600 mt-2">{report.total_bookings}</p>
                        </div>
                        {/* Add more cards for other metrics */}
                    </div>
                ) : (
                    <p className="text-gray-500">Could not load agency report data.</p>
                )}
            </main>
        </div>
    );
};

export default AgencyDashboardPage;
