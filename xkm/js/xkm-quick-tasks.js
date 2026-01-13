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

            tasks.forEach((taskObj, index) => {
                // 兼容旧格式（字符串）和新格式（对象）
                const task = typeof taskObj === 'string' ? taskObj : taskObj.text;
                const estimatedMinutes = typeof taskObj === 'object' ? taskObj.estimatedMinutes : null;

                const taskItem = document.createElement('div');
                taskItem.className = 'quick-task-item';

                const taskText = document.createElement('span');
                taskText.className = 'quick-task-text';
                taskText.textContent = task;
                
                // 如果有预估时间，显示时间标签
                if (estimatedMinutes !== null && estimatedMinutes !== undefined) {
                    const timeBadge = document.createElement('span');
                    timeBadge.className = 'quick-task-time-badge';
                    timeBadge.textContent = `${estimatedMinutes}分钟`;
                    taskText.appendChild(timeBadge);
                }

                const actions = document.createElement('div');
                actions.className = 'quick-task-actions';

                const addBtn = document.createElement('button');
                addBtn.className = 'quick-task-use-btn';
                addBtn.textContent = '添加';
                addBtn.title = '添加到今日任务';
                addBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.addToToday(task, estimatedMinutes);
                };

                const editBtn = document.createElement('button');
                editBtn.className = 'quick-task-edit-btn';
                editBtn.textContent = '编辑';
                editBtn.title = '编辑此任务';
                editBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.editTask(index, taskObj);
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
        async addToToday(taskText, estimatedMinutes = null) {
            if (!taskText || !taskText.trim()) return;

            if (typeof Tasks !== 'undefined' && Tasks.currentDateStr) {
                const taskId = Storage.addTask(Tasks.currentDateStr, taskText.trim());
                
                // 如果有保存的预估时间，直接设置
                if (estimatedMinutes !== null && estimatedMinutes !== undefined) {
                    const tasks = Storage.getTasksByDate(Tasks.currentDateStr);
                    const taskIndex = tasks.pending.findIndex(t => t.id === taskId);
                    if (taskIndex !== -1) {
                        tasks.pending[taskIndex].estimatedMinutes = estimatedMinutes;
                        Storage.saveTasksByDate(Tasks.currentDateStr, tasks);
                    }
                }
                
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
        editTask(index, currentTaskObj) {
            // 兼容旧格式
            const currentText = typeof currentTaskObj === 'string' ? currentTaskObj : currentTaskObj.text;
            const currentMinutes = typeof currentTaskObj === 'object' ? currentTaskObj.estimatedMinutes : null;
            
            const newText = prompt('编辑任务内容：', currentText);
            if (newText !== null && newText.trim() && newText.trim() !== currentText) {
                const tasks = this.getQuickTasks();
                // 保持原有的预估时间
                tasks[index] = {
                    text: newText.trim(),
                    estimatedMinutes: currentMinutes
                };
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

        // 添加新任务（自动预估时间）
        async addTask() {
            const input = document.getElementById('quick-task-input');
            if (!input) return;

            const text = input.value.trim();
            if (!text) {
                alert('请输入任务内容');
                return;
            }

            const tasks = this.getQuickTasks();
            // 检查是否已存在（兼容新旧格式）
            const exists = tasks.some(t => {
                const taskText = typeof t === 'string' ? t : t.text;
                return taskText === text;
            });
            
            if (exists) {
                alert('该任务已存在');
                return;
            }

            // 创建新任务对象，先不设置预估时间
            const newTask = { text: text, estimatedMinutes: null };
            tasks.push(newTask);
            this.saveQuickTasks(tasks);
            this.loadQuickTasks();

            // 自动预估时间
            try {
                if (typeof DeepSeekAPI !== 'undefined' && DeepSeekAPI.estimateTaskTime) {
                    const minutes = await DeepSeekAPI.estimateTaskTime(text);
                    // 更新刚添加的任务的预估时间
                    const updatedTasks = this.getQuickTasks();
                    const taskIndex = updatedTasks.findIndex(t => {
                        const taskText = typeof t === 'string' ? t : t.text;
                        return taskText === text;
                    });
                    if (taskIndex !== -1) {
                        if (typeof updatedTasks[taskIndex] === 'string') {
                            updatedTasks[taskIndex] = { text: updatedTasks[taskIndex], estimatedMinutes: minutes };
                        } else {
                            updatedTasks[taskIndex].estimatedMinutes = minutes;
                        }
                        this.saveQuickTasks(updatedTasks);
                        this.loadQuickTasks();
                    }
                }
            } catch (error) {
                console.error('自动预估时间失败:', error);
                // 即使预估失败，任务也已经添加了
            }

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

