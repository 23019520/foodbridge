import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getListings, getListing, getMyListings, createListing, updateListing, deleteListing } from '@/services/listings.service';
import { ListingFilters, CreateListingInput } from '@/types/listing.types';

export const useListings = (filters: ListingFilters = {}) => {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => getListings(filters),
  });
};

export const useListing = (id: string) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListing(id),
    enabled: !!id,
  });
};

export const useMyListings = () => {
  return useQuery({
    queryKey: ['my-listings'],
    queryFn: getMyListings,
  });
};

export const useCreateListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateListingInput) => createListing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateListingInput> }) =>
      updateListing(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
};
