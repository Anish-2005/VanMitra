// src/hooks/use-claims.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClaimsService } from '@/services/claims';
import { Claim } from '@/types/api';

export function useClaims(status?: string) {
  return useQuery({
    queryKey: ['claims', status],
    queryFn: () => ClaimsService.getAllClaims(status),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useClaimsCount() {
  return useQuery({
    queryKey: ['claims-count'],
    queryFn: () => ClaimsService.getClaimsCount(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (claimData: Omit<Claim, 'claim_id' | 'created_at' | 'updated_at'>) =>
      ClaimsService.createClaim(claimData),
    onSuccess: () => {
      // Invalidate and refetch claims
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['claims-count'] });
    },
  });
}