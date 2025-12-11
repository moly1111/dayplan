// 主逻辑模块
const Tasks = {
    currentDateStr: '',

    // 初始化
    init() {
        // 设置当前日期为今天
        const today = new Date();
        this.currentDateStr = Calendar.formatDate(today);
        Calendar.selectDate(today);
        
        // 加载任务
        this.loadTasks(this.currentDateStr);
        
        // 绑定事件
        this.bindEvents();
        
        // 更新日期标题
        this.updateDateTitle();
    },

    // 绑定事件
    bindEvents() {
        const taskInput = document.getElementById('task-input');
        if (taskInput) {
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && taskInput.value.trim()) {
                    this.addTask(taskInput.value.trim());
                    taskInput.value = '';
                }
            });
        }
    },

    // 加载任务
    loadTasks(dateStr) {
        this.currentDateStr = dateStr;
        const tasks = Storage.getTasksByDate(dateStr);
        
        // 渲染待办任务
        this.renderPendingTasks(tasks.pending);
        
        // 渲染已完成任务
        this.renderCompletedTasks(tasks.completed);
        
        // 更新日期标题
        this.updateDateTitle();
        
        // 更新日历标记
        Calendar.update();
    },

    // 渲染待办任务
    renderPendingTasks(pendingTasks) {
        const container = document.getElementById('pending-tasks');
        if (!container) return;
        
        container.innerHTML = '';
        
        pendingTasks.forEach(task => {
            const taskEl = this.createTaskElement(task, false);
            container.appendChild(taskEl);
        });
    },

    // 渲染已完成任务
    renderCompletedTasks(completedTasks) {
        const container = document.getElementById('completed-tasks');
        if (!container) return;
        
        container.innerHTML = '';
        
        completedTasks.forEach(task => {
            const taskEl = this.createTaskElement(task, true);
            container.appendChild(taskEl);
        });
    },

    // 创建任务元素
    createTaskElement(task, isCompleted) {
        const taskEl = document.createElement('div');
        taskEl.className = 'task-item';
        taskEl.dataset.taskId = task.id;
        
        const content = document.createElement('div');
        content.className = 'task-item-content';
        
        // 复选框
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = isCompleted;
        checkbox.onclick = (e) => {
            e.stopPropagation();
            if (!isCompleted) {
                this.completeTask(task.id);
            }
        };
        
        // 任务文本
        const text = document.createElement('div');
        text.className = 'task-text';
        text.textContent = task.text;
        if (!isCompleted) {
            text.ondblclick = () => this.editTask(task.id, false);
        }
        
        // 删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-delete';
        deleteBtn.textContent = '×';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            this.deleteTask(task.id, isCompleted);
        };
        
        content.appendChild(checkbox);
        content.appendChild(text);
        taskEl.appendChild(content);
        taskEl.appendChild(deleteBtn);
        
        return taskEl;
    },

    // 添加任务
    addTask(text) {
        if (!text.trim()) return;
        
        const taskId = Storage.addTask(this.currentDateStr, text);
        this.loadTasks(this.currentDateStr);
    },

    // 完成任务
    completeTask(taskId) {
        const settings = Storage.getSettings();
        
        // 播放击杀动画
        if (settings.killAnimation) {
            const taskEl = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskEl) {
                taskEl.classList.add('killing');
                
                // 播放音效
                if (settings.killSound) {
                    const sound = document.getElementById('kill-sound');
                    if (sound) {
                        sound.currentTime = 0;
                        sound.play().catch(e => console.log('Sound play failed:', e));
                    }
                }
                
                // 动画完成后移动任务
                setTimeout(() => {
                    Storage.completeTask(this.currentDateStr, taskId);
                    this.loadTasks(this.currentDateStr);
                }, 300);
                return;
            }
        }
        
        // 无动画直接完成
        Storage.completeTask(this.currentDateStr, taskId);
        this.loadTasks(this.currentDateStr);
    },

    // 删除任务
    deleteTask(taskId, fromCompleted) {
        Storage.deleteTask(this.currentDateStr, taskId, fromCompleted);
        this.loadTasks(this.currentDateStr);
    },

    // 编辑任务
    editTask(taskId, fromCompleted) {
        const taskEl = document.querySelector(`[data-task-id="${taskId}"]`);
        if (!taskEl) return;
        
        const textEl = taskEl.querySelector('.task-text');
        if (!textEl) return;
        
        const currentText = textEl.textContent;
        
        // 创建输入框
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'task-edit-input';
        input.value = currentText;
        
        // 替换文本元素
        textEl.parentNode.replaceChild(input, textEl);
        input.focus();
        input.select();
        
        // 保存编辑
        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                Storage.updateTask(this.currentDateStr, taskId, newText, fromCompleted);
                this.loadTasks(this.currentDateStr);
            } else {
                // 取消编辑，恢复原文本
                const newTextEl = document.createElement('div');
                newTextEl.className = 'task-text';
                newTextEl.textContent = currentText;
                if (!fromCompleted) {
                    newTextEl.ondblclick = () => this.editTask(taskId, fromCompleted);
                }
                input.parentNode.replaceChild(newTextEl, input);
            }
        };
        
        // Enter 保存
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            }
        });
        
        // 失去焦点保存
        input.addEventListener('blur', saveEdit);
        
        // ESC 取消
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const newTextEl = document.createElement('div');
                newTextEl.className = 'task-text';
                newTextEl.textContent = currentText;
                if (!fromCompleted) {
                    newTextEl.ondblclick = () => this.editTask(taskId, fromCompleted);
                }
                input.parentNode.replaceChild(newTextEl, input);
            }
        });
    },

    // 更新日期标题
    updateDateTitle() {
        const titleEl = document.getElementById('date-title');
        if (!titleEl) return;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(this.currentDateStr + 'T00:00:00');
        
        if (Calendar.isSameDate(selectedDate, today)) {
            titleEl.textContent = 'Today';
        } else {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            titleEl.textContent = `${year}/${month}/${day}`;
        }
    }
};

// 全局暴露 Tasks 对象供 Calendar 使用
window.Tasks = Tasks;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    Calendar.init();
    Tasks.init();
});

