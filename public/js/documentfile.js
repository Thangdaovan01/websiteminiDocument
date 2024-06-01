var documentFile = {};
var usersArr = [];
var currUser = {};
var documentsArr = [];

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
                // showNotification(data.message);
                throw new Error('Network response was not ok');
            }
            return data;
        });
    })
    .then(result => {
        documentsArr = result.documents;
        console.log("documentsArr",documentsArr);
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });

    //Lấy giá trị user
    fetch('http://localhost:3000/api/users', {
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorize" : token
        }
    })
    .then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                showNotification(data.message);
                window.location.href = 'http://localhost:3000/login-register';
                throw new Error('Network response was not ok');
            }
            return data;
        });
    })
    .then(result => {
        currUser = result.user;
        usersArr = result.users;
        console.log("USER",result);
        // showUsers(usersArr);
        showSidebar(currUser);

        console.log("getDocumentsFILE");
        const path = window.location.pathname;
        const documentId = path.split('/').pop();
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
            documentFile = result.document;
            console.log("openDocument",documentFile);
    
            showDocument(documentFile);
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });

    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });

    

})

$(document).ready(function() {
    
})

function showSidebar(user) {
    const userId = user._id;
    const count = documentsArr.filter(doc => doc.createdBy === userId).length;
    document.querySelector('.profile .username').textContent = user.fullname;
    document.querySelector('.profile .uploadCount').textContent = `${count} Tải lên`;
}

function showDocument(documentFile) {
    // Lấy thẻ iframe bằng ID
    const documentHeader = document.querySelector('.file-container .document-header');
    var documentCreatedAt = convertTimestampToDateString(documentFile.createdAt);
    var documentHeaderHTML = `
        <span class="document-title">${documentFile.title}</span>
        <br>
        <span class="document-createdAt">Ngày tạo: ${documentCreatedAt}</span>
    `;
    documentHeader.innerHTML = documentHeaderHTML;
    const iframe = document.getElementById('file-iframe');
    const filePath = `/documents/${documentFile.document}`;
    iframe.src = filePath;

    var filteredUsers  = usersArr.filter(user => user._id == documentFile.createdBy);
    console.log("filteredUsers",filteredUsers);

    var authorName = filteredUsers[0].fullname;
    const documentInfo = document.querySelector('.document-info-container');
    var documentInfoHTML = `
    <div class="detail-info">
        <h5>Thông tin chi tiết</h5>
        <p><strong>Môn học:</strong> ${documentFile.subject}</p>
        <p><strong>Trường:</strong> ${documentFile.school}</p>
        <p><strong>Người tải lên:</strong> ${authorName}</p>
        <p><strong>Mô tả môn học:</strong> ${documentFile.description}</p>
    </div>
    `;
    documentInfo.innerHTML = documentInfoHTML;

}

function convertTimestampToDateString(timestamp) {
    const date = new Date(timestamp);
    
    // Lấy các thành phần của ngày tháng
    const day = date.getDate().toString().padStart(2, '0'); // Lấy ngày và thêm số 0 ở đầu nếu cần
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Lấy tháng và thêm số 0 ở đầu nếu cần
    const year = date.getFullYear();
    
    // Trả về chuỗi dạng ngày/tháng/năm
    return `${day}/${month}/${year}`;
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