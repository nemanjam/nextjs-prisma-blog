import { Router } from 'express';
import articlesRoutes from './articlesRoutes';

const router: Router = Router();

router.use(articlesRoutes);

// fallback 404
router.use('/', (req, res) => res.status(404).json('No route for this path'));

export default router;
