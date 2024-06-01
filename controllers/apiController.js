const express = require('express');
const { generateToken, decodeToken } = require('../middleware/authentication');
const { config } = require('../config/config.js');
const pdf = require('pdf-parse');
const pathA = require('path');
const elasticsearch = require('elasticsearch')
const client = new elasticsearch.Client({
    host: 'localhost:9200'
});

const fs = require('fs');
const path = require('path');

async function checkElasticsearchConnection() {
    try { 
        // Gửi yêu cầu ping đến Elasticsearch
        const body = await client.ping();
        console.log('Kết nối với Elasticsearch thành công:', body);
    } catch (error) {
        console.error('Lỗi khi kết nối đến Elasticsearch:', error);
    }
}

// Gọi hàm kiểm tra kết nối
checkElasticsearchConnection();


const User = require('../models/User')
const Data = require('../models/Data')

const login = async (req, res) => {
    try {
        const account = req.body;

        if (!account.user_name || !account.password) {
            return res.status(400).json({ message: 'Account không nhận được ở phía Server' })
        }

        const checkIndex = await client.indices.exists({
            index: 'users'  // Tên của index cần kiểm tra
        });

        if(checkIndex){
            const checkUsername = await client.search({
                index: 'users',  // Tên của index
                body: {
                    query: {
                        term: {
                            username: account.user_name  // Trường và giá trị cần tìm
                        }
                    }
                }
            });
            const checkUsernameValueNum = checkUsername.hits.total.value;
            const checkUsernameValue = checkUsername.hits.hits;
            // console.log("checkUsername",checkUsernameValue[0]._source);

            if(checkUsernameValueNum == 0){
                return res.status(400).json({ message: 'Username không tồn tại trong hệ thống' }); // user_name đã tồn tại
            } else {
                if(checkUsernameValue[0]._source.password !== account.password){
                    return res.status(400).json({ message: 'Mật khẩu không đúng' });
                } else {
                    console.log("Đăng nhập thành công");

                    const token = generateToken(account);
                    return res.status(200).json({ message: 'Đăng nhập thành công', token: token });
                }
            }
        } else {
            return res.status(400).json({ message: 'Username không tồn tại trong hệ thống' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}
 
const register = async (req, res) => {
    try {
        const account = req.body;
        if (!account.fullname || !account.user_name || !account.password) {
            return res.status(400).json({ message: 'Thông tin tài khoản đăng kí không được gửi đầy đủ về phía server' });
        }

        const checkIndex = await client.indices.exists({
            index: 'users'  // Tên của index cần kiểm tra
        });

        if(checkIndex){
            const checkUsername = await client.search({
                index: 'users',  // Tên của index
                body: {
                    query: {
                        term: {
                            username: account.user_name  // Trường và giá trị cần tìm
                        }
                    }
                }
            });
            console.log("checkUsername", account.user_name, checkUsername.hits.total.value)
            const checkUsernameValue = checkUsername.hits.total.value;
            if(checkUsernameValue > 0){
                return res.status(400).json({ message: 'Tài khoản đã tồn tại' }); // user_name đã tồn tại
            } else {
                const response = await client.index({
                    index: 'users',
                    body: {
                        username: account.user_name,
                        password: account.password,
                        fullname: account.fullname
                    }
                });
                const token = generateToken(account);
                return res.status(200).json({ message: 'Đăng kí thành công', token: token });
            }
        } else {
            const response1 = await client.index({
                index: 'users',
                body: {
                    username: account.user_name,
                    password: account.password,
                    fullname: account.fullname
                }
            });
            const token = generateToken(account);
            return res.status(200).json({ message: 'Đăng kí thành công', token: token });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const getUsers = async (req, res) => {
    try {
        const token = decodeToken(req.header('Authorize'));

        const checkIndex = await client.indices.exists({
            index: 'users'  // Tên của index cần kiểm tra
        });

        if(checkIndex){
            const findUsername = await client.search({
                index: 'users',  // Tên của index
                body: {
                    query: {
                        term: {
                            username: token.user_name  // Trường và giá trị cần tìm
                        }
                    }
                }
            });
            var { _id, _source: { username, password, fullname } } = findUsername.hits.hits[0];
            const existingUser = { _id, username, password, fullname };

            const allUser = await client.search({
                index: 'users',
                body: {
                    query: {
                        match_all: {}
                    },
                    size: 1000
                }
            });
            const users = allUser.hits.hits.map(({ _id, _source: { username, password, fullname } }) => ({ _id, username, password, fullname }));
            return res.status(200).json({user : existingUser, users: users});
        }
        
    } catch (error) {
        console.error(error);
        return res.status(404).json({message: 'Server error'});
    }
}


const getDatas = async (req, res) => {
    // try {
    //     const datas = await Data.find({  });
    //     // console.log("posts",posts);
    //     return res.status(200).json({datas: datas});
        
    // } catch (error) {
    //     console.error(error);
    //     return res.status(404).json({message: 'Server error'});
    // }
    // console.log("getDatas");

    try {
        const body = await client.search({
            index: 'data1',
            body: {
                query: {
                    match_all: {}
                },
                size: 100
            }
        });
        
        // console.log("body",body.hits.hits);
        
        // res.json(body.hits.hits.map(hit => hit._source));
        // const newArray = body.hits.hits.map(item => item._source);
        const newArray = body.hits.hits.map(({ _id, _source: { title, content, updatedAt } }) => ({ _id, title, content, updatedAt }));
          
        // console.log("newArray.length",newArray.length);
        return res.status(200).json({ datas: newArray });
        
    } catch (error) {
        console.error(error);
        return res.status(404).json({message: 'Server error'});
    }
}

const createData = async (req, res) => {
    try {

        const newData = req.body.newData;
        const token = req.header('Authorize');
        console.log("newData",newData);

        if (!token) {
            return res.status(401).json({ message: 'Không xác thực được danh tính' })
        }

        const checkAcc = decodeToken(token);
        
        const existingUser = await User.findOne({ user_name: checkAcc.user_name });
        // console.log("existingUser", existingUser)

        newData.createdBy = existingUser._id;

        const data = new Data(newData);
        // console.log("data",data);
        const title = data.title;
        const content = data.content;


        await data.save();

        const response = await client.index({
            index: 'data1',
            body: {
                title,
                content
            }
        });
        return res.status(200).json({ message: 'Đã thêm dữ liệu mới.' });
        
    } catch (error) {
        console.error(error);
        return res.status(404).json({message: 'Server error'});
    }
} 

const getSearch = async (req, res) => {

    console.log("Get Search");

    try {
        const { query } = req.query;
        console.log("query",query);

      
        // res.json(hits.hits.map(hit => hit._source));
        const  body  = await client.search({
            index: 'data1',
            body: {
                query: {
                    bool: {
                        should: [
                            { match: { title: query } },
                            { match: { content: query } }
                        ]
                    }
                }
            }
        });
        // console.log("body",body.hits.hits);
        const newArray = body.hits.hits.map(item => ({
            title: item._source.title,
            content: item._source.content
        }));
          
        // console.log(newArray);
        return res.status(200).json({ data: newArray });
        
        
    } catch (error) {
        console.error(error);
        return res.status(404).json({message: 'Server error'});
    }
}

const updateData = async (req, res) => {
    try {
        // console.log("updateData")

        const updateData = req.body.data;
        // console.log("updateData", updateData)

        const dataId = updateData._id;
        const doc = {
            title: updateData.title,
            content: updateData.content,
            updatedAt: Date.now()
        }
        const token = req.header('Authorize');
        if (!token) {
            return res.status(401).json({ message: 'Không xác thực được danh tính' })
        }
        const checkAcc = decodeToken(token);
        const existingUser = await User.findOne({ user_name: checkAcc.user_name });
       
        const findData = await client.get({
            index: 'data1',
            id: dataId
        });

        // console.log("findData", findData)
        
        if(!findData){
            return res.status(400).json({ message: 'Data cần cập nhật không tồn tại.'});
        } else {
            // await User.updateOne(
            //     { _id: updateAccount._id }, 
            //     { $set: { 
            //         user_name: updateAccount.user_name,
            //         fullname: updateAccount.fullname,
            //         role: updateAccount.role,
            //     } }
            // );
            const response = await client.update({
                index: 'data1',
                id: dataId,
                body: {
                    doc: doc
                }
            });
            return res.status(200).json({ message: 'Cập nhật thành công.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi từ phía server.' });
    }
}

const deleteData = async (req, res) => {
    try {
        const dataId = req.body.dataId;

        const token = req.header('Authorize');
        if (!token) {
            return res.status(401).json({ message: 'Không xác thực được danh tính' })
        }
        const checkAcc = decodeToken(token);
        const existingUser = await User.findOne({ user_name: checkAcc.user_name });
        
        if (!dataId) {
            return res.status(400).json({ message: 'Thông tin về dữ liệu bạn muốn xóa không được gửi về server.'});
        }

        const findData = await client.get({
            index: 'data1',
            id: dataId
        });
        // console.log("findData",findData);

        if(!findData) {
            return res.status(400).json({ message: 'Data cần xoá không tồn tại.'});
        } else {
            const response = await client.delete({
                index: 'data1',
                id: dataId
            });
            await res.status(200).json({ message: 'Xoá thành công'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi từ phía server' });
    }
}


const getSearchDocument = async (req, res) => {

    console.log("Get Search getSearchDocument");

    try {
        const { query } = req.query;
        console.log("query",query);

      
        // res.json(hits.hits.map(hit => hit._source));
        const body = await client.search({
            index: 'documents',
            body: {
                query: {
                    bool: {
                        should: [
                            { match_phrase: { title: query } },
                            { match_phrase: { description: query } },
                            { match_phrase: { documentText: query } },
                            { match_phrase: { subject: query } },
                            { match_phrase: { school: query } }
                        ]
                    }
                }
            }
        });
        // console.log("body",body.hits.hits);
        const searchLength=body.hits.total.value;
        const newArray = body.hits.hits.map(item => ({
            _id: item._id,
            title: item._source.title,
            subject: item._source.subject,
            school: item._source.school,
            document: item._source.document,
            documentImage: item._source.documentImage,
            createdAt: item._source.createdAt,
            createdBy: item._source.createdBy,
            description: item._source.description,
        }));
          
        // console.log(newArray);
        return res.status(200).json({ data: newArray, searchLength:searchLength });
        
        
    } catch (error) {
        console.error(error);
        return res.status(404).json({message: 'Server error'});
    }
}

const createDocument = async (req, res) => {

    console.log("Get createDocument");

    try {
        const newDocument = req.body.newDocument;
        console.log("newDocument", newDocument);

        const documentPath = pathA.resolve(__dirname, '../uploads/documents', newDocument.document);
        console.log("documentPath", documentPath)

        // Đọc nội dung của tệp PDF
        let dataBuffer = fs.readFileSync(documentPath);
        let documentText;
        try {
            const data = await pdf(dataBuffer);
            documentText = data.text;
        } catch (err) {
            console.error('Đã xảy ra lỗi trong quá trình chuyển đổi:', err);
            return res.status(500).json({ message: 'Lỗi trong quá trình chuyển đổi PDF' });
        }

        const token = decodeToken(req.header('Authorize'));
        const checkIndex = await client.indices.exists({
            index: 'users'  // Tên của index cần kiểm tra
        });
        if(checkIndex){
            const findUsername = await client.search({
                index: 'users',  // Tên của index
                body: {
                    query: {
                        term: {
                            username: token.user_name  // Trường và giá trị cần tìm
                        }
                    }
                }
            });
            var { _id, _source: { username, password, fullname } } = findUsername.hits.hits[0];
            var existingUser = { _id, username, password, fullname };
        }

        // Lưu tài liệu và thông tin vào Elasticsearch
        const checkIndex1 = await client.indices.exists({
            index: 'documents'  
        });

        console.log("checkIndex1", checkIndex1)

        if (checkIndex1) {
            // Nếu đã tồn tại index 'documents'
            const response = await client.index({
                index: 'documents',
                body: {
                    title: newDocument.title,
                    description: newDocument.description,
                    documentText: documentText,
                    subject: newDocument.subject,
                    school: newDocument.school,
                    document: newDocument.document,
                    documentImage: newDocument.documentImage,
                    createdAt: Date.now(),
                    createdBy: existingUser ? existingUser._id : null
                }
            });
            return res.status(200).json({ message: 'Đã thêm dữ liệu mới.' });
        } else {
            // Nếu index 'documents' chưa tồn tại, tạo mới và thêm dữ liệu
            await client.indices.create({
                index: 'documents',
            });
            const response = await client.index({
                index: 'documents',
                body: {
                    title: newDocument.title,
                    description: newDocument.description,
                    documentText: documentText,
                    subject: newDocument.subject,
                    school: newDocument.school,
                    document: newDocument.document,
                    documentImage: newDocument.documentImage,
                    createdAt: Date.now(),
                    createdBy: existingUser ? existingUser._id : null
                }
            });
            return res.status(200).json({ message: 'Đã thêm dữ liệu mới.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(404).json({message: 'Server error'});
    }
}

const getDocuments = async (req, res) => {
    // const documentId = req.params.id;
    // console.log("documentId",documentId);

    try {
        const checkIndex = await client.indices.exists({
            index: 'documents'  // Tên của index cần kiểm tra
        });
    
        if(checkIndex){
            const body = await client.search({
                index: 'documents',
                body: {
                    query: {
                        match_all: {}
                    },
                    size: 1000
                }
            });
            const newArray = body.hits.hits.map(({ _id, _source: { title, description, school , subject, document, documentImage, createdAt, createdBy } }) => ({ _id, title, description, school , subject, document, documentImage, createdAt, createdBy }));
            return res.status(200).json({ documents: newArray });

        } else {
            return res.status(400).json({ message: 'Không có tài liệu nào' })
        }
    } catch (error) {
        console.error(error);
        return res.status(404).json({message: 'Server error'});
    }
}

const getDocument= async (req, res) => {
    const documentId = req.params.id;

    try {
        const checkIndex = await client.indices.exists({
            index: 'documents'  // Tên của index cần kiểm tra
        });
    
        if(checkIndex){
            const findDocument = await client.get({
                index: 'documents',
                id: documentId
            });
            // console.log("findDocument",findDocument);
            // const newArray = body.hits.hits.map(({ _id, _source: { title, description, school , subject, document, documentImage, createdAt, createdBy } }) => ({ _id, title, description, school , subject, document, documentImage, createdAt, createdBy }));

            const { _id, _source: { title, description, school , subject, document, documentImage, createdAt, createdBy } } = findDocument;
            const resultObject = { _id, title, description, school , subject, document, documentImage, createdAt, createdBy };
            return res.status(200).json({ document: resultObject });
        } else {
            return res.status(400).json({ message: 'Không có tài liệu nào' })
        }
    } catch (error) {
        console.error(error);
        return res.status(404).json({message: 'Server error'});
    }
}

// const getDocuments = async (req, res) => {

//     console.log("getDocuments");
//     const { id } = req.params;
//     if (id) {
//         // Nếu có ID, tải xuống tài liệu cụ thể
//         try {
//             const { body } = await client.get({
//                 index: 'documents',
//                 id: id
//             });

//             const documentContent = body._source.content;
//             const filePath = path.join(__dirname, 'public', 'documents', `${id}.bin`);
//             fs.writeFileSync(filePath, documentContent, 'binary');

//             res.download(filePath, `${id}.bin`, err => {
//                 if (err) {
//                     console.error(err);
//                     res.status(500).send('Error downloading file');
//                 }
//                 fs.unlinkSync(filePath); // Xóa tệp sau khi tải xuống
//             });
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ message: 'Server error' });
//         }
//     } else {
//         // Nếu không có ID, lấy danh sách tài liệu
//         console.log("không có ID");

//         try {
//             const body = await client.search({
//                 index: 'documents',
//                 body: {
//                     query: {
//                         match_all: {}
//                     }
//                 }
//             });
//             const newArray = body.hits.hits.map(({ _id, _source: { title, content, description, field } }) => ({ _id, title, content, description, field }));
//             return res.status(200).json({ documents: newArray });
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ message: 'Server error' });
//         }
//     }
// }

const uploadDocumentFile =  async (req, res) => {
    try {
        res.status(200).json({ filename: req.file.filename });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: 'Lỗi khi tải ảnh lên Cloudinary' });
    }
};

const uploadDocumentImageFile =  async (req, res) => {
    try {
        res.status(200).json({ filename: req.file.filename });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: 'Lỗi khi tải ảnh lên Cloudinary' });
    }
};



module.exports = {
    login, register, getUsers,
    createData, getDatas, updateData, deleteData,
    getSearch,
    createDocument, getDocuments, getDocument, getSearchDocument,
    uploadDocumentFile, uploadDocumentImageFile
}