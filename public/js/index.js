var usersArr = [];
var datasArr = [];
var user = {};

const token = localStorage.getItem('jwtToken');

$(document).ready(function() {
    fetch('http://localhost:3000/api/user', {
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
        user = result.user;
        usersArr = result.users;
        console.log("USER",result);
        // showUsers(usersArr);
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });


    fetch('http://localhost:3000/api/datas', {
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
        datasArr = result.datas;
        showDatas(datasArr);
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });


    
   
});

$(document).ready(function() {
    $('.save-new-data').on('click', function() {
        console.log("SAVEDATA")
        const title = $('#title').val();
        const content = $('#content').val();

        var newData = {
            title: title, 
            content: content
        }
        console.log("newData",newData)

        createNewData(newData);
        
    });

    $('#search_form').on('submit', function(event) {
        event.preventDefault(); // Ngăn chặn form submit mặc định
        const searchText = $('.searchText').val();
        showSearchValue(searchText);
    });

    $(document).on('click', '.delete-btn', function(event) {
        event.stopPropagation();
        const dataId = $(this).closest('.row-data').data('id');
        console.log("dataId",dataId)
        if(!confirm("Xác nhận xoá")) {
            return;
        }
        deleteData(dataId);
        
    });

    $(document).on('click', '.update-btn', function(event) {
        event.stopPropagation();

        const dataId = $(this).closest('.row-data').data('id');
        const title = datasArr.find(item => item._id === dataId)?.title || null;
        const content = datasArr.find(item => item._id === dataId)?.content || null;
        var updateDataHTML = ``;
        
        updateDataHTML = `
            <div id="row_${dataId}" class="row-data" data-id = "${dataId}">
                <div class="form-group form-row">
                    <div class="form-group col">
                        <label for="title">Title</label>
                        <input class="form-control title" type="text" placeholder="Title" value="${title}">
                    </div>
                    <div class="form-group col">
                        <label for="content">Tên đăng nhập</label>
                        <textarea class="form-control content" placeholder="" rows="4" cols="50">${content}</textarea>
                    </div>
                </div>   
                <button class="save-update-data-btn" title="Cập nhật">Lưu</button>
            </div>
            `
        $('.window').empty().append(updateDataHTML);
        $('.window').show();
        
    });

    $(document).on('click', '.save-update-data-btn', function(event) {
        event.stopPropagation();
        const dataId = $(this).closest('.row-data').data('id');

        var $data = $(this).siblings('div');
       
        var title = $data.find('.title').val().trim();
        var content = $data.find('.content').val().trim();

        var data = {
            _id: dataId,
            title: title,
            content: content,
        }

        if(!confirm("Xác nhận cập nhật")) {
            return;
        }
        updateData(data);
    });

    $(document).on('click', function(event) {
        // Kiểm tra nếu click vào phần tử không phải là .create-row-container hoặc các phần tử con của nó
        if (!$(event.target).closest('.window').length) {
            // Ẩn đi phần tử .window
            $('.window').hide();
            $("body").children().removeClass("blur");
        }
    });

})

function updateData (data) {
    fetch('http://localhost:3000/api/data', {
        method: "PUT",
        headers: {
            "Content-Type" : "application/json",
            "Authorize" : token
        },
        body: JSON.stringify({data:data})
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
        // var websiteNo = website.no;
        // $(`#row_${websiteNo}`).remove();
        setTimeout(function() {
            window.location.href = 'http://localhost:3000';
        }, 500);
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}

function deleteData (dataId) {

    fetch('http://localhost:3000/api/data', {
        method: "DELETE",
        headers: {
            "Content-Type" : "application/json",
            "Authorize" : token
        },
        body: JSON.stringify({dataId:dataId})
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
        $(`#row_${dataId}`).remove();
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}

function showSearchValue(searchText) {

    fetch(`http://localhost:3000/api/search?query=${encodeURIComponent(searchText)}`, {
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            "Authorize" : token
        },
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
        // showNotification(result.message);
        var searchResult = result.data;
        $('.data-content-container tbody').empty();
        showDatas(searchResult);
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}

function showDatas(datasArr){
    var dataContentContainer = document.querySelector('.data-content-container');
    var dataContent = ``;
    var dataLength = datasArr.length;
    console.log("datasArr",datasArr)
    for(let i=0; i<dataLength; i++){
       dataContent = ` 
        <tr id = "row_${datasArr[i]._id}" class="row-data" data-id = "${datasArr[i]._id}">
            <td class="title">${datasArr[i].title}</td>
            <td class="content">${datasArr[i].content}</td>
            <td class="action">
                <button title="Cập nhật dữ liệu" class="update-btn"><i class="fa-solid fa-pen"></i></button>
                <button title="Xoá" class="delete-btn"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
        `;

        $(".data-content-container tbody").append(dataContent);
    }
}

function createNewData(newData) {
    fetch('http://localhost:3000/api/data', {
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
            "Authorize" : token
        },
        body:JSON.stringify({newData : newData})
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
        setTimeout(function() {
            window.location.href = 'http://localhost:3000/';
        }, 500);
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


// $(document).ready(function() {
//     var filename = '1716820021256-document.pdf';
//     showDocument(filename);
// })

// function showDocument (filename) {
//     fetch(`http://localhost:3000/api/document/${filename}`, {
//         method: "GET",
//         headers: {
//             "Content-Type" : "application/json",
//         }
//     })
//     .then(response => {
//         return response.json().then(data => {
//             if (!response.ok) {
//                 showNotification(data.message);
//                 throw new Error('Network response was not ok');
//             }
//             return data;
//         });
//     })
//     .then(result => {
//        var pdfPath = result;
//        console.log("pdfPath",pdfPath);
//        viewPDF(pdfPath);
//     })
//     .catch(error => {
//         console.error('There was a problem with your fetch operation:', error);
//     });
// }
// function viewPDF(pdfPath) {
// // Load tệp PDF và hiển thị nó lên canvas
// pdfjsLib.getDocument(pdfPath).promise.then(pdfDoc => {
//     const canvas = document.getElementById('pdfCanvas');
//     const ctx = canvas.getContext('2d');

//     pdfDoc.getPage(1).then(page => {
//         const viewport = page.getViewport({ scale: 1.5 });
//         canvas.height = viewport.height;
//         canvas.width = viewport.width;

//         const renderCtx = {
//             canvasContext: ctx,
//             viewport: viewport
//         };
        
//         page.render(renderCtx);
//     });
// });
// }
