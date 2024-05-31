var documentFile = {};


$(document).ready(function() {
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



function showDocument(documentFile) {
    // Lấy thẻ iframe bằng ID
    const iframe = document.getElementById('file-iframe');

    // Đường dẫn tệp bạn muốn hiển thị trong iframe
    // const filePath = documentFile.path; // Thay đổi thành đường dẫn thực tế
    // const filePath = '/data/documents/1716819460473-document.pdf';
    // const filePath = '/uploads/documents/1716820021256-document.pdf';
    const filePath = `/documents/${documentFile.fileName}`;

    // Thiết lập src cho iframe
    iframe.src = filePath;
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