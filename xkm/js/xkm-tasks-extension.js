// XKM 任务扩展模块 - 添加 AI 预估完成时间功能
(function() {
    'use strict';

    // 全局计时器管理器 - 每个任务的计时器完全独立
    const TimerManager = {
        timers: {}, // { taskId: { interval, state, elapsedSeconds, startTime, displayElement, ... } }
        
        // 创建或获取计时器
        getTimer(taskId) {
            if (!this.timers[taskId]) {
                this.timers[taskId] = {
                    interval: null,
                    state: 'idle', // 'idle', 'running', 'paused'
                    elapsedSeconds: 0,
                    startTime: null,
                    displayElement: null,
                    btnElement: null,
                    menuElement: null
                };
            }
            return this.timers[taskId];
        },
        
        // 清理计时器
        clearTimer(taskId) {
            const timer = this.timers[taskId];
            if (timer && timer.interval) {
                clearInterval(timer.interval);
                timer.interval = null;
            }
        },
        
        // 删除计时器
        removeTimer(taskId) {
            this.clearTimer(taskId);
            delete this.timers[taskId];
        }
    };

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

        // 记录今日是否已经处于"全部完成"状态，避免重复触发
        let lastTodayCompleted = false;
        
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
        
        // 计算今天是否全部完成（仅今天，且至少有一条已完成任务）
        function isTodayFullyCompleted() {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = Calendar.formatDate(today);
            const tasks = Storage.getTasksByDate(todayStr);
            return tasks.pending.length === 0 && tasks.completed.length > 0;
        }

        // 可能触发“今日全部完成”庆祝效果
        function maybeCelebrateTodayCompletion() {
            const nowCompleted = isTodayFullyCompleted();
            if (!lastTodayCompleted && nowCompleted) {
                // 状态从“未全部完成”切换为“全部完成”，触发庆祝
                const settings = Storage.getSettings();
                console.log('[xkm] Today fully completed, settings:', {
                    todayCheerSound: settings.todayCheerSound,
                    todayConfetti: settings.todayConfetti
                });

                // 音效
                if (settings.todayCheerSound) {
                    const cheer = document.getElementById('today-cheer-sound');
                    if (cheer) {
                        try {
                            cheer.currentTime = 0;
                            const playPromise = cheer.play();
                            if (playPromise && typeof playPromise.then === 'function') {
                                playPromise.catch(err => {
                                    console.warn('[xkm] Cheer sound play rejected by browser:', err);
                                });
                            }
                        } catch (e) {
                            console.warn('[xkm] Cheer sound play exception:', e);
                        }
                    } else {
                        console.warn('[xkm] today-cheer-sound element not found');
                    }
                }

                // 彩带（使用 canvas-confetti，如果可用）
                if (settings.todayConfetti) {
                    try {
                        if (typeof confetti === 'function') {
                            const duration = 7000;
                            const end = Date.now() + duration;
                            (function frame() {
                                confetti({
                                    particleCount: 7,
                                    spread: 90,
                                    startVelocity: 40,
                                    gravity: 0.9,
                                    // 延长存在时间，使彩带大约飘过页面三分之二高度后再消散
                                    ticks: 350,
                                    origin: { x: Math.random(), y: 0 }
                                });
                                if (Date.now() < end) {
                                    requestAnimationFrame(frame);
                                }
                            })();
                        } else {
                            console.log('[xkm] canvas-confetti 未加载，跳过彩带效果');
                        }
                    } catch (e) {
                        console.log('[xkm] Confetti failed:', e);
                    }
                }
            }
            lastTodayCompleted = nowCompleted;
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
        
        // 扩展 loadTasks 方法，在加载任务后更新总用时、连续天数
        Tasks.loadTasks = function(dateStr) {
            originalLoadTasks.call(this, dateStr);
            updateTotalTime();
            updateStreakDays();
        };
        
        // 扩展 completeTask 方法，在完成任务后更新总用时、连续天数和今日完成状态
        Tasks.completeTask = function(taskId) {
            originalCompleteTask.call(this, taskId);
            // 延迟更新，等待动画完成
            setTimeout(() => {
                updateTotalTime();
                updateStreakDays();
                maybeCelebrateTodayCompletion();
            }, 350);
        };
        
        // 扩展 deleteTask 方法，在删除任务后更新总用时、连续天数，并清理计时器
        Tasks.deleteTask = function(taskId, fromCompleted) {
            originalDeleteTask.call(this, taskId, fromCompleted);
            // 清理该任务的计时器
            TimerManager.removeTimer(taskId);
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
                    
                    // 获取或创建该任务的计时器（全局管理，不受任务重新渲染影响）
                    const timer = TimerManager.getTimer(task.id);
                    
                    // 创建计时按钮容器
                    const timerContainer = document.createElement('div');
                    timerContainer.className = 'task-timer-container';
                    
                    // 创建计时按钮
                    const timerBtn = document.createElement('button');
                    timerBtn.className = 'task-timer-btn';
                    timerBtn.textContent = '计时';
                    timerBtn.title = '点击开始计时';
                    
                    // 创建计时显示区域
                    const timerDisplay = document.createElement('div');
                    timerDisplay.className = 'task-timer-display';
                    
                    // 创建悬停菜单
                    const timerMenu = document.createElement('div');
                    timerMenu.className = 'task-timer-menu';
                    timerMenu.style.display = 'none';
                    
                    const pauseBtn = document.createElement('button');
                    pauseBtn.className = 'task-timer-menu-item';
                    pauseBtn.textContent = '暂停';
                    
                    const resumeBtn = document.createElement('button');
                    resumeBtn.className = 'task-timer-menu-item';
                    resumeBtn.textContent = '继续';
                    resumeBtn.style.display = 'none';
                    
                    const restartBtn = document.createElement('button');
                    restartBtn.className = 'task-timer-menu-item';
                    restartBtn.textContent = '重新开始';
                    
                    timerMenu.appendChild(pauseBtn);
                    timerMenu.appendChild(resumeBtn);
                    timerMenu.appendChild(restartBtn);
                    
                    // 保存 DOM 元素引用到计时器对象
                    timer.btnElement = timerBtn;
                    timer.displayElement = timerDisplay;
                    timer.menuElement = timerMenu;
                    timer.pauseBtn = pauseBtn;
                    timer.resumeBtn = resumeBtn;
                    
                    // 格式化时间显示
                    function formatTime(seconds) {
                        const mins = Math.floor(seconds / 60);
                        const secs = seconds % 60;
                        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                    }
                    
                    // 更新计时显示
                    function updateTimerDisplay() {
                        if (timer.displayElement) {
                            const elapsed = timer.state === 'running' && timer.startTime
                                ? Math.floor((Date.now() - timer.startTime) / 1000)
                                : timer.elapsedSeconds;
                            timer.displayElement.textContent = formatTime(elapsed);
                        }
                    }
                    
                    // 编辑时间（双击时调用）
                    function editTimer() {
                        if (!timer.displayElement) return;
                        
                        const currentElapsed = timer.state === 'running' && timer.startTime
                            ? Math.floor((Date.now() - timer.startTime) / 1000)
                            : timer.elapsedSeconds;
                        const currentTimeStr = formatTime(currentElapsed);
                        
                        // 创建输入框
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.value = currentTimeStr;
                        input.style.cssText = `
                            min-width: 60px;
                            padding: 4px 8px;
                            font-size: 15px;
                            font-weight: 600;
                            text-align: center;
                            background-color: transparent;
                            color: var(--text-color);
                            border: 1px solid var(--border-color);
                            border-radius: 4px;
                            font-family: inherit;
                            font-variant-numeric: tabular-nums;
                        `;
                        
                        // 替换显示元素
                        const parent = timer.displayElement.parentNode;
                        parent.replaceChild(input, timer.displayElement);
                        input.focus();
                        input.select();
                        
                        // 验证格式：mm:ss
                        function validateTimeFormat(str) {
                            const regex = /^(\d{1,2}):(\d{2})$/;
                            const match = str.match(regex);
                            if (!match) return null;
                            const mins = parseInt(match[1], 10);
                            const secs = parseInt(match[2], 10);
                            if (secs >= 60) return null; // 秒数不能超过59
                            return mins * 60 + secs; // 返回总秒数
                        }
                        
                        // 防止重复调用标志
                        let isSaving = false;
                        
                        // 保存编辑
                        function saveEdit() {
                            // 防止重复调用
                            if (isSaving) return;
                            isSaving = true;
                            
                            const newTimeStr = input.value.trim();
                            const newSeconds = validateTimeFormat(newTimeStr);
                            
                            if (newSeconds !== null && newSeconds !== currentElapsed) {
                                // 更新计时器状态
                                timer.elapsedSeconds = newSeconds;
                                
                                // 如果正在运行，需要调整 startTime
                                if (timer.state === 'running' && timer.startTime) {
                                    timer.startTime = Date.now() - (newSeconds * 1000);
                                }
                                
                                // 恢复显示元素
                                parent.replaceChild(timer.displayElement, input);
                                updateTimerDisplay();
                            } else if (newSeconds === null) {
                                // 格式错误，恢复原值
                                alert('格式错误！请输入 mm:ss 格式（例如：05:30）');
                                parent.replaceChild(timer.displayElement, input);
                            } else {
                                // 没有变化，直接恢复
                                parent.replaceChild(timer.displayElement, input);
                            }
                            
                            // 重置标志
                            setTimeout(() => {
                                isSaving = false;
                            }, 100);
                        }
                        
                        // Enter 保存
                        input.addEventListener('keypress', (e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                saveEdit();
                            }
                        });
                        
                        // 失去焦点保存
                        input.addEventListener('blur', saveEdit);
                        
                        // ESC 取消
                        input.addEventListener('keydown', (e) => {
                            if (e.key === 'Escape') {
                                parent.replaceChild(timer.displayElement, input);
                            }
                        });
                    }
                    
                    // 开始计时
                    function startTimer() {
                        if (timer.state === 'idle') {
                            timer.elapsedSeconds = 0;
                            timer.startTime = Date.now();
                        } else if (timer.state === 'paused') {
                            timer.startTime = Date.now() - (timer.elapsedSeconds * 1000);
                        }
                        
                        timer.state = 'running';
                        
                        // 清理旧的定时器
                        if (timer.interval) {
                            clearInterval(timer.interval);
                        }
                        
                        // 启动新的定时器
                        timer.interval = setInterval(() => {
                            if (timer.displayElement && timer.startTime) {
                                const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
                                timer.displayElement.textContent = formatTime(elapsed);
                            }
                        }, 1000);
                        
                        // 更新 UI
                        if (timer.displayElement) timer.displayElement.classList.remove('paused');
                        if (timer.btnElement) timer.btnElement.style.display = 'none';
                        if (timer.displayElement) timer.displayElement.style.display = 'block';
                        if (timer.pauseBtn) timer.pauseBtn.style.display = 'block';
                        if (timer.resumeBtn) timer.resumeBtn.style.display = 'none';
                        updateTimerDisplay();
                    }
                    
                    // 暂停计时
                    function pauseTimer() {
                        if (timer.state !== 'running') return;
                        
                        if (timer.interval) {
                            clearInterval(timer.interval);
                            timer.interval = null;
                        }
                        
                        if (timer.startTime) {
                            timer.elapsedSeconds = Math.floor((Date.now() - timer.startTime) / 1000);
                            timer.startTime = null;
                        }
                        
                        timer.state = 'paused';
                        
                        // 更新 UI
                        if (timer.displayElement) timer.displayElement.classList.add('paused');
                        if (timer.pauseBtn) timer.pauseBtn.style.display = 'none';
                        if (timer.resumeBtn) timer.resumeBtn.style.display = 'block';
                        updateTimerDisplay();
                    }
                    
                    // 继续计时
                    function resumeTimer() {
                        if (timer.state !== 'paused') return;
                        // 移除暂停样式
                        if (timer.displayElement) timer.displayElement.classList.remove('paused');
                        startTimer();
                    }
                    
                    // 重置计时
                    function resetTimer() {
                        if (timer.interval) {
                            clearInterval(timer.interval);
                            timer.interval = null;
                        }
                        
                        timer.state = 'idle';
                        timer.elapsedSeconds = 0;
                        timer.startTime = null;
                        
                        // 更新 UI
                        if (timer.btnElement) timer.btnElement.style.display = 'block';
                        if (timer.displayElement) timer.displayElement.style.display = 'none';
                        if (timer.menuElement) timer.menuElement.style.display = 'none';
                    }
                    
                    // 恢复计时器状态（如果之前正在运行或暂停）
                    if (timer.state === 'running') {
                        // 如果之前正在运行，继续运行
                        if (timer.displayElement) timer.displayElement.classList.remove('paused');
                        if (timer.btnElement) timer.btnElement.style.display = 'none';
                        if (timer.displayElement) timer.displayElement.style.display = 'block';
                        if (timer.pauseBtn) timer.pauseBtn.style.display = 'block';
                        if (timer.resumeBtn) timer.resumeBtn.style.display = 'none';
                        updateTimerDisplay();
                        startTimer(); // 重新启动定时器
                    } else if (timer.state === 'paused') {
                        // 如果之前是暂停状态，显示暂停的 UI
                        if (timer.displayElement) timer.displayElement.classList.add('paused');
                        if (timer.btnElement) timer.btnElement.style.display = 'none';
                        if (timer.displayElement) timer.displayElement.style.display = 'block';
                        if (timer.pauseBtn) timer.pauseBtn.style.display = 'none';
                        if (timer.resumeBtn) timer.resumeBtn.style.display = 'block';
                        updateTimerDisplay();
                    } else {
                        // idle 状态
                        if (timer.displayElement) timer.displayElement.classList.remove('paused');
                        if (timer.btnElement) timer.btnElement.style.display = 'block';
                        if (timer.displayElement) timer.displayElement.style.display = 'none';
                    }
                    
                    // 绑定事件
                    timerBtn.onclick = (e) => {
                        e.stopPropagation();
                        startTimer();
                    };
                    
                    pauseBtn.onclick = (e) => {
                        e.stopPropagation();
                        pauseTimer();
                    };
                    
                    resumeBtn.onclick = (e) => {
                        e.stopPropagation();
                        resumeTimer();
                    };
                    
                    restartBtn.onclick = (e) => {
                        e.stopPropagation();
                        resetTimer();
                    };
                    
                    // 悬停菜单
                    let hideMenuTimeout = null;
                    
                    function showMenu() {
                        if (hideMenuTimeout) {
                            clearTimeout(hideMenuTimeout);
                            hideMenuTimeout = null;
                        }
                        if (timer.state === 'running' || timer.state === 'paused') {
                            if (timer.menuElement) timer.menuElement.style.display = 'flex';
                        }
                    }
                    
                    function hideMenu() {
                        hideMenuTimeout = setTimeout(() => {
                            if (timer.menuElement) timer.menuElement.style.display = 'none';
                        }, 200);
                    }
                    
                    // 双击编辑时间
                    timerDisplay.addEventListener('dblclick', (e) => {
                        e.stopPropagation();
                        editTimer();
                    });
                    
                    timerDisplay.addEventListener('mouseenter', (e) => {
                        e.stopPropagation();
                        showMenu();
                    });
                    
                    timerDisplay.addEventListener('mouseleave', (e) => {
                        e.stopPropagation();
                        hideMenu();
                    });
                    
                    timerMenu.addEventListener('mouseenter', (e) => {
                        e.stopPropagation();
                        showMenu();
                    });
                    
                    timerMenu.addEventListener('mouseleave', (e) => {
                        e.stopPropagation();
                        hideMenu();
                    });
                    
                    timerContainer.appendChild(timerBtn);
                    timerContainer.appendChild(timerDisplay);
                    timerContainer.appendChild(timerMenu);
                    
                    // 布局顺序：计时按钮（红框位置）-> "预期完成时间"按钮 -> 预估时间显示（绿色框）
                    estimateContainer.appendChild(timerContainer); // 计时按钮在红框位置
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
        
        // 延迟更新连续天数和今日完成状态，确保 Tasks.init() 已完成
        setTimeout(() => {
            updateStreakDays();
            maybeCelebrateTodayCompletion();
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

