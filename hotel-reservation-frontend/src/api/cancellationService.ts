// src/api/cancellationService.ts
// version: 1.0.0
// FEATURE: Initial API service for managing cancellation policies, rules, and special periods.

import api from './coreService'; // Import the configured axios instance
import { CancellationPolicy, CancellationRule } from '@/types/hotel';

// --- Types specific to this service ---

/**
 * Represents a Special Period (e.g., peak season).
 * Based on core.serializers.SpecialPeriodSerializer
 */
export interface SpecialPeriod {
  id: number;
  name: string;
  start_date: string; // ISO Date string (e.g., "2025-03-21")
  end_date: string; // ISO Date string
}

// Partial types for Create/Update payloads (ID is not required on create)
type SpecialPeriodPayload = Omit<SpecialPeriod, 'id'>;
type CancellationPolicyPayload = Omit<CancellationPolicy, 'id' | 'rules'>;
type CancellationRulePayload = Omit<CancellationRule, 'id'> & { policy: number }; // Rules need a policy ID

// --- Special Periods API (api/special-periods/) ---

export const getSpecialPeriods = async (): Promise<SpecialPeriod[]> => {
  const response = await api.get('/api/special-periods/');
  return response.data;
};

export const createSpecialPeriod = async (data: SpecialPeriodPayload): Promise<SpecialPeriod> => {
  const response = await api.post('/api/special-periods/', data);
  return response.data;
};

export const updateSpecialPeriod = async (id: number, data: SpecialPeriodPayload): Promise<SpecialPeriod> => {
  const response = await api.put(`/api/special-periods/${id}/`, data);
  return response.data;
};

export const deleteSpecialPeriod = async (id: number): Promise<void> => {
  await api.delete(`/api/special-periods/${id}/`);
};

// --- Cancellation Policies API (api/cancellations/policies/) ---

export const getCancellationPolicies = async (): Promise<CancellationPolicy[]> => {
  const response = await api.get('/api/cancellations/policies/');
  return response.data;
};

export const createCancellationPolicy = async (data: CancellationPolicyPayload): Promise<CancellationPolicy> => {
  const response = await api.post('/api/cancellations/policies/', data);
  return response.data;
};

export const updateCancellationPolicy = async (id: number, data: CancellationPolicyPayload): Promise<CancellationPolicy> => {
  const response = await api.put(`/api/cancellations/policies/${id}/`, data);
  return response.data;
};

export const deleteCancellationPolicy = async (id: number): Promise<void> => {
  await api.delete(`/api/cancellations/policies/${id}/`);
};

// --- Cancellation Rules API (api/cancellations/rules/) ---
// (Usually rules are managed nested under a policy, but separate endpoints are available)

export const createCancellationRule = async (data: CancellationRulePayload): Promise<CancellationRule> => {
  const response = await api.post('/api/cancellations/rules/', data);
  return response.data;
};

export const updateCancellationRule = async (id: number, data: CancellationRulePayload): Promise<CancellationRule> => {
  const response = await api.put(`/api/cancellations/rules/${id}/`, data);
  return response.data;
};

export const deleteCancellationRule = async (id: number): Promise<void> => {
  await api.delete(`/api/cancellations/rules/${id}/`);
};
