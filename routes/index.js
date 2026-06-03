const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/', homeController.redirectToHome);
router.get('/trang-chu', homeController.getHome);
router.get('/lien-he', homeController.getDealers);
router.get('/tin-tuc', homeController.getNews);
router.get('/tin-tuc/:duong_dan', homeController.getNewsDetail);
router.post('/tin-tuc/:duong_dan/thich', homeController.likeNews);
router.post('/tin-tuc/:duong_dan/binh-luan', homeController.commentNews);
router.get('/xe/:duong_dan', homeController.getCarDetail);
router.get('/danh-sach-xe', homeController.getCarsPage);
router.get('/api/search-cars', homeController.searchCarsApi);
router.get('/bao-gia', homeController.getQuote);
router.post('/bao-gia', homeController.postQuote);
router.get('/dang-ky-lai-thu', homeController.getTestDrive);
router.post('/dang-ky-lai-thu', homeController.postTestDrive);

module.exports = router;
