var documentsArr = [];
var documentFileName = '';
var imageFileName = '';
const token = localStorage.getItem('jwtToken');

$(document).ready(function() {
    fetch('http://localhost:3000/api/documents', {
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
        }
    })
    .then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                showNotification(data.message);
                throw new Error('Network response was not ok');
            }
            return data;
        });
    })
    .then(result => {
        documentsArr = result.documents;
        console.log("documentsArr",documentsArr);

        // showDocuments(documentsArr);
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });

})

$(document).ready(function() {
    $(document).on('click', '.create-new-document-btn', function(event) {
        event.stopPropagation();
        console.log("create-new-document-btn");
        
        $("body").children().not(".window, .notification").addClass("blur");

        var newPost = ``

        newPost += `
            
        <div class="form-container">
            <form id="create_new_document_form" enctype="multipart/form-data">
                <div class="form-section">
                    <div class="box small-box">
                        <div class="form-group">
                            <label for="title">Title</label>
                            <input type="text" id="title" name="title" required>
                        </div>
                        <div class="form-group">
                            <label for="description">Description</label>
                            <textarea id="description" name="description" rows="4" required></textarea>
                        </div>
                    </div>
                    <div class="box small-box">
                        <div class="form-group">
                            <label for="document">Upload Document</label>
                            <input type="file" id="document" name="document" accept=".pdf,.doc,.docx" required><br>
                        </div>
                        <div class="form-group">
                            <label for="document-image">Upload Document Image</label>
                            <input type="file" id="document-image" name="document-image" accept=".png,.jpg,.jpeg" required>
                        </div>
                        <div class="form-group">
                            <label for="school">Select School</label>
                            <select id="school" name="school">
                                <option value="Trường Cơ khí">Trường Cơ khí</option>
                                <option value="Trường Công nghệ Thông tin và Truyền thông">Trường Công nghệ Thông tin và Truyền thông</option>
                                <option value="Trường Điện - Điện tử">Trường Điện - Điện tử</option>
                                <option value="Trường Hoá và Khoa học sự sống">Trường Hoá và Khoa học sự sống</option>
                                <option value="Trường Vật liệu">Trường Vật liệu</option>
                                <option value="Khoa Toán - Tin">Khoa Toán - Tin</option>
                                <option value="Khoa Vật lý Kỹ thuật">Khoa Vật lý Kỹ thuật</option>
                                <option value="Khoa Ngoại ngữ">Khoa Ngoại ngữ</option>
                                <option value="Khoa Khoa học và Công nghệ Giáo dục">Khoa Khoa học và Công nghệ Giáo dục</option>
                                <option value="Khoa Giáo dục Quốc phòng & An ninh">Khoa Giáo dục Quốc phòng & An ninh</option>
                                <option value="Khoa Lý luận Chính trị">Khoa Lý luận Chính trị</option>
                                <option value="Khoa Giáo dục Thể chất">Khoa Giáo dục Thể chất</option>
                                <option value="Viện Kinh tế và Quản lý">Viện Kinh tế và Quản lý</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="subject">Subject Name</label>
                            <input type="text" id="subject" name="subject">
                        </div>
                    </div>
                </div>
                <div class="form-section">
                    <button type="button" class="btn cancel create-new-document-cancel-btn"><i class="fa-solid fa-xmark"></i> Cancel</button>
                    <button type="submit" class="btn submit create-new-document-submit-btn"><i class="fa-solid fa-arrow-up-from-bracket"></i> Upload Document</button>
                </div>
            </form>
        </div>

        `

        $('.window').empty().append(newPost);
        $('.window').show();
    });

    $(document).on('click', function(event) {
        // Kiểm tra nếu click vào phần tử không phải là .create-row-container hoặc các phần tử con của nó
        if (!$(event.target).closest('.window').length && !$(event.target).is('.Xbuttonimage')) {
            // Ẩn đi phần tử .window
            $('.window').hide();
            $("body").children().removeClass("blur");
        }
    });

    $(document).on('click', '.create-new-document-cancel-btn', function(event) {
        event.stopPropagation();
        $('.window').hide();
        $("body").children().removeClass("blur");
    })

    $(document).on('click', '.create-new-document-submit-btn', function(event) {
        event.stopPropagation();
        console.log("create-new-document-submit-btn");

        var title = document.getElementById('title').value;
        var description = document.getElementById('description').value;
        var school = document.getElementById('school').value;
        var subject = document.getElementById('subject').value;
        
        var newDocument = {
            document: documentFileName,
            documentImage: imageFileName,
            title: title,
            description: description,
            school: school,
            subject: subject,
        }

        console.log("newDocument", newDocument);

        console.log("create-new-document-submit-btn 22222");

        if (!confirm('Đăng tài liệu mới')) {
            return
        }
        createNewDocument(newDocument);
    })

    $(document).on('change','#document', async function(event) {
        event.stopPropagation();

        var formData = new FormData();
        var documentFile = document.getElementById('document').files[0];
        documentFile.fieldname = 'document';
        formData.append('document', documentFile);

        if (documentFile) {
            try {
                const documentName = await fileReaderDocument(formData);
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        } else {
            showNotification('Vui lòng chọn một tệp ảnh hợp lệ.');
        }
    })

    $(document).on('change','#document-image', async function(event) {
        event.stopPropagation();

        var formData = new FormData();
        var imageFile = document.getElementById('document-image').files[0];
        imageFile.fieldname = 'documentImage';
        formData.append('documentImage', imageFile);

        if (imageFile) {
            try {
                const documentName = await fileReaderImage(formData);
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        } else {
            showNotification('Vui lòng chọn một tệp ảnh hợp lệ.');
        }
    })

    // $('#upload_form').submit(function(event) {
    //     event.preventDefault();
    //     var formData = new FormData(this);
    //     console.log("formData", formData);

    //     // for (var pair of formData.entries()) {
    //     //     console.log(pair[0]+ ': ' + pair[1]);
    //     // }

    //     var fileInput = formData.get('document'); // Lấy đối tượng file từ formData

    //     console.log('Tên file:', fileInput.name);
    //     console.log('Loại file:', fileInput.type);
    //     console.log('Kích thước file:', fileInput.size);
        
    //     createNewDocument(formData);
        
    // });
})
 
async function fileReaderDocument(formData) {
    console.log("fileReaderDocument");
    try {
        const response = await fetch('http://localhost:3000/api/uploadDocument', {
            method: "POST",
            body: formData
        })
        .then(response => {
            return response.json().then(data => {
                if (!response.ok) {
                    showNotification(data.message);
                    throw new Error('Network response was not ok');
                }
                return data;
            });
        })
        .then(result => {
            showNotification(result.message);
            console.log("fileReaderDocument",result);
            documentFileName = result.filename;
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });

                
    } catch (error) {
        console.error('There was a problem with your fetch operation:', error);
    }       
}

async function fileReaderImage(formData) {
    console.log("fileReaderImage");
    try {
        const response = await fetch('http://localhost:3000/api/uploadDocumentImage', {
            method: "POST",
            body: formData
        })
        .then(response => {
            return response.json().then(data => {
                if (!response.ok) {
                    showNotification(data.message);
                    throw new Error('Network response was not ok');
                }
                return data;
            });
        })
        .then(result => {
            showNotification(result.message);
            console.log("fileReaderImage",result);
            imageFileName = result.filename;

        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });

                
    } catch (error) {
        console.error('There was a problem with your fetch operation:', error);
    }       
}

function showDocuments(documentsArr) {
    console.log("documentsArr", documentsArr);
    const documentsList = document.getElementById('documents_list');
    documentsArr.forEach(doc => {
            const documentElement = document.createElement('div');
            documentElement.innerHTML = `
            <div>
                <h2>${doc.title}</h2>
                <p><strong>Description:</strong> ${doc.description}</p>
                <p><strong>Field:</strong> ${doc.field}</p>
                <p><strong>FileName:</strong> ${doc.fileName}</p>
                <p><strong>FilePath:</strong> ${doc.path}</p>
                <button onclick="openDocument('${doc._id}')">View Document</button>
            </div>
            `;
            documentsList.appendChild(documentElement);
        });
}

function openDocument(documentId) {
    // Thực hiện hành động tương ứng để hiển thị hoặc tải tài liệu lên
    // Đặc biệt, nếu là tệp DOC, bạn cần sử dụng một thư viện hoặc plugin phù hợp để hiển thị nó
    console.log('Opening document with ID:', documentId);
    window.location.href = `http://localhost:3000/document/${documentId}`;
    fetch(`http://localhost:3000/api/document/${documentId}`, {
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
        }
    })
    .then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                showNotification(data.message);
                throw new Error('Network response was not ok');
            }
            return data;
        });
    })
    .then(result => {
        console.log("openDocument",result);

        // showDocuments(documentsArr);
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}

function createNewDocument(newDocument){
    console.log("createNewDocument",newDocument);
    fetch('http://localhost:3000/api/document', {
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
            "Authorize" : token
        },
        body: JSON.stringify({newDocument:newDocument})
    })
    .then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                showNotification(data.message);
                throw new Error('Network response was not ok');
            }
            return data;
        });
    })
    .then(result => {
        showNotification(result.message);
        console.log("createNewDocument",result);
        // $('#document_display').html(`<h2>Uploaded Document</h2><p>Title: ${result.title}</p><p>Description: ${result.description}</p><p>Field of Study: ${result.field}</p>`);

        // setTimeout(function() {
        //     window.location.href = 'http://localhost:3000/document';
        // }, 500);
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}


function showNotification(message) {
    $('#notificationText').text(message);
    $('#notification').show();
    setTimeout(() => {
        setTimeout(() => {
            $('#notification').addClass('right-slide');
        }, 10);
    }, 10);
    setTimeout(() => {
        $('#notification').removeClass('right-slide'); 
        setTimeout(() => {
            $('#notification').hide(); 
        }, 500);
    }, 3000); 
}