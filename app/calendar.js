// 日历模块
const Calendar = {
    currentDate: new Date(),
    selectedDate: new Date(),

    // 初始化日历
    init() {
        this.selectedDate = new Date(); // 每次打开页面都默认选中今天
        this.render();
    },

    // 渲染日历
    render() {
        const container = document.getElementById('calendar');
        if (!container) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // 创建日历头部
        const header = document.createElement('div');
        header.className = 'calendar-header';
        
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '←';
        prevBtn.onclick = () => this.prevMonth();
        
        const monthText = document.createElement('div');
        monthText.className = 'calendar-month';
        monthText.textContent = `${year}年${month + 1}月`;
        
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '→';
        nextBtn.onclick = () => this.nextMonth();
        
        header.appendChild(prevBtn);
        header.appendChild(monthText);
        header.appendChild(nextBtn);

        // 创建星期标题
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        const weekHeader = document.createElement('div');
        weekHeader.className = 'calendar-grid';
        weekDays.forEach(day => {
            const dayName = document.createElement('div');
            dayName.className = 'calendar-day-name';
            dayName.textContent = day;
            weekHeader.appendChild(dayName);
        });

        // 创建日期网格
        const grid = document.createElement('div');
        grid.className = 'calendar-grid';

        // 获取月份第一天是星期几
        const firstDay = new Date(year, month, 1).getDay();
        // 获取月份天数
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        // 获取上个月最后几天（用于填充第一周）
        const prevMonthDays = new Date(year, month, 0).getDate();

        // 填充上个月的日期（灰色显示，不可点击）
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = document.createElement('div');
            day.className = 'calendar-day';
            day.style.opacity = '0.3';
            day.style.cursor = 'default';
            const dayNumber = document.createElement('div');
            dayNumber.className = 'calendar-day-number';
            dayNumber.textContent = prevMonthDays - i;
            day.appendChild(dayNumber);
            grid.appendChild(day);
        }

        // 填充当前月的日期
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = this.formatDate(date);
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            
            // 检查是否是今天
            if (date.getTime() === today.getTime()) {
                dayEl.classList.add('today');
            }
            
            // 检查是否是选中的日期
            if (this.isSameDate(date, this.selectedDate)) {
                dayEl.classList.add('selected');
            }
            
            // 添加日期数字
            const dayNumber = document.createElement('div');
            dayNumber.className = 'calendar-day-number';
            dayNumber.textContent = day;
            dayEl.appendChild(dayNumber);
            
            // 检查是否有任务，添加标记点
            if (Storage.hasTasks(dateStr)) {
                const dot = document.createElement('div');
                dot.className = 'calendar-day-dot';
                
                if (Storage.isOverdue(dateStr)) {
                    dot.classList.add('overdue');
                } else if (Storage.hasCompletedTasks(dateStr) && !Storage.hasPendingTasks(dateStr)) {
                    dot.classList.add('completed');
                } else {
                    dot.classList.add('planned');
                }
                
                dayEl.appendChild(dot);
            }
            
            // 点击事件
            dayEl.onclick = () => {
                this.selectDate(date);
            };
            
            grid.appendChild(dayEl);
        }

        // 填充下个月的日期（灰色显示，不可点击）
        const totalCells = grid.children.length;
        const remainingCells = 42 - totalCells; // 6行 x 7列 = 42
        for (let day = 1; day <= remainingCells && day <= 14; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.style.opacity = '0.3';
            dayEl.style.cursor = 'default';
            const dayNumber = document.createElement('div');
            dayNumber.className = 'calendar-day-number';
            dayNumber.textContent = day;
            dayEl.appendChild(dayNumber);
            grid.appendChild(dayEl);
        }

        // 清空容器并添加新内容
        container.innerHTML = '';
        container.appendChild(header);
        container.appendChild(weekHeader);
        container.appendChild(grid);
    },

    // 上一个月
    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
    },

    // 下一个月
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
    },

    // 选择日期
    selectDate(date) {
        this.selectedDate = new Date(date);
        this.render();
        // 触发日期切换事件
        if (window.Tasks) {
            window.Tasks.loadTasks(this.formatDate(date));
        }
    },

    // 获取选中的日期字符串
    getSelectedDateStr() {
        return this.formatDate(this.selectedDate);
    },

    // 格式化日期为 YYYY-MM-DD
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // 判断两个日期是否是同一天
    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    },

    // 更新日历标记（当任务变化时调用）
    update() {
        this.render();
    }
};

