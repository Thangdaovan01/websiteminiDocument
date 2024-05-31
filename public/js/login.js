$(document).ready(function() {
    $(document).on('click', '#loginForm .change-form button', function(event) {
        event.stopPropagation();

        $(".container").scrollTop(400);
    })

    $(document).on('click', '#registerForm .change-form button', function(event) {
        event.stopPropagation();

        $(".container").scrollTop(-400);
    })

    $(document).on('input', 'input', function(event) {
        event.stopPropagation();

        $(this).removeClass('warning-border')
    })

    $('#loginForm').on('submit', function(event) {
        event.preventDefault();

        var user_name = $(this).find('#user_name_login').val();
        var password = $(this).find('#password_login').val();

        if (!checkUserName(user_name)) {
            $('#loginForm #user_name_login').addClass('warning-border');
            return
        }

        if (!checkPassword(password)) {
            $('#loginForm #password_login').addClass('warning-border');
            return
        }

        const account = {
            user_name: user_name,
            password: password
        }

        fetch('http://localhost:3000/api/login', {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(account)
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
            localStorage.setItem('jwtToken', result.token);
            window.location.href = 'http://localhost:3000/';
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
        });

    $('#registerForm').on('submit', function(event) {
        event.preventDefault();
        console.log("registerForm submit")

        var user_name = $(this).find('#user_name_register').val();
        var fullname = $(this).find('#fullname_register').val();
        var password = $(this).find('#password_register').val();
        var confirm_password = $(this).find('#confirm_password_register').val();

        // check password
        if (password !== confirm_password) {
            $('#registerForm #password_register').addClass('warning-border');
            $('#registerForm #confirm_password_register').addClass('warning-border');
            showNotification('Mật khẩu và xác nhận mật khẩu phải trùng nhau');

            return
        }

        // check account
        if (!checkUserName(user_name)) {
            $('#registerForm #user_name_register').addClass('warning-border');
            return
        }

        if (!fullname) {
            $('#registerForm #fullname_register').addClass('warning-border');
            showNotification('Vui lòng nhập họ và tên');
            return
        }

        if (!checkPassword(password)) {
            $('#registerForm #password_register').addClass('warning-border');
            return
        }

        const account = {
            user_name: user_name,
            fullname: fullname,
            password: password,
            role: 'user'
        }

        // console.log(account)

        fetch('http://localhost:3000/api/register', {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(account)
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
            localStorage.setItem('jwtToken', result.token);
            
            showNotification(result.message);

            setTimeout(function() {
                window.location.href = 'http://localhost:3000/';
            }, 500);
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    });

    $(document).on('click', '.change-style-password', function(event) {
        event.stopPropagation();

        var parentForm = $(this).closest("form");

        var passwordField = parentForm.find("input[id*='password']");

        if (passwordField.attr("type") === "password") {
            passwordField.attr("type", "text");
            $(this).html('<i class="fa-regular fa-eye-slash"></i>');
        } else {
            passwordField.attr("type", "password");
            $(this).html('<i class="fa-regular fa-eye"></i>');
        }
    });
});
 
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

function checkUserName(user_name) {
    if (!user_name || user_name == '') {
        showNotification('Vui lòng nhập tên đăng nhập');
        return false
    }

    if (user_name.includes(' ')) {
        showNotification('Tên đăng nhập không được có khoảng trống');
        return false
    }

    return true
}

function checkPassword(password) {
    if (!password || password == '') {
        showNotification('Vui lòng nhập mật khẩu');
        return false
    }

    if (password.length < 8) {
        showNotification('Mật khẩu cần tối thiểu 8 kí tự');
        return false
    }

    if (password.includes(' ')) {
        showNotification('Mật khẩu không được có khoảng trống');
        return false
    }

    return true
}