import { queryOptions } from '@tanstack/react-query';
import { data } from '@/data/client';

export const vehiclesQueryOptions = () =>
  queryOptions({
    queryKey: ['vehicles'] as const,
    queryFn: () => data.getVehicles(),
    staleTime: Infinity,
    networkMode: 'always',
  });

export const vehicleDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['vehicles', id] as const,
    queryFn: () => data.getVehicle(id),
    staleTime: Infinity,
    networkMode: 'always',
  });

export const entriesQueryOptions = (vehicleId?: string) =>
  queryOptions({
    queryKey: ['entries', vehicleId] as const,
    queryFn: () => data.getEntries(vehicleId),
    staleTime: Infinity,
    networkMode: 'always',
  });

export const notesQueryOptions = (subjectType: string, subjectId: string) =>
  queryOptions({
    queryKey: ['notes', subjectType, subjectId] as const,
    queryFn: () => data.getNotes(subjectType, subjectId),
    staleTime: Infinity,
    networkMode: 'always',
  });

export const remindersQueryOptions = (vehicleId?: string) =>
  queryOptions({
    queryKey: ['reminders', vehicleId] as const,
    queryFn: () => data.getReminders(vehicleId),
    staleTime: Infinity,
    networkMode: 'always',
  });
