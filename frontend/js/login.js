// login.js

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
  
    if (!username || !password) {
      alert('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }
  
    // Lấy danh sách user từ localStorage
    let users = JSON.parse(localStorage.getItem('users')) || [];
  
    // Tìm user khớp thông tin
    const user = users.find(user => user.username === username && user.password === password);
  
    if (user) {
      // Lưu người dùng hiện tại vào localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
  
      alert('Đăng nhập thành công!');
      window.location.href = 'dashboard.html'; // Chuyển đến dashboard
    } else {
      alert('Sai tên đăng nhập hoặc mật khẩu.');
    }
  }
  