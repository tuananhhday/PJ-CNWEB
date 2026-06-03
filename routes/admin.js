const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/', adminController.redirectToXe);
router.get('/yeu-cau', adminController.getRequests);
router.post('/yeu-cau/:loai/:id/cap-nhat', adminController.updateRequest);
router.post('/yeu-cau/:loai/:id/xoa', adminController.deleteRequest);
router.get('/xe', adminController.getCars);
router.post('/xe/them', adminController.addCar);
router.post('/xe/:id/sua', adminController.editCar);
router.post('/xe/:id/xoa', adminController.deleteCar);
router.get('/panel', adminController.getPanels);
router.post('/panel/them', adminController.addPanel);
router.post('/panel/:id/sua', adminController.editPanel);
router.post('/panel/:id/xoa', adminController.deletePanel);
router.get('/dai-ly', adminController.getDealers);
router.post('/dai-ly/them', adminController.addDealer);
router.post('/dai-ly/:id/sua', adminController.editDealer);
router.post('/dai-ly/:id/xoa', adminController.deleteDealer);
router.get('/tin-tuc', adminController.getNews);
router.post('/tin-tuc/them', adminController.addNews);
router.post('/tin-tuc/:id/sua', adminController.editNews);
router.post('/tin-tuc/:id/xoa', adminController.deleteNews);
router.post('/binh-luan/:id/an', adminController.hideComment);

// Quan ly bo anh 360 do (rieng biet)
router.get('/anh-360', adminController.getAnh360);
router.post('/anh-360/them', adminController.addAnh360Set);
router.post('/anh-360/:id/sua', adminController.editAnh360Set);
router.post('/anh-360/:id/xoa', adminController.deleteAnh360Set);
router.get('/api/bo-anh-360', adminController.getAnh360ApiAll);
router.post('/api/upload-images', adminController.uploadImages360);

module.exports = router;
