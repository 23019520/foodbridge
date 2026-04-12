import api from './api';
import { Listing, CreateListingInput, ListingFilters } from '@/types/listing.types';
import { PaginationMeta } from '@/types/api.types';

export const getListings = async (
  filters: ListingFilters = {}
): Promise<{ listings: Listing[]; meta: PaginationMeta }> => {
  const res = await api.get('/listings', { params: filters });
  return res.data.data;
};

export const getListing = async (id: string): Promise<Listing> => {
  const res = await api.get(`/listings/${id}`);
  return res.data.data.listing;
};

export const getMyListings = async (): Promise<Listing[]> => {
  const res = await api.get('/listings/mine/all');
  return res.data.data.listings;
};

export const createListing = async (data: CreateListingInput): Promise<Listing> => {
  const res = await api.post('/listings', data);
  return res.data.data.listing;
};

export const updateListing = async (
  id: string,
  data: Partial<CreateListingInput>
): Promise<Listing> => {
  const res = await api.patch(`/listings/${id}`, data);
  return res.data.data.listing;
};

export const deleteListing = async (id: string): Promise<void> => {
  await api.delete(`/listings/${id}`);
};
