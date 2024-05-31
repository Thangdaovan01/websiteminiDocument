function removeVietnameseTones(str) {
    // Loại bỏ dấu bằng cách sử dụng normalize và regex để loại bỏ diacritical marks
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    // Thay thế các ký tự đ và Đ bằng d và D tương ứng
    str = str.replace(/đ/g, "d").replace(/Đ/g, "D");
    // Loại bỏ các ký tự đặc biệt ngoại trừ dấu chấm
    // str = str.replace(/[^a-zA-Z0-9 .]/g, "");
    str = str.replace(/[^\w\s.]/g, "");
    // Thay thế khoảng trắng bằng dấu gạch ngang
    str = str.replace(/\s+/g, "-");
    return str;

   
}

function renameFile(originalFileName) {
    const parts = originalFileName.split("."); // Tách tên file thành các phần dựa trên dấu chấm
    const extension = parts.pop(); // Lấy phần mở rộng của tệp
    const fileName = parts.join("."); // Nối lại phần tên của tệp sau khi loại bỏ phần mở rộng
    
    // Trả về tên file mới là "document" kết hợp với phần mở rộng ban đầu
    return "document." + extension;
}

module.exports = {
    removeVietnameseTones, renameFile
};