/**
 * ===============================
 * 📄 Dashboard.js - Mục lục file
 * ===============================
 * 
 * 1. Khởi tạo trang và kiểm tra đăng nhập
 * 2. Quản lý Tổng tiền và Khoản chi
 * 3. Quản lý Mục tiêu
 * 4. Load phân loại chi tiêu
 * 5. Xử lý Thống kê (Biểu đồ)
 * 6. Load Chi tiêu theo tháng (Giao diện)
 * 7. Quản lý Hồ sơ và Cài đặt
 * 8. Sự kiện đóng Setting Menu
 * 
 * ===============================
 */



// ==== 1. Khởi tạo trang và Đăng nhập ====
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
  drawExpenseChart();

  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.body.classList.add('dark');
    document.getElementById('themeButton').innerHTML = '🌙 Chế độ';
  }
});

// ==== 2. Quản lý Tổng tiền và Khoản chi ====
function saveBudget() {
  const month = document.getElementById('budgetMonth').value;
  const budget = parseFloat(document.getElementById('totalBudget').value);

  if (!month || !budget || budget <= 0) {
    alert('Vui lòng chọn tháng và nhập tổng tiền hợp lệ.');
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const key = `data_${currentUser.username}_${month}`;

  const data = JSON.parse(localStorage.getItem(key)) || { budget: 0, expenses: [] };
  data.budget = budget;
  localStorage.setItem(key, JSON.stringify(data));

  alert('Đã lưu tổng tiền cho tháng ' + month + '!');
  loadExpensesSummary();
}

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

  document.getElementById('expenseName').value = '';
  document.getElementById('expenseAmount').value = '';

  loadExpensesSummary();
  drawExpenseChart();
}

function deleteMonth(month) {
  if (confirm(`Bạn có chắc chắn muốn xoá toàn bộ chi tiêu của tháng ${month}?`)) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const key = `data_${currentUser.username}_${month}`;
    localStorage.removeItem(key);

    loadExpensesSummary();
    alert('Đã xoá chi tiêu tháng ' + month);
    drawExpenseChart();
  }
}

// ==== 3. Quản lý Mục tiêu ====
function openGoals() {
  document.getElementById('goalsModal').style.display = 'flex';
  loadGoalList();
  loadExpenseCategories();
}

function closeGoals() {
  document.getElementById('goalsModal').style.display = 'none';
}

function addGoalCategory() {
  const name = document.getElementById('goalCategoryName').value.trim();
  const amount = parseFloat(document.getElementById('goalCategoryAmount').value);
  const emoji = document.getElementById('goalCategoryEmoji').value || "🎯";

  if (!name || isNaN(amount) || amount <= 0) {
    alert('Vui lòng nhập tên loại và số tiền hợp lệ.');
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const key = `goals_${currentUser.username}`;
  let goals = JSON.parse(localStorage.getItem(key)) || [];

  const existing = goals.find(goal => goal.category.toLowerCase() === name.toLowerCase());
  if (existing) {
    existing.amount = amount;
    existing.emoji = emoji;
  } else {
    goals.push({ category: name, amount, emoji });
  }

  localStorage.setItem(key, JSON.stringify(goals));

  document.getElementById('goalCategoryName').value = '';
  document.getElementById('goalCategoryAmount').value = '';
  document.getElementById('goalCategoryEmoji').value = '';

  loadGoalList();
  loadExpenseCategories();
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

function loadGoalList() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;

  const key = `goals_${currentUser.username}`;
  const goals = JSON.parse(localStorage.getItem(key)) || [];

  const goalList = document.getElementById('goalList');
  goalList.innerHTML = '';

  goals.forEach((goal, index) => {
    const card = document.createElement('div');
    card.className = 'p-3 border rounded-lg bg-gray-100 dark:bg-gray-700 flex flex-col justify-between shadow-md';
    card.innerHTML = `
      <div class="mb-2">
        <h4 class="font-semibold text-sm truncate">${goal.emoji || "🎯"} ${goal.category}</h4>
        <p class="text-xs text-gray-600 dark:text-gray-300">${goal.amount.toLocaleString()} VND</p>
      </div>
      <button onclick="deleteGoalCategory(${index})" class="self-end text-red-500 hover:text-red-700 text-xs">🗑️ Xóa</button>
    `;
    goalList.appendChild(card);
  });
}

// ==== 4. Load phân loại mục tiêu ====
function loadExpenseCategories() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;

  const key = `goals_${currentUser.username}`;
  const goals = JSON.parse(localStorage.getItem(key)) || [];

  const categorySelect = document.getElementById('expenseCategory');
  categorySelect.innerHTML = '';

  goals.forEach(goal => {
    const option = document.createElement('option');
    option.value = goal.category;
    option.textContent = `${goal.emoji || "🎯"} ${goal.category}`;
    categorySelect.appendChild(option);
  });
}

