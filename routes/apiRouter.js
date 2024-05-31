const express = require('express');
const apiController = require('../controllers/apiController');
const apiRouter = express.Router();
const {removeVietnameseTones, renameFile} = require('../utils/util')

const multer = require('multer');
const storageDocument = multer.diskStorage({
    destination: function (req, file, cb) {
      // console.log("filedocument", file);
      cb(null, './uploads/documents/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      const cleanName = renameFile(file.originalname); 
      cb(null,uniqueSuffix + '-' + cleanName);
    }
  })
  
const upload = multer({ storage: storageDocument })

const storageImage = multer.diskStorage({
    destination: function (req, file, cb) {
      // console.log("fileimage", file);
      cb(null, './uploads/documentsImg/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      const cleanName = renameFile(file.originalname); 
      cb(null,uniqueSuffix + '-' + cleanName);
    }
  })
  
const upload1 = multer({ storage: storageImage })

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      if (file.fieldname == 'document') {
      console.log("filedocument", file);

          cb(null, './uploads/documents/');
      } else if (file.fieldname == 'documentImage') {
      console.log("fileimage", file);

          cb(null, './uploads/documentsImg/');
      }
  },
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      const cleanName = renameFile(file.originalname);
      cb(null, uniqueSuffix + '-' + cleanName);
  }
});

var uploadfield = multer({ storage: storage });
// const upload = multer({ dest: './public/data/documents/' });

//login logout
apiRouter.get('/user', apiController.getUser); 

apiRouter.post('/login', apiController.login);
apiRouter.post('/register', apiController.register);

apiRouter.get('/datas', apiController.getDatas); 
apiRouter.post('/data', apiController.createData);
apiRouter.put('/data', apiController.updateData);
apiRouter.delete('/data', apiController.deleteData);

apiRouter.get('/search', apiController.getSearch); 

// apiRouter.post('/document', uploadfield.fields([{ name: 'document-image', maxCount: 1 }, { name: 'document', maxCount: 1 }]), apiController.createDocument); 
// apiRouter.post('/document',function(req, res, next) {
//   console.log('Sử dụng middleware multer để xử lý việc tải lên tệp tin');
//   try {
//     var multerMiddleware = uploadfield.fields([{ name: 'documentImage', maxCount: 1 }, { name: 'document', maxCount: 1 }]);
//   console.log('Sử dụng middleware ', multerMiddleware);
    
//     multerMiddleware(req, res, function(err) {
//       if (err) {
//         console.error('Error in multer middleware:', err);
//         return res.status(500).json({ error: 'Error in multer middleware' });
//       }
//       console.log('Middleware multer has been applied successfully!');
//       // next();
//       apiController.createDocument(req, res);

//     });
//   } catch (error) {
//     console.error('Error in multer middleware initialization:', error);
//     return res.status(500).json({ error: 'Error in multer middleware initialization' });
//   }
  
// }); 

apiRouter.post('/document', apiController.createDocument); 
apiRouter.get('/documents', apiController.getDocuments); 
apiRouter.get('/document/:id', apiController.getDocument); 


// Xử lý yêu cầu tải ảnh lên
apiRouter.post('/uploadDocument', upload.single('document'), apiController.uploadDocumentFile);
apiRouter.post('/uploadDocumentImage', upload1.single('documentImage'), apiController.uploadDocumentImageFile);


module.exports = apiRouter;