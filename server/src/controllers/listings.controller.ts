import { Request, Response, NextFunction } from 'express';
import {
  createListing,
  findListings,
  findListingById,
  findListingsByProducer,
  updateListing,
  softDeleteListing,
} from '../models/listing.model';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/apiResponse';
import { getPagination, buildPaginationMeta } from '../utils/pagination';

export const getListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset } = getPagination(req.query as Record<string, unknown>);
    const { category, search, minPrice, maxPrice, location, sortBy } = req.query as Record<string, string>;

    const { rows, total } = await findListings({
      category,
      search,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      location,
      sortBy,
      limit,
      offset,
    });

    sendSuccess(res, { listings: rows, meta: buildPaginationMeta(total, page, limit) });
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = await findListingById(req.params.id);
    if (!listing) throw new AppError('Listing not found.', 404);
    sendSuccess(res, { listing });
  } catch (error) {
    next(error);
  }
};

export const getMyListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listings = await findListingsByProducer(req.user!.userId);
    sendSuccess(res, { listings });
  } catch (error) {
    next(error);
  }
};

export const addListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = await createListing(req.user!.userId, req.body);
    sendSuccess(res, { listing }, 201, 'Listing created successfully!');
  } catch (error) {
    next(error);
  }
};

export const editListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = await updateListing(req.params.id, req.user!.userId, req.body);
    if (!listing) throw new AppError('Listing not found or you do not have permission to edit it.', 404);
    sendSuccess(res, { listing }, 200, 'Listing updated.');
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await softDeleteListing(req.params.id, req.user!.userId);
    if (!deleted) throw new AppError('Listing not found or you do not have permission to delete it.', 404);
    sendSuccess(res, null, 200, 'Listing removed.');
  } catch (error) {
    next(error);
  }
};
