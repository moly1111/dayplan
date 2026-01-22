// Plan 日历渲染模块
const PlanCalendar = {
    currentDate: new Date(),
    selectedDate: null,

    // 初始化
    init() {
        this.currentDate = new Date();
        this.render();
    },

    // 渲染月份大表
    render() {
        const grid = document.getElementById('plan-grid');
        if (!grid) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // 更新月份标题
        const monthTitle = document.getElementById('month-title');
        if (monthTitle) {
            monthTitle.textContent = `${year}年${month + 1}月`;
        }

        // 清空网格
        grid.innerHTML = '';

        // 获取月份第一天是星期几
        const firstDay = new Date(year, month, 1).getDay();
        // 获取月份天数
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        // 获取上个月最后几天（用于填充第一周）
        const prevMonthDays = new Date(year, month, 0).getDate();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 填充上个月的日期（灰色显示）
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = prevMonthDays - i;
            const dayEl = this.createDayElement(null, day, true);
            grid.appendChild(dayEl);
        }

        // 填充当前月的日期
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = PlanStorage.formatDate(date);
            const dayEl = this.createDayElement(dateStr, day, false, date.getTime() === today.getTime());
            grid.appendChild(dayEl);
        }

        // 填充下个月的日期（灰色显示）
        const totalCells = grid.children.length;
        const remainingCells = 42 - totalCells; // 6行 x 7列 = 42
        for (let day = 1; day <= remainingCells && day <= 14; day++) {
            const dayEl = this.createDayElement(null, day, true);
            grid.appendChild(dayEl);
        }
    },

    // 创建日期单元格元素
    createDayElement(dateStr, day, isOtherMonth, isToday = false) {
        const dayEl = document.createElement('div');
        dayEl.className = 'plan-day';
        
        if (isOtherMonth) {
            dayEl.classList.add('plan-day-other-month');
        }
        
        if (isToday) {
            dayEl.classList.add('plan-day-today');
        }

        // 日期数字
        const dayNumber = document.createElement('div');
        dayNumber.className = 'plan-day-number';
        dayNumber.textContent = day;
        dayEl.appendChild(dayNumber);

        // 如果有计划，添加标记
        if (dateStr) {
            const plans = PlanStorage.getPlansByDate(dateStr);
            if (plans.length > 0) {
                const markers = this.createPlanMarkers(plans);
                dayEl.appendChild(markers);
            }

            // 点击事件（显示计划列表）
            dayEl.onclick = (e) => {
                e.stopPropagation();
                if (window.PlanList) {
                    window.PlanList.show(dateStr);
                }
            };

            // 右键事件（显示上下文菜单）
            dayEl.oncontextmenu = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.PlanContextMenu) {
                    window.PlanContextMenu.show(e, dateStr);
                }
            };
        }

        return dayEl;
    },

    // 创建计划标记
    createPlanMarkers(plans) {
        const markersContainer = document.createElement('div');
        markersContainer.className = 'plan-day-markers';

        // 统计不同类型的计划
        const hasNormal = plans.some(p => p.type === 'normal' && !p.completedAt);
        const hasEbbinghaus = plans.some(p => p.type === 'ebbinghaus' && !p.completedAt);
        const hasCompleted = plans.some(p => p.completedAt);

        // 普通计划标记（蓝色）
        if (hasNormal) {
            const marker = document.createElement('div');
            marker.className = 'plan-marker plan-marker-normal';
            markersContainer.appendChild(marker);
        }

        // 遗忘曲线计划标记（紫色）
        if (hasEbbinghaus) {
            const marker = document.createElement('div');
            marker.className = 'plan-marker plan-marker-ebbinghaus';
            markersContainer.appendChild(marker);
        }

        // 已完成计划标记（绿色）
        if (hasCompleted) {
            const marker = document.createElement('div');
            marker.className = 'plan-marker plan-marker-completed';
            markersContainer.appendChild(marker);
        }

        return markersContainer;
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

    // 更新日历（当计划变化时调用）
    update() {
        this.render();
    }
};

