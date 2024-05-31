$(document).ready(function() {
    $(document).on('click', '#logout', function(event) {
        event.stopPropagation();

        if (confirm('Xác nhận đăng xuất')) {
            // localStorage.removeItem('jwtToken');
        
            window.location.href = 'http://localhost:3000/login-register';
        }
    })
});