// ==== 5. Xử lý Thống kê (Biểu đồ) ====
function drawExpenseChart() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;

  const allKeys = Object.keys(localStorage);
  const expenseKeys = allKeys.filter(key => key.startsWith(`data_${currentUser.username}_`));
  const categoryTotals = {};

  expenseKeys.forEach(key => {
    const data = JSON.parse(localStorage.getItem(key)) || { expenses: [] };
    data.expenses.forEach(exp => {
      if (!categoryTotals[exp.category]) {
        categoryTotals[exp.category] = 0;
      }
      categoryTotals[exp.category] += exp.amount;
    });
  });

  const ctx = document.getElementById('expensesChart').getContext('2d');

  if (window.expenseChart) {
    window.expenseChart.destroy();
  }

  window.expenseChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff', '#ff9f40'
        ]
      }]
    },
    options: {
      maintainAspectRatio: true,
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#333'
          }
        }
      }
    }
  });
}

// ==== 6. Load Chi tiêu theo tháng (Giao diện) ====
function loadExpensesSummary() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const monthListDiv = document.getElementById('monthList');
  monthListDiv.innerHTML = '';

  const goalKey = `goals_${currentUser.username}`;
  const goals = JSON.parse(localStorage.getItem(goalKey)) || [];

  const goalMap = {};
  goals.forEach(goal => {
    goalMap[goal.category] = {
      amount: goal.amount,
      emoji: goal.emoji || "🎯"
    };
  });


  const allKeys = Object.keys(localStorage);
  const expenseKeys = allKeys.filter(key => key.startsWith(`data_${currentUser.username}_`));
  const monthData = {};

  expenseKeys.forEach(key => {
    const parts = key.split('_');
    const month = parts[2];
    const data = JSON.parse(localStorage.getItem(key)) || { budget: 0, expenses: [] };

    if (!monthData[month]) {
      monthData[month] = { budget: data.budget || 0, expenses: {} };
    }

    data.expenses.forEach(exp => {
      if (!monthData[month].expenses[exp.category]) {
        monthData[month].expenses[exp.category] = 0;
      }
      monthData[month].expenses[exp.category] += exp.amount;
    });
  });

  for (const [month, data] of Object.entries(monthData)) {
    const monthCard = document.createElement('div');
    monthCard.className = 'month-card';

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
        <p><strong>💰 Tổng tiền đầu tháng:</strong> ${totalBudget.toLocaleString()} VND</p>
        <p><strong>💸 Đã chi:</strong> ${totalSpent.toLocaleString()} VND</p>
        <p><strong>👛 Còn lại:</strong> ${totalRemaining.toLocaleString()} VND</p>
      </div>
    `;

    const categoryList = document.createElement('div');
    categoryList.className = 'flex flex-col gap-3';

    for (const [category, spent] of Object.entries(data.expenses)) {
      const target = goalMap[category]?.amount || 0;
      const remaining = Math.max(target - spent, 0);

      const categoryCard = document.createElement('div');
      categoryCard.className = 'p-3 border rounded-md bg-gray-100 dark:bg-gray-700 flex flex-col';

      categoryCard.innerHTML = `
        <div class="flex justify-between items-center">
          <span class="font-semibold"><strong>${goalMap[category]?.emoji || "🎯"} ${category}</strong></span>
          <span class="text-sm text-gray-600 dark:text-gray-300">💸 đã chi: ${spent.toLocaleString()} VND</span>
        </div>
        <div class="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300 mt-1">
          <span><strong>🎯 Mục tiêu: </strong>${target.toLocaleString()} VND</span>
          <span><strong>👛 Còn lại: </strong>${remaining.toLocaleString()} VND</span>
        </div>
      `;
      categoryList.appendChild(categoryCard);
    }

    monthCard.appendChild(categoryList);
    monthListDiv.appendChild(monthCard);
  }
}

// ==== 7. Quản lý Hồ sơ và Cài đặt ====
function openProfile() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  document.getElementById('profileUsername').textContent = `Tên đăng nhập: ${currentUser.username}`;
  document.getElementById('profileEmail').textContent = `Email: ${currentUser.email}`;
  document.getElementById('profileModal').style.display = 'flex';
}

function closeProfile() {
  document.getElementById('profileModal').style.display = 'none';
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

function confirmLogout() {
  if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }
}

function toggleSettings() {
  const menu = document.getElementById('settingsMenu');
  menu.classList.toggle('show');
}

function deleteAllData() {
  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu chi tiêu và ngân sách không?')) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
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

function deleteAccount() {
  if (confirm('Bạn có chắc chắn muốn xóa tài khoản và toàn bộ dữ liệu?')) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.filter(user => user.username !== currentUser.username);
    localStorage.setItem('users', JSON.stringify(users));
    deleteAllData();
    localStorage.removeItem('currentUser');
    alert('Đã xóa tài khoản thành công.');
    window.location.href = 'register.html';
  }
}

// ==== 8. Sự kiện Click ngoài đóng Setting Menu ====
document.addEventListener('click', function (event) {
  const menu = document.getElementById('settingsMenu');
  const settingsButton = document.getElementById('settingsButton');

  if (menu.classList.contains('show') &&
      !menu.contains(event.target) &&
      !settingsButton.contains(event.target)) {
    menu.classList.remove('show');
  }
});
