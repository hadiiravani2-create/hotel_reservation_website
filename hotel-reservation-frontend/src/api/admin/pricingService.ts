// FILE: front/src/api/admin/pricingService.ts

import axios from 'axios';
import { BulkUpdatePricePayload, PricingCalendarData } from '@/types/pricing';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const pricingService = {
    // دریافت اطلاعات تقویم با فیلتر برد
    getCalendarRange: async (roomId: number, startDate: string, endDate: string, boardTypeId?: number) => {
        const params: any = {
            room: roomId,
            start_date: startDate,
            end_date: endDate
        };
        if (boardTypeId) params.board_type_id = boardTypeId;

        const response = await axios.get(`${API_URL}/pricing/api/inventory/calendar/`, { params });
	return response.data;
    },

    // آپدیت قیمت
    bulkUpdatePrice: async (data: BulkUpdatePricePayload) => {
        const response = await axios.post(`${API_URL}/api/pricing/bulk-update-price/`, data);
        return response.data;
    }
};
