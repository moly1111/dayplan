// XKM 快捷任务模块
(function() {
    'use strict';

    const QuickTasks = {
        // 初始化
        init() {
            this.loadQuickTasks();
            this.bindEvents();
        },

        // 获取快捷任务列表
        getQuickTasks() {
            const settings = Storage.getSettings();
            return settings.quickTasks || [];
        },

        // 保存快捷任务列表
        saveQuickTasks(tasks) {
            Storage.saveSettings({ quickTasks: tasks });
        },

        // 加载并渲染快捷任务列表
        loadQuickTasks() {
            const quickTasksList = document.getElementById('quick-tasks-list');
            if (!quickTasksList) return;

            const tasks = this.getQuickTasks();
            quickTasksList.innerHTML = '';

            if (tasks.length === 0) {
                const emptyMsg = document.createElement('div');
                emptyMsg.className = 'quick-tasks-empty';
                emptyMsg.textContent = '暂无常用任务，在下方添加';
                quickTasksList.appendChild(emptyMsg);
                return;
            }

            tasks.forEach((task, index) => {
                const taskItem = document.createElement('div');
                taskItem.className = 'quick-task-item';

                const taskText = document.createElement('span');
                taskText.className = 'quick-task-text';
                taskText.textContent = task;

                const actions = document.createElement('div');
                actions.className = 'quick-task-actions';

                const addBtn = document.createElement('button');
                addBtn.className = 'quick-task-use-btn';
                addBtn.textContent = '添加';
                addBtn.title = '添加到今日任务';
                addBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.addToToday(task);
                };

                const editBtn = document.createElement('button');
                editBtn.className = 'quick-task-edit-btn';
                editBtn.textContent = '编辑';
                editBtn.title = '编辑此任务';
                editBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.editTask(index, task);
                };

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'quick-task-delete-btn';
                deleteBtn.textContent = '删除';
                deleteBtn.title = '删除此任务';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.deleteTask(index);
                };

                actions.appendChild(addBtn);
                actions.appendChild(editBtn);
                actions.appendChild(deleteBtn);

                taskItem.appendChild(taskText);
                taskItem.appendChild(actions);
                quickTasksList.appendChild(taskItem);
            });
        },

        // 添加到今日任务
        addToToday(taskText) {
            if (!taskText || !taskText.trim()) return;

            if (typeof Tasks !== 'undefined' && Tasks.currentDateStr) {
                const taskId = Storage.addTask(Tasks.currentDateStr, taskText.trim());
                if (window.Tasks && Tasks.loadTasks) {
                    Tasks.loadTasks(Tasks.currentDateStr);
                }
            } else {
                // 如果 Tasks 未加载，直接添加到输入框
                const taskInput = document.getElementById('task-input');
                if (taskInput) {
                    taskInput.value = taskText.trim();
                    taskInput.focus();
                }
            }
        },

        // 编辑任务
        editTask(index, currentText) {
            const newText = prompt('编辑任务内容：', currentText);
            if (newText !== null && newText.trim() && newText.trim() !== currentText) {
                const tasks = this.getQuickTasks();
                tasks[index] = newText.trim();
                this.saveQuickTasks(tasks);
                this.loadQuickTasks();
            }
        },

        // 删除任务
        deleteTask(index) {
            if (confirm('确定要删除这个常用任务吗？')) {
                const tasks = this.getQuickTasks();
                tasks.splice(index, 1);
                this.saveQuickTasks(tasks);
                this.loadQuickTasks();
            }
        },

        // 添加新任务
        addTask() {
            const input = document.getElementById('quick-task-input');
            if (!input) return;

            const text = input.value.trim();
            if (!text) {
                alert('请输入任务内容');
                return;
            }

            const tasks = this.getQuickTasks();
            if (tasks.includes(text)) {
                alert('该任务已存在');
                return;
            }

            tasks.push(text);
            this.saveQuickTasks(tasks);
            this.loadQuickTasks();

            // 清空输入框
            input.value = '';
            input.focus();
        },

        // 绑定事件
        bindEvents() {
            // 快捷任务按钮
            const quickTasksBtn = document.getElementById('quick-tasks-btn');
            const quickTasksPanel = document.getElementById('quick-tasks-panel');

            if (quickTasksBtn && quickTasksPanel) {
                quickTasksBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    quickTasksPanel.classList.toggle('hidden');
                });

                // 点击外部关闭面板
                document.addEventListener('click', (e) => {
                    if (!quickTasksPanel.contains(e.target) && 
                        !quickTasksBtn.contains(e.target)) {
                        quickTasksPanel.classList.add('hidden');
                    }
                });
            }

            // 添加按钮
            const addBtn = document.getElementById('quick-task-add');
            if (addBtn) {
                addBtn.addEventListener('click', () => {
                    this.addTask();
                });
            }

            // 输入框回车添加
            const input = document.getElementById('quick-task-input');
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.addTask();
                    }
                });
            }
        }
    };

    // 等待 Storage 和 Tasks 加载完成
    function initQuickTasks() {
        if (typeof Storage === 'undefined') {
            setTimeout(initQuickTasks, 100);
            return;
        }
        QuickTasks.init();
        console.log('XKM 快捷任务模块已加载');
    }

    // 在 DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initQuickTasks);
    } else {
        initQuickTasks();
    }
})();

