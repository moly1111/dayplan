// XKM 任务扩展模块 - 添加 AI 预估完成时间功能
(function() {
    'use strict';

    // 等待 Tasks 对象可用
    function initExtension() {
        if (typeof Tasks === 'undefined' || !Tasks.createTaskElement) {
            console.warn('Tasks 对象未找到，等待加载...');
            setTimeout(initExtension, 100);
            return;
        }

        // 保存原始的 createTaskElement 方法
        const originalCreateTaskElement = Tasks.createTaskElement;
        
        // 保存原始的 loadTasks 方法
        const originalLoadTasks = Tasks.loadTasks;
        
        // 保存原始的 completeTask 方法
        const originalCompleteTask = Tasks.completeTask;
        
        // 保存原始的 deleteTask 方法
        const originalDeleteTask = Tasks.deleteTask;
        
        // 保存原始的 addTask 方法
        const originalAddTask = Tasks.addTask;
        
        // 计算连续完成天数（从昨天往前推，不包括今天）
        function calculateStreakDays() {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            let streak = 0;
            let checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - 1); // 从昨天开始
            
            // 往前推，直到遇到不满足条件的一天
            while (true) {
                const dateStr = Calendar.formatDate(checkDate);
                const tasks = Storage.getTasksByDate(dateStr);
                
                // 判断条件：有已完成任务 && 没有未完成任务（对应绿色点状态）
                const hasCompleted = tasks.completed.length > 0;
                const hasNoPending = tasks.pending.length === 0;
                
                if (hasCompleted && hasNoPending) {
                    streak++;
                    // 继续往前推一天
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    // 遇到不满足条件的一天，停止
                    break;
                }
            }
            
            return streak;
        }
        
        // 更新连续完成天数显示
        function updateStreakDays() {
            const streakDisplay = document.getElementById('streak-days');
            if (!streakDisplay) return;
            
            // 检查当前选中的日期是否为今天
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const currentDateStr = Tasks.currentDateStr || Calendar.formatDate(today);
            const selectedDate = new Date(currentDateStr + 'T00:00:00');
            
            // 只有今天是 Today 时才显示
            if (!Calendar.isSameDate(selectedDate, today)) {
                streakDisplay.textContent = '';
                streakDisplay.style.display = 'none';
                return;
            }
            
            const streak = calculateStreakDays();
            
            if (streak >= 2) {
                streakDisplay.textContent = `连续${streak}天`;
                streakDisplay.style.display = 'inline';
            } else {
                streakDisplay.textContent = '';
                streakDisplay.style.display = 'none';
            }
        }
        
        // 计算并更新总用时
        function updateTotalTime() {
            const totalTimeDisplay = document.getElementById('total-time-display');
            if (!totalTimeDisplay) return;
            
            const currentDateStr = Tasks.currentDateStr || Calendar.formatDate(new Date());
            const tasks = Storage.getTasksByDate(currentDateStr);
            
            // 计算所有未完成任务的总预估时间
            let totalMinutes = 0;
            tasks.pending.forEach(task => {
                if (task.estimatedMinutes && typeof task.estimatedMinutes === 'number') {
                    totalMinutes += task.estimatedMinutes;
                }
            });
            
            // 计算今天的剩余时间（分钟）
            const now = new Date();
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            const remainingMinutes = Math.max(0, Math.floor((today - now) / (1000 * 60)));
            
            // 更新显示
            const totalTimeValue = totalTimeDisplay.querySelector('.total-time-value');
            if (totalTimeValue) {
                totalTimeValue.textContent = `${totalMinutes} 分钟`;
                
                // 如果总用时超过剩余时间，显示为红色
                if (totalMinutes > remainingMinutes && remainingMinutes > 0) {
                    totalTimeDisplay.classList.add('over-limit');
                } else {
                    totalTimeDisplay.classList.remove('over-limit');
                }
            }
        }
        
        // 扩展 loadTasks 方法，在加载任务后更新总用时和连续天数
        Tasks.loadTasks = function(dateStr) {
            originalLoadTasks.call(this, dateStr);
            updateTotalTime();
            updateStreakDays();
        };
        
        // 扩展 completeTask 方法，在完成任务后更新总用时和连续天数
        Tasks.completeTask = function(taskId) {
            originalCompleteTask.call(this, taskId);
            // 延迟更新，等待动画完成
            setTimeout(() => {
                updateTotalTime();
                updateStreakDays();
            }, 350);
        };
        
        // 扩展 deleteTask 方法，在删除任务后更新总用时和连续天数
        Tasks.deleteTask = function(taskId, fromCompleted) {
            originalDeleteTask.call(this, taskId, fromCompleted);
            updateTotalTime();
            updateStreakDays();
        };
        
        // 扩展 addTask 方法，在添加任务后更新连续天数
        Tasks.addTask = function(text) {
            originalAddTask.call(this, text);
            updateStreakDays();
        };

        // 扩展 createTaskElement 方法
        Tasks.createTaskElement = function(task, isCompleted) {
            // 调用原始方法创建基础任务元素
            const taskEl = originalCreateTaskElement.call(this, task, isCompleted);
            
            // 只为未完成的任务添加预估时间功能
            if (!isCompleted) {
                const content = taskEl.querySelector('.task-item-content');
                const deleteBtn = taskEl.querySelector('.task-delete');
                
                if (content && deleteBtn) {
                    // 创建预估时间按钮容器
                    const estimateContainer = document.createElement('div');
                    estimateContainer.className = 'task-estimate-container';
                    
                    // 创建"预期完成时间"按钮
                    const estimateBtn = document.createElement('button');
                    estimateBtn.className = 'task-estimate-btn';
                    estimateBtn.textContent = '预期完成时间';
                    estimateBtn.title = '点击获取 AI 预估完成时间';
                    
                    // 创建显示区域（绿色框）
                    const estimateDisplay = document.createElement('div');
                    estimateDisplay.className = 'task-estimate-display';
                    estimateDisplay.style.display = 'none';
                    
                    // 如果任务已有保存的预估时间，直接显示
                    if (task.estimatedMinutes) {
                        estimateDisplay.textContent = `${task.estimatedMinutes} 分钟`;
                        estimateDisplay.style.display = 'block';
                        // 添加编辑图标提示
                        estimateDisplay.title = '双击可编辑时间';
                        estimateDisplay.style.cursor = 'pointer';
                    }
                    
                    // 按钮点击事件
                    estimateBtn.onclick = async (e) => {
                        e.stopPropagation();
                        
                        // 防止重复点击
                        if (estimateBtn.disabled) return;
                        
                        // 显示加载状态
                        estimateBtn.disabled = true;
                        estimateBtn.textContent = '预估中...';
                        estimateDisplay.style.display = 'none';
                        
                        try {
                            // 检查 DeepSeekAPI 是否可用
                            if (typeof DeepSeekAPI === 'undefined' || !DeepSeekAPI.estimateTaskTime) {
                                throw new Error('DeepSeekAPI 未加载');
                            }
                            
                            // 调用 API 获取预估时间
                            const minutes = await DeepSeekAPI.estimateTaskTime(task.text);
                            
                            // 保存预估时间到任务数据
                            const currentDateStr = Tasks.currentDateStr || Calendar.formatDate(new Date());
                            const tasks = Storage.getTasksByDate(currentDateStr);
                            const taskIndex = tasks.pending.findIndex(t => t.id === task.id);
                            if (taskIndex !== -1) {
                                tasks.pending[taskIndex].estimatedMinutes = minutes;
                                Storage.saveTasksByDate(currentDateStr, tasks);
                                // 更新任务对象
                                task.estimatedMinutes = minutes;
                            }
                            
                            // 显示结果（成功时清除错误状态）
                            estimateDisplay.classList.remove('error');
                            estimateDisplay.textContent = `${minutes} 分钟`;
                            estimateDisplay.style.display = 'block';
                            estimateBtn.textContent = '预期完成时间';
                            
                            // 更新总用时
                            updateTotalTime();
                        } catch (error) {
                            // 显示错误信息（保持红色状态，不再自动恢复为绿色）
                            estimateDisplay.textContent = '预估失败';
                            estimateDisplay.style.display = 'block';
                            estimateDisplay.classList.add('error');
                            console.error('预估时间失败:', error);
                        } finally {
                            estimateBtn.disabled = false;
                        }
                    };
                    
                    // 双击预估时间可编辑
                    estimateDisplay.ondblclick = (e) => {
                        e.stopPropagation();
                        this.editEstimatedTime(task, estimateDisplay);
                    };
                    
                    estimateContainer.appendChild(estimateBtn);
                    estimateContainer.appendChild(estimateDisplay);
                    
                    // 在任务文本之后插入（在 content 内部）
                    const text = content.querySelector('.task-text');
                    if (text && text.nextSibling) {
                        content.insertBefore(estimateContainer, text.nextSibling);
                    } else {
                        content.appendChild(estimateContainer);
                    }
                }
            }
            
            return taskEl;
        };

        // 编辑预估时间
        Tasks.editEstimatedTime = function(task, estimateDisplay) {
            const currentMinutes = task.estimatedMinutes || 0;
            const newMinutesStr = prompt('修改预估时间（分钟）：', currentMinutes);
            
            if (newMinutesStr !== null) {
                const newMinutes = parseInt(newMinutesStr, 10);
                if (!isNaN(newMinutes) && newMinutes >= 0) {
                    // 更新任务数据
                    const currentDateStr = Tasks.currentDateStr || Calendar.formatDate(new Date());
                    const tasks = Storage.getTasksByDate(currentDateStr);
                    const taskIndex = tasks.pending.findIndex(t => t.id === task.id);
                    if (taskIndex !== -1) {
                        tasks.pending[taskIndex].estimatedMinutes = newMinutes;
                        Storage.saveTasksByDate(currentDateStr, tasks);
                        // 更新任务对象
                        task.estimatedMinutes = newMinutes;
                        // 更新显示
                        estimateDisplay.textContent = `${newMinutes} 分钟`;
                        estimateDisplay.classList.remove('error');
                        // 更新总用时
                        updateTotalTime();
                    }
                } else {
                    alert('请输入有效的数字（≥0）');
                }
            }
        };

        console.log('XKM 任务扩展模块已加载');
        
        // 延迟更新连续天数，确保 Tasks.init() 已完成
        setTimeout(() => {
            updateStreakDays();
        }, 100);
    }

    // 在 DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initExtension);
    } else {
        // DOM 已经加载完成，直接初始化
        initExtension();
    }
})();

