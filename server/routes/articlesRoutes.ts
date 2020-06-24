import { Router } from 'express';
import { articles } from '../controllers';

const router: Router = Router();

router.get('/articles', articles.findAll);
router.get('/articles/feed', articles.findFeed);
router.get('/articles/:slug', articles.findOne);
router.post('/articles', articles.create);
router.put('/articles/:slug', articles.update);
router.delete('/articles/:slug', articles.deleteArticle);
router.post('/articles/:slug/favorite', articles.favorite);
router.delete('/articles/:slug/favorite', articles.unFavorite);

/*
router.param('slug', articles.bySlug);
router.param('comment', articles.comments.byComment);

router.get('/articles', articles.get);
router.post('/articles', authMiddleware, articles.post);

router.get('/articles/feed', authMiddleware, articles.feed.get);

router.get('/articles/:slug', articles.getOne);
router.put('/articles/:slug', authMiddleware, articles.put);
router.delete('/articles/:slug', authMiddleware, articles.del);

router.post('/articles/:slug/favorite', authMiddleware, articles.favorite.post);
router.delete(
  '/articles/:slug/favorite',
  authMiddleware,
  articles.favorite.del
);

router.get('/articles/:slug/comments', articles.comments.get);
router.post('/articles/:slug/comments', authMiddleware, articles.comments.post);
router.delete(
  '/articles/:slug/comments/:comment',
  authMiddleware,
  articles.comments.del
);
*/

export default router;
