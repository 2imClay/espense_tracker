// register.js

function register() {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
  
    if (!username || !email || !password) {
      alert('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
  
    // Lấy danh sách user từ localStorage (nếu có)
    let users = JSON.parse(localStorage.getItem('users')) || [];
  
    // Kiểm tra username đã tồn tại chưa
    const userExists = users.some(user => user.username === username);
    if (userExists) {
      alert('Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.');
      return;
    }
  
    // Thêm user mới
    users.push({ username, email, password });
    localStorage.setItem('users', JSON.stringify(users));
  
    alert('Đăng ký thành công! Vui lòng đăng nhập.');
    window.location.href = 'login.html'; // chuyển tới trang đăng nhập
  }
  