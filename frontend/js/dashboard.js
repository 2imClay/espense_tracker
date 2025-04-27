document.addEventListener('DOMContentLoaded', function () {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  if (!currentUser) {
    alert('Vui lòng đăng nhập!');
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('welcome').textContent = `Xin chào, ${currentUser.username}!`;
  loadExpenseCategories();
  loadExpensesSummary();
});

// Lưu tổng tiền đầu tháng theo tháng đã chọn
function saveBudget() {
  const month = document.getElementById('budgetMonth').value;
  const budget = parseFloat(document.getElementById('totalBudget').value);

  if (!month || !budget || budget <= 0) {
    alert('Vui lòng chọn tháng và nhập tổng tiền hợp lệ.');
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const key = `data_${currentUser.username}_${month}`;

  // Tạo dữ liệu tháng nếu chưa có
  const data = JSON.parse(localStorage.getItem(key)) || {
    budget: 0,
    expenses: []
  };

  data.budget = budget;
  localStorage.setItem(key, JSON.stringify(data));

  alert('Đã lưu tổng tiền cho tháng ' + month + '!');
  loadExpensesSummary();
}

// Thêm khoản chi tiêu cho tháng đã chọn
function addExpense() {
  const month = document.getElementById('budgetMonth').value;
  const name = document.getElementById('expenseName').value.trim();
  const amount = parseFloat(document.getElementById('expenseAmount').value);
  const category = document.getElementById('expenseCategory').value;

  if (!month) {
    alert('Vui lòng chọn tháng trước khi thêm khoản chi.');
    return;
  }

  if (!name || isNaN(amount) || amount <= 0) {
    alert('Vui lòng nhập khoản chi hợp lệ.');
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const key = `data_${currentUser.username}_${month}`;

  let data = JSON.parse(localStorage.getItem(key));

  if (!data) {
    alert('Bạn chưa thiết lập tổng tiền cho tháng này.');
    return;
  }

  data.expenses.push({ name, amount, category });
  localStorage.setItem(key, JSON.stringify(data));

  // Reset form
  document.getElementById('expenseName').value = '';
  document.getElementById('expenseAmount').value = '';

  loadExpensesSummary();
}

// Xóa dữ liệu chi tiêu tháng
function deleteMonth(month) {
  if (confirm(`Bạn có chắc chắn muốn xoá toàn bộ chi tiêu của tháng ${month}?`)) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const key = `data_${currentUser.username}_${month}`;
    localStorage.removeItem(key);

    loadExpensesSummary(); // Cập nhật lại giao diện
    alert('Đã xoá chi tiêu tháng ' + month);
  }
}


// Các chức năng khác vẫn giữ nguyên
function openProfile() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  document.getElementById('profileUsername').textContent = `Tên đăng nhập: ${currentUser.username}`;
  document.getElementById('profileEmail').textContent = `Email: ${currentUser.email}`;
  document.getElementById('profileModal').style.display = 'flex';
}

function closeProfile() {
  document.getElementById('profileModal').style.display = 'none';
}

function confirmLogout() {
  if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark');

  if (document.body.classList.contains('dark')) {
    localStorage.setItem('theme', 'dark');
    document.getElementById('themeButton').innerHTML = '🌙 Chế độ';
  } else {
    localStorage.setItem('theme', 'light');
    document.getElementById('themeButton').innerHTML = '🌞 Chế độ';
  }
}

// Load đúng icon theo theme
document.addEventListener('DOMContentLoaded', function () {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.body.classList.add('dark');
    document.getElementById('themeButton').innerHTML = '🌙 Chế độ';
  }
});

// Bật tắt menu cài đặt
// Bật tắt menu cài đặt khi bấm nút
function toggleSettings() {
  const menu = document.getElementById('settingsMenu');
  menu.classList.toggle('show');
}

// Đóng menu cài đặt nếu click ra ngoài
document.addEventListener('click', function (event) {
  const menu = document.getElementById('settingsMenu');
  const settingsButton = document.getElementById('settingsButton');

  // Nếu đang mở menu và click ra ngoài (không phải vào nút Settings hoặc menu)
  if (menu.classList.contains('show') &&
      !menu.contains(event.target) &&
      !settingsButton.contains(event.target)) {
    menu.classList.remove('show');
  }
});


