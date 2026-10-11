import { queryOptions, useQuery } from '@tanstack/react-query';
import type {
  AnalyticsFilterParams,
  RefuelingAnalyticsResponseDto,
  ServicesAnalyticsResponseDto,
} from '../../../../api/_lib/analytics/types.js';

export function refuelingAnalyticsQueryOptions(params: AnalyticsFilterParams) {
  const queryStr = new URLSearchParams({
    vehicleId: params.vehicleId,
    ...(params.from ? { from: params.from } : {}),
    ...(params.to ? { to: params.to } : {}),
    ...(params.preset ? { preset: params.preset } : {}),
  }).toString();

  return queryOptions<RefuelingAnalyticsResponseDto>({
    queryKey: ['analytics', 'refueling', params.vehicleId, params.from, params.to, params.preset] as const,
    queryFn: async () => {
      const res = await fetch(`/api/analytics/refueling?${queryStr}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Failed to load refueling analytics (${res.status})`);
      }
      return res.json();
    },
    staleTime: 60 * 1000,
    networkMode: 'always',
  });
}

export function servicesAnalyticsQueryOptions(params: AnalyticsFilterParams) {
  const queryStr = new URLSearchParams({
    vehicleId: params.vehicleId,
    ...(params.from ? { from: params.from } : {}),
    ...(params.to ? { to: params.to } : {}),
    ...(params.preset ? { preset: params.preset } : {}),
  }).toString();

  return queryOptions<ServicesAnalyticsResponseDto>({
    queryKey: ['analytics', 'services', params.vehicleId, params.from, params.to, params.preset] as const,
    queryFn: async () => {
      const res = await fetch(`/api/analytics/services?${queryStr}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Failed to load services analytics (${res.status})`);
      }
      return res.json();
    },
    staleTime: 60 * 1000,
    networkMode: 'always',
  });
}

export function useRefuelingAnalytics(params: AnalyticsFilterParams) {
  return useQuery(refuelingAnalyticsQueryOptions(params));
}

export function useServicesAnalytics(params: AnalyticsFilterParams) {
  return useQuery(servicesAnalyticsQueryOptions(params));
}
