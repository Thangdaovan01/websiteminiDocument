const express = require('express');
const webController = require('../controllers/webController');
const webRouter = express.Router();

webRouter.get('/', webController.getHomepage);
webRouter.get('/document', webController.getDocument);
// webRouter.get('/documentFilename', webController.getDocumentFilename);
webRouter.get('/document/:id', webController.getDocumentFilename);
webRouter.get('/login-register', webController.getLoginPage);

module.exports = webRouter;  