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
        
        // 渲染 Focus 任务
        this.renderFocusTask(tasks.focus);
        
        // 渲染待办任务
        this.renderPendingTasks(tasks.pending);
        
        // 渲染已完成任务
        this.renderCompletedTasks(tasks.completed);
        
        // 更新日期标题
        this.updateDateTitle();
        
        // 更新日历标记
        Calendar.update();
    },

    // 渲染 Focus 任务
    renderFocusTask(focusTask) {
        const container = document.getElementById('focus-task');
        if (!container) return;
        
        container.innerHTML = '';
        
        const focusDetails = document.getElementById('focus-details');
        
        // 获取该日期的 Focus 状态
        const focusState = Storage.getFocusState(this.currentDateStr);
        
        if (focusTask) {
            const taskEl = this.createTaskElement(focusTask, false);
            taskEl.draggable = false;
            taskEl.dataset.inFocus = 'true';
            this.bindDragEvents(taskEl, container);
            container.appendChild(taskEl);
            
            // 有任务时，移除完成标记并展开，清除保存的完成状态
            if (focusDetails) {
                focusDetails.classList.remove('focus-completed');
                focusDetails.setAttribute('open', '');
                // 清除完成状态（有新任务进入）
                if (focusState.completed) {
                    Storage.setFocusState(this.currentDateStr, false, false);
                }
            }
        } else {
            // Focus 为空时
            if (focusDetails) {
                // 恢复完成状态和折叠状态
                if (focusState.completed) {
                    focusDetails.classList.add('focus-completed');
                } else {
                    focusDetails.classList.remove('focus-completed');
                }
                if (focusState.collapsed) {
                    focusDetails.removeAttribute('open');
                } else {
                    focusDetails.setAttribute('open', '');
                }
            }
            
            // Focus 为空时，添加提示并支持双击创建
            const hint = document.createElement('div');
            hint.className = 'focus-empty-hint';
            hint.textContent = (typeof I18n !== 'undefined') ? I18n.t('focus.dragHint') : '长按拖动任务到此处';
            container.appendChild(hint);
            
            container.ondblclick = () => {
                this.createFocusTask();
            };
        }
        
        // 绑定折叠状态变化事件（只绑定一次）
        if (focusDetails && !focusDetails.dataset.boundToggle) {
            focusDetails.dataset.boundToggle = 'true';
            focusDetails.addEventListener('toggle', () => {
                const isOpen = focusDetails.hasAttribute('open');
                Storage.setFocusState(Tasks.currentDateStr, !isOpen, undefined);
            });
        }
    },
    
    // 直接创建 Focus 任务
    createFocusTask() {
        const promptText = (typeof I18n !== 'undefined') ? I18n.t('focus.inputPrompt') : '输入 Focus 任务：';
        const text = prompt(promptText);
        if (!text || !text.trim()) return;
        
        // 创建新任务并直接放入 Focus
        const tasks = Storage.getTasksByDate(this.currentDateStr);
        const newId = Storage.getNextTaskId(this.currentDateStr);
        tasks.focus = { id: newId, text: text.trim() };
        Storage.saveTasksByDate(this.currentDateStr, tasks);
        
        this.loadTasks(this.currentDateStr);
    },

    // 渲染待办任务
    renderPendingTasks(pendingTasks) {
        const container = document.getElementById('pending-tasks');
        if (!container) return;
        
        container.innerHTML = '';
        
        pendingTasks.forEach(task => {
            const taskEl = this.createTaskElement(task, false);
            taskEl.draggable = false;
            this.bindDragEvents(taskEl, container);
            container.appendChild(taskEl);
        });
    },

    // 长按拖拽相关
    dragState: {
        initialized: false,
        dragging: false,
        dragEl: null,
        placeholder: null,
        sourceContainer: null, // 原始容器
        targetContainer: null, // 当前目标容器
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
        longPressTimer: null,
        fromFocus: false, // 是否从 Focus 区域拖出
        moveToTomorrow: false, // 是否触发移到明天
        // Focus 空态提示：拖拽时临时隐藏，避免蓝色占位符出现在提示下方
        focusHintEl: null,
        focusHintPrevDisplay: '',
        focusHintHidden: false,
        moveToYesterday: false // 是否触发移到昨天
    },

    initDragListeners() {
        if (this.dragState.initialized) return;
        this.dragState.initialized = true;

        const state = this.dragState;

        document.addEventListener('mousemove', (e) => {
            if (!state.dragging) return;
            e.preventDefault();
            this.moveDrag(e.clientY, e.clientX);
        });

        document.addEventListener('touchmove', (e) => {
            if (!state.dragging) return;
            e.preventDefault();
            const touch = e.touches[0];
            this.moveDrag(touch.clientY, touch.clientX);
        }, { passive: false });

        document.addEventListener('mouseup', () => {
            clearTimeout(state.longPressTimer);
            if (state.dragging) this.endDrag();
        });

        document.addEventListener('touchend', () => {
            clearTimeout(state.longPressTimer);
            if (state.dragging) this.endDrag();
        });
    },

    bindDragEvents(taskEl, container) {
        this.initDragListeners();

        const state = this.dragState;
        const longPressDuration = 300;

        const onPointerDown = (e) => {
            if (e.target.closest('.task-checkbox, .task-delete, .task-estimate-btn, .task-timer-container, input, button')) return;
            state.sourceContainer = container;
            state.startX = e.clientX || (e.touches && e.touches[0].clientX);
            state.startY = e.clientY || (e.touches && e.touches[0].clientY);
            state.longPressTimer = setTimeout(() => {
                this.startDrag(taskEl, container, state.startX, state.startY);
            }, longPressDuration);
        };

        taskEl.addEventListener('mousedown', onPointerDown);
        taskEl.addEventListener('touchstart', onPointerDown, { passive: true });
        taskEl.addEventListener('mouseleave', () => {
            if (!state.dragging) clearTimeout(state.longPressTimer);
        });
        taskEl.addEventListener('touchcancel', () => {
            clearTimeout(state.longPressTimer);
            if (state.dragging) this.endDrag();
        });
    },

    startDrag(taskEl, container, startX, startY) {
        const state = this.dragState;
        state.dragging = true;
        state.dragEl = taskEl;
        state.sourceContainer = container;
        state.targetContainer = container;
        state.fromFocus = taskEl.dataset.inFocus === 'true';
        state.moveToTomorrow = false;
        state.startX = startX;

        const rect = taskEl.getBoundingClientRect();
        state.offsetX = startX - rect.left;
        state.offsetY = startY - rect.top;

        state.placeholder = document.createElement('div');
        state.placeholder.className = 'task-item task-placeholder';
        state.placeholder.style.height = rect.height + 'px';

        container.classList.add('dragging-active');
        document.body.classList.add('dragging-active');
        taskEl.classList.add('dragging');
        taskEl.style.position = 'fixed';
        taskEl.style.left = rect.left + 'px';
        taskEl.style.top = rect.top + 'px';
        taskEl.style.width = rect.width + 'px';
        taskEl.style.zIndex = '9999';

        container.insertBefore(state.placeholder, taskEl);
        document.body.appendChild(taskEl);
    },

    moveDrag(y, x) {
        const state = this.dragState;
        if (!state.dragging || !state.dragEl) return;

        state.dragEl.style.top = (y - state.offsetY) + 'px';
        state.dragEl.style.left = (x - state.offsetX) + 'px';
        
        // 检测左右拖拽 - 移到昨天/明天
        const dragThreshold = 200;
        const deltaX = x - state.startX;
        
        // 重置状态
        state.moveToTomorrow = false;
        state.moveToYesterday = false;
        state.dragEl.classList.remove('drag-to-tomorrow', 'drag-to-yesterday');
        
        if (deltaX > dragThreshold) {
            // 右拖 - 移到明天
            state.moveToTomorrow = true;
            state.dragEl.classList.add('drag-to-tomorrow');
            state.dragEl.dataset.dragHint = (typeof I18n !== 'undefined') ? I18n.t('drag.tomorrow') : '→ 明天';
        } else if (deltaX < -dragThreshold) {
            // 左拖 - 移到昨天
            state.moveToYesterday = true;
            state.dragEl.classList.add('drag-to-yesterday');
            state.dragEl.dataset.dragHint = (typeof I18n !== 'undefined') ? I18n.t('drag.yesterday') : '← 昨天';
        }

        // 检测当前悬停在哪个区域
        const focusContainer = document.getElementById('focus-task');
        const pendingContainer = document.getElementById('pending-tasks');
        const focusSection = document.querySelector('.focus-section');
        
        // 检查 Focus 是否已满（已有任务且不是从 Focus 拖出的）
        const tasks = Storage.getTasksByDate(this.currentDateStr);
        const focusIsFull = tasks.focus && !state.fromFocus;
        
        // 检查 Focus 是否折叠
        const focusDetails = document.getElementById('focus-details');
        const focusIsClosed = focusDetails && !focusDetails.hasAttribute('open');
        
        let newTarget = null;
        
        if (focusSection && !focusIsFull && !focusIsClosed) {
            const focusRect = focusSection.getBoundingClientRect();
            if (y >= focusRect.top && y <= focusRect.bottom) {
                newTarget = focusContainer;
            }
        }
        if (!newTarget && pendingContainer) {
            newTarget = pendingContainer;
        }

        // 切换目标容器
        if (newTarget && newTarget !== state.targetContainer) {
            // 移除旧容器的 placeholder
            if (state.placeholder.parentNode) {
                state.placeholder.remove();
            }
            
            // 离开 Focus 区域时，恢复空提示（如果之前为拖拽隐藏过）
            if (state.targetContainer === focusContainer && state.focusHintHidden && state.focusHintEl) {
                state.focusHintEl.style.display = state.focusHintPrevDisplay || '';
                state.focusHintHidden = false;
                state.focusHintEl = null;
                state.focusHintPrevDisplay = '';
            }
            state.targetContainer.classList.remove('dragging-active');
            
            // Focus 区域视觉反馈
            if (state.targetContainer === focusContainer) {
                focusContainer.classList.remove('drag-over');
            }

            state.targetContainer = newTarget;
            newTarget.classList.add('dragging-active');
            
            if (newTarget === focusContainer) {
                focusContainer.classList.add('drag-over');
            }
        }

        const container = state.targetContainer;
        if (!container) return;

        // Focus 区域特殊处理：只显示 placeholder，不做位置排序
        if (container === focusContainer) {
            // Focus 为空时：临时隐藏灰色提示，让蓝色占位符出现在提示框的位置
            const hintEl = tasks.focus ? null : focusContainer.querySelector('.focus-empty-hint');
            if (hintEl && !state.focusHintHidden) {
                state.focusHintEl = hintEl;
                state.focusHintPrevDisplay = hintEl.style.display;
                state.focusHintHidden = true;
                hintEl.style.display = 'none';
            }
            if (!state.placeholder.parentNode || state.placeholder.parentNode !== focusContainer) {
                focusContainer.appendChild(state.placeholder);
            }
            return;
        }

        // pending 区域：常规排序逻辑
        const items = Array.from(container.querySelectorAll('.task-item:not(.dragging):not(.task-placeholder)'));
        let insertBefore = null;
        for (const item of items) {
            const rect = item.getBoundingClientRect();
            if (y < rect.top + rect.height / 2) {
                insertBefore = item;
                break;
            }
        }

        const needMove = (insertBefore && insertBefore !== state.placeholder.nextSibling) ||
                         (!insertBefore && state.placeholder.nextSibling && !state.placeholder.nextSibling.classList.contains('dragging'));

        if (needMove || !state.placeholder.parentNode) {
            // FLIP 动画：记录移动前的位置
            const rects = new Map();
            items.forEach(item => {
                rects.set(item, item.getBoundingClientRect());
            });

            // 执行 DOM 移动
            if (insertBefore) {
                container.insertBefore(state.placeholder, insertBefore);
            } else {
                container.appendChild(state.placeholder);
            }

            // FLIP：计算差值并应用反向 transform，然后动画到新位置
            items.forEach(item => {
                const oldRect = rects.get(item);
                const newRect = item.getBoundingClientRect();
                const deltaY = oldRect.top - newRect.top;

                if (Math.abs(deltaY) > 1) {
                    item.style.transition = 'none';
                    item.style.transform = `translateY(${deltaY}px)`;

                    requestAnimationFrame(() => {
                        item.style.transition = 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)';
                        item.style.transform = '';
                    });
                }
            });
        }
    },

    endDrag() {
        const state = this.dragState;
        if (!state.dragging || !state.dragEl) return;

        const focusContainer = document.getElementById('focus-task');
        const pendingContainer = document.getElementById('pending-tasks');
        const taskId = parseInt(state.dragEl.dataset.taskId, 10);
        const targetContainer = state.targetContainer;
        const sourceContainer = state.sourceContainer;

        // 移除拖拽样式
        state.dragEl.classList.remove('dragging', 'drag-to-tomorrow', 'drag-to-yesterday');
        state.dragEl.style.position = '';
        state.dragEl.style.left = '';
        state.dragEl.style.top = '';
        state.dragEl.style.width = '';
        state.dragEl.style.zIndex = '';

        // 检查是否触发"移到明天/昨天"
        if (state.moveToTomorrow || state.moveToYesterday) {
            state.dragEl.remove();
            state.placeholder.remove();
            const direction = state.moveToTomorrow ? 1 : -1;
            this.moveTaskToAnotherDay(taskId, state.fromFocus, direction);
            this.cleanupDragState(focusContainer, pendingContainer);
            return;
        }

        // 判断跨区域拖拽
        const droppingToFocus = targetContainer === focusContainer;
        const droppingFromFocus = state.fromFocus;

        if (droppingToFocus && !droppingFromFocus) {
            // 从 pending 拖到 Focus
            const tasks = Storage.getTasksByDate(this.currentDateStr);
            if (tasks.focus) {
                // Focus 已满，拒绝拖入，恢复原位
                sourceContainer.insertBefore(state.dragEl, state.placeholder);
                state.placeholder.remove();
            } else {
                // 移入 Focus - 先移除旧元素再重新渲染
                state.dragEl.remove();
                state.placeholder.remove();
                Storage.moveToFocus(this.currentDateStr, taskId);
                this.loadTasks(this.currentDateStr);
            }
        } else if (!droppingToFocus && droppingFromFocus) {
            // 从 Focus 拖回 pending
            const pendingItems = Array.from(pendingContainer.querySelectorAll('.task-item:not(.dragging):not(.task-placeholder)'));
            let insertIndex = pendingItems.length;
            const placeholderIndex = Array.from(pendingContainer.children).indexOf(state.placeholder);
            if (placeholderIndex >= 0) {
                insertIndex = placeholderIndex;
            }
            // 先移除旧元素再重新渲染
            state.dragEl.remove();
            state.placeholder.remove();
            Storage.moveFromFocus(this.currentDateStr, insertIndex);
            this.loadTasks(this.currentDateStr);
        } else {
            // 同区域内排序
            targetContainer.insertBefore(state.dragEl, state.placeholder);
            state.placeholder.remove();

            if (targetContainer === pendingContainer) {
                const newOrder = Array.from(pendingContainer.querySelectorAll('.task-item'))
                    .map(el => parseInt(el.dataset.taskId, 10));
                Storage.reorderTasks(this.currentDateStr, newOrder);
            }
        }

        // 清理样式
        sourceContainer.classList.remove('dragging-active');
        targetContainer.classList.remove('dragging-active');
        document.body.classList.remove('dragging-active');
        if (focusContainer) {
            focusContainer.classList.remove('drag-over');
        }

        // 清理所有任务的 transform 样式
        [focusContainer, pendingContainer].forEach(container => {
            if (container) {
                container.querySelectorAll('.task-item').forEach(item => {
                    item.style.transition = '';
                    item.style.transform = '';
                });
            }
        });

        state.dragging = false;
        state.dragEl = null;
        state.placeholder = null;
        state.sourceContainer = null;
        state.targetContainer = null;
        state.fromFocus = false;
        state.moveToTomorrow = false;
        state.moveToYesterday = false;
    },

    // 清理拖拽状态
    cleanupDragState(focusContainer, pendingContainer) {
        const state = this.dragState;
        
        if (state.sourceContainer) state.sourceContainer.classList.remove('dragging-active');
        if (state.targetContainer) state.targetContainer.classList.remove('dragging-active');
        document.body.classList.remove('dragging-active');
        if (focusContainer) focusContainer.classList.remove('drag-over');

        [focusContainer, pendingContainer].forEach(container => {
            if (container) {
                container.querySelectorAll('.task-item').forEach(item => {
                    item.style.transition = '';
                    item.style.transform = '';
                });
            }
        });

        state.dragging = false;
        state.dragEl = null;
        state.placeholder = null;
        state.sourceContainer = null;
        state.targetContainer = null;
        state.fromFocus = false;
        state.moveToTomorrow = false;
        state.moveToYesterday = false;
    },

    // 移动任务到另一天（direction: 1=明天, -1=昨天）
    moveTaskToAnotherDay(taskId, fromFocus, direction) {
        const currentDate = new Date(this.currentDateStr);
        const targetDate = new Date(currentDate);
        targetDate.setDate(targetDate.getDate() + direction);
        const targetDateStr = Calendar.formatDate(targetDate);

        // 获取当前任务数据
        const currentTasks = Storage.getTasksByDate(this.currentDateStr);
        let task = null;

        if (fromFocus && currentTasks.focus && currentTasks.focus.id === taskId) {
            task = { ...currentTasks.focus };
            currentTasks.focus = null;
            // Focus 任务被移走，清除完成状态
            currentTasks.focusCompleted = false;
            currentTasks.focusCollapsed = false;
        } else {
            const index = currentTasks.pending.findIndex(t => t.id === taskId);
            if (index !== -1) {
                task = { ...currentTasks.pending[index] };
                currentTasks.pending.splice(index, 1);
            }
        }

        if (!task) return;

        // 移除 wasFocus 标记（移到其他天后变为普通任务）
        delete task.wasFocus;
        
        // 清理计时器（如果存在）
        if (typeof TimerManager !== 'undefined' && TimerManager.removeTimer) {
            TimerManager.removeTimer(taskId);
        }

        // 保存当前日期任务
        Storage.saveTasksByDate(this.currentDateStr, currentTasks);

        // 在目标日期添加任务
        const targetTasks = Storage.getTasksByDate(targetDateStr);
        const newId = Storage.getNextTaskId(targetDateStr);
        task.id = newId;
        targetTasks.pending.push(task);
        Storage.saveTasksByDate(targetDateStr, targetTasks);

        // 重新加载当前日期任务
        this.loadTasks(this.currentDateStr);
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
        // 如果是曾经的 Focus 任务（已完成），前面加 ⭐
        if (isCompleted && task.wasFocus) {
            text.textContent = '⭐ ' + task.text;
        } else {
            text.textContent = task.text;
        }
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
        // 检查是否是 Focus 任务
        const tasks = Storage.getTasksByDate(this.currentDateStr);
        const fromFocus = tasks.focus && tasks.focus.id === taskId;
        
        Storage.deleteTask(this.currentDateStr, taskId, fromCompleted, fromFocus);
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
            titleEl.textContent = (typeof I18n !== 'undefined') ? I18n.t('today') : 'Today';
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

// 音效预加载与预热，减少首次播放延迟
(function initSoundPreload() {
    let killSoundWarmedUp = false;
    
    function warmUpKillSound() {
        if (killSoundWarmedUp) return;
        const sound = document.getElementById('kill-sound');
        if (!sound) return;
        
        // 检查音频是否已加载完成
        if (sound.readyState < 2) {  // HAVE_CURRENT_DATA (2) 或更高才能播放
            // 等待音频加载完成再预热
            sound.addEventListener('canplay', () => {
                if (!killSoundWarmedUp) {
                    doWarmUp(sound);
                }
            }, { once: true });
        } else {
            doWarmUp(sound);
        }
    }
    
    function doWarmUp(sound) {
        try {
            const vol = sound.volume;
            sound.volume = 0;
            sound.play().then(() => {
                sound.pause();
                sound.currentTime = 0;
                sound.volume = vol;
                killSoundWarmedUp = true;
            }).catch(() => { 
                sound.volume = vol; 
            });
        } catch (e) {}
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        const sound = document.getElementById('kill-sound');
        if (sound) sound.load();  // 强制立即加载
        // 任务输入框获焦时预热（多数用户会先添加任务再完成）
        document.getElementById('task-input')?.addEventListener('focus', warmUpKillSound, { once: true });
    });
    
    // 首次点击/按键时预热（如点日历等，早于第一次完成任务）
    document.addEventListener('click', warmUpKillSound, { once: true });
    document.addEventListener('keydown', warmUpKillSound, { once: true });
})();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    Calendar.init();
    Tasks.init();
});