// Xóa toàn bộ dữ liệu chi tiêu và ngân sách
function deleteAllData() {
  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu chi tiêu và ngân sách không?')) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // Xóa từng tháng của user
    const keysToDelete = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(`data_${currentUser.username}_`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => localStorage.removeItem(key));
    alert('Đã xóa toàn bộ dữ liệu chi tiêu và ngân sách.');
    loadExpensesSummary();
    toggleSettings();
  }
}

// Xóa tài khoản người dùng
function deleteAccount() {
  if (confirm('Bạn có chắc chắn muốn xóa tài khoản và toàn bộ dữ liệu?')) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Xóa user khỏi danh sách users
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.filter(user => user.username !== currentUser.username);
    localStorage.setItem('users', JSON.stringify(users));

    // Xóa tất cả dữ liệu liên quan
    deleteAllData();
    localStorage.removeItem('currentUser');

    alert('Đã xóa tài khoản thành công.');
    window.location.href = 'register.html';
  }
}

// Mở modal mục tiêu
function openGoals() {
  document.getElementById('goalsModal').style.display = 'flex';
  loadGoalList();
  loadExpenseCategories();
}

// Đóng modal mục tiêu
function closeGoals() {
  document.getElementById('goalsModal').style.display = 'none';
}

// Thêm phân loại mục tiêu
function addGoalCategory() {
  const name = document.getElementById('goalCategoryName').value.trim();
  const amount = parseFloat(document.getElementById('goalCategoryAmount').value);

  if (!name || isNaN(amount) || amount <= 0) {
    alert('Vui lòng nhập tên loại và số tiền hợp lệ.');
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const key = `goals_${currentUser.username}`;

  let goals = JSON.parse(localStorage.getItem(key)) || [];

  // Kiểm tra nếu loại đã tồn tại
  const existing = goals.find(goal => goal.category.toLowerCase() === name.toLowerCase());
  if (existing) {
    existing.amount = amount; // Cập nhật số tiền nếu trùng loại
  } else {
    goals.push({ category: name, amount });
  }

  localStorage.setItem(key, JSON.stringify(goals));

  // Reset input
  document.getElementById('goalCategoryName').value = '';
  document.getElementById('goalCategoryAmount').value = '';

  // Cập nhật ngay giao diện
  loadGoalList();
  loadExpenseCategories(); // Cập nhật dropdown chọn chi tiêu bên ngoài luôn
}



// Load phân loại
function loadExpenseCategories() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const key = `goals_${currentUser.username}`;
  const goals = JSON.parse(localStorage.getItem(key)) || [];

  const categorySelect = document.getElementById('expenseCategory');
  categorySelect.innerHTML = '';

  goals.forEach(goal => {
    const option = document.createElement('option');
    option.value = goal.category;
    option.textContent = goal.category;
    categorySelect.appendChild(option);
  });
}

function loadGoalList() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const key = `goals_${currentUser.username}`;

  const goals = JSON.parse(localStorage.getItem(key)) || [];

  const goalList = document.getElementById('goalList');
  goalList.innerHTML = '';

  goals.forEach((goal, index) => {
    const card = document.createElement('div');
    card.className = 'p-3 border rounded-md bg-gray-100 dark:bg-gray-700 flex flex-col shadow-md';

    card.innerHTML = `
      <div class="mb-2">
        <h4 class="font-semibold text-sm truncate">${goal.category}</h4>
        <p class="text-xs text-gray-600 dark:text-gray-300">${goal.amount.toLocaleString()} VND</p>
      </div>
      <button onclick="deleteGoalCategory(${index})" class="self-end text-red-500 hover:text-red-700 text-xs">🗑️ Xóa</button>
    `;

    goalList.appendChild(card);
  });
}



