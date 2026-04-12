import { Router } from 'express';
import {
  getListings,
  getListing,
  getMyListings,
  addListing,
  editListing,
  deleteListing,
} from '../controllers/listings.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { authorise } from '../middleware/authorise';
import { CreateListingSchema, UpdateListingSchema } from '../schemas/listing.schemas';

const router = Router();

// Public
router.get('/', getListings);
router.get('/:id', getListing);

// Producer only
router.get('/mine/all', authenticate, authorise('producer'), getMyListings);
router.post('/', authenticate, authorise('producer', 'admin'), validate(CreateListingSchema), addListing);
router.patch('/:id', authenticate, authorise('producer', 'admin'), validate(UpdateListingSchema), editListing);
router.delete('/:id', authenticate, authorise('producer', 'admin'), deleteListing);

export default router;
