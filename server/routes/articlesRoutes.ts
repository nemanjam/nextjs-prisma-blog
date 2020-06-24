import { Router } from 'express';
import { articles } from '../controllers';

const router: Router = Router();

// get
router.get('/articles', articles.findAll);
router.get('/articles/feed', articles.findFeed);
router.get('/articles/:slug', articles.findOne);

// crud
router.post('/articles', articles.create);
router.put('/articles/:slug', articles.update);
router.delete('/articles/:slug', articles.deleteArticle);

// fav unfav
router.post('/articles/:slug/favorite', articles.favorite);
router.delete('/articles/:slug/favorite', articles.unFavorite);

// comments
router.get('/articles/:slug/comments', articles.findComments);
router.post('/articles/:slug/comments', articles.addComment);
router.delete('/articles/:slug/comments/:id', articles.deleteComment);

export default router;