// Lấy icon
// function getGoalIcon(category) {
//   switch (category.toLowerCase()) {
//     case 'ăn uống': return '🍽️';
//     case 'di chuyển': return '🚗';
//     case 'giải trí': return '🎮';
//     case 'tiết kiệm': return '💰';
//     case 'du lịch': return '✈️';
//     case 'mua sắm': return '🛒';
//     default: return '🎯'; // default icon
//   }
// }

function loadExpensesSummary() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const monthListDiv = document.getElementById('monthList');
  monthListDiv.innerHTML = '';

  const goalKey = `goals_${currentUser.username}`;
  const goals = JSON.parse(localStorage.getItem(goalKey)) || [];

  const goalMap = {};
  goals.forEach(goal => {
    goalMap[goal.category] = goal.amount;
  });

  // Gom chi tiêu theo tháng
  const allKeys = Object.keys(localStorage);
  const expenseKeys = allKeys.filter(key => key.startsWith(`data_${currentUser.username}_`));

  const monthData = {}; // { tháng: { budget: số, expenses: {} } }

  expenseKeys.forEach(key => {
    const parts = key.split('_');
    const month = parts[2];

    const data = JSON.parse(localStorage.getItem(key)) || { budget: 0, expenses: [] };

    if (!monthData[month]) {
      monthData[month] = {
        budget: data.budget || 0,
        expenses: {}
      };
    }

    data.expenses.forEach(exp => {
      if (!monthData[month].expenses[exp.category]) {
        monthData[month].expenses[exp.category] = 0;
      }
      monthData[month].expenses[exp.category] += exp.amount;
    });
  });

  // Render từng tháng
  for (const [month, data] of Object.entries(monthData)) {
    const monthCard = document.createElement('div');
    // monthCard.className = 'p-6 border rounded-xl bg-white dark:bg-gray-800 flex flex-col gap-4 shadow-lg'; 
    monthCard.className = 'month-card';
    // thêm shadow-lg


    const totalBudget = data.budget;
    let totalSpent = 0;

    for (const spent of Object.values(data.expenses)) {
      totalSpent += spent;
    }

    const totalRemaining = Math.max(totalBudget - totalSpent, 0);

    monthCard.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-2xl font-bold">📅 Tháng ${month}</h3>
        <button onclick="deleteMonth('${month}')" class="text-red-500 hover:text-red-700 text-sm flex items-center gap-1">
          🗑️ Xóa
        </button>
      </div>
      <div class="text-gray-700 dark:text-gray-300 mb-4">
        <p><strong>Tổng tiền đầu tháng:</strong> ${totalBudget.toLocaleString()} VND</p>
        <p><strong>Đã chi:</strong> ${totalSpent.toLocaleString()} VND</p>
        <p><strong>Còn lại:</strong> ${totalRemaining.toLocaleString()} VND</p>
      </div>
    `;

    const categoryList = document.createElement('div');
    categoryList.className = 'flex flex-col gap-3';

    for (const [category, spent] of Object.entries(data.expenses)) {
      const target = goalMap[category] || 0;
      const remaining = Math.max(target - spent, 0);

      const categoryCard = document.createElement('div');
      categoryCard.className = 'p-3 border rounded-md bg-gray-100 dark:bg-gray-700 flex flex-col';

      categoryCard.innerHTML = `
        <div class="flex justify-between items-center">
          <span class="font-semibold"><strong>${category}</strong></span>
          <span class="text-sm text-gray-600 dark:text-gray-300"> đã chi: ${spent.toLocaleString()} VND</span>
        </div>
        <div class="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mt-1">
          <span><strong>Mục tiêu: </strong>${target.toLocaleString()} VND</span>
          <span><strong>Còn lại: </strong>${remaining.toLocaleString()} VND</span>
        </div>
      `;

      categoryList.appendChild(categoryCard);
    }

    monthCard.appendChild(categoryList);
    monthListDiv.appendChild(monthCard);
  }
}


function deleteGoalCategory(index) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const key = `goals_${currentUser.username}`;

  let goals = JSON.parse(localStorage.getItem(key)) || [];
  goals.splice(index, 1);

  localStorage.setItem(key, JSON.stringify(goals));

  loadGoalList();
  loadExpenseCategories();
}
