// Plan 对话框模块（添加/编辑计划）
const PlanDialog = {
    overlay: null,
    dialog: null,
    currentMode: null,  // 'add' | 'edit'
    currentType: null,  // 'normal' | 'ebbinghaus'
    currentDateStr: null,
    currentPlanId: null,

    // 初始化
    init() {
        this.overlay = document.getElementById('plan-dialog-overlay');
        this.dialog = this.overlay?.querySelector('.plan-dialog');
        
        if (!this.overlay || !this.dialog) return;

        // 绑定事件
        const closeBtn = document.getElementById('plan-dialog-close');
        const cancelBtn = document.getElementById('plan-dialog-cancel');
        const confirmBtn = document.getElementById('plan-dialog-confirm');
        const textInput = document.getElementById('plan-text-input');

        if (closeBtn) closeBtn.addEventListener('click', () => this.hide());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hide());
        if (confirmBtn) confirmBtn.addEventListener('click', () => this.handleConfirm());
        if (textInput) {
            textInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.handleConfirm();
                }
            });
        }

        // 点击遮罩层关闭
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });
    },

    // 显示对话框（添加模式）
    show(type, dateStr, planId = null) {
        if (!this.overlay || !this.dialog) return;

        this.currentType = type;
        this.currentDateStr = dateStr;
        this.currentPlanId = planId;
        this.currentMode = planId ? 'edit' : 'add';

        // 更新标题
        const title = document.getElementById('plan-dialog-title');
        if (title) {
            if (this.currentMode === 'edit') {
                title.textContent = `编辑${type === 'normal' ? '普通' : '遗忘曲线'}计划`;
            } else {
                title.textContent = `添加${type === 'normal' ? '普通' : '遗忘曲线'}计划`;
            }
        }

        // 更新日期显示
        const dateInput = document.getElementById('plan-date-input');
        if (dateInput) {
            const date = new Date(dateStr);
            dateInput.value = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        }

        // 预览区域（仅遗忘曲线）
        const previewField = document.getElementById('plan-preview-field');
        if (previewField) {
            if (type === 'ebbinghaus' && this.currentMode === 'add') {
                previewField.style.display = 'block';
                this.updatePreview(dateStr);
            } else {
                previewField.style.display = 'none';
            }
        }

        // 编辑选项（仅编辑遗忘曲线计划时显示）
        const editOptions = document.getElementById('plan-edit-options');
        if (editOptions) {
            if (this.currentMode === 'edit' && type === 'ebbinghaus') {
                editOptions.style.display = 'block';
            } else {
                editOptions.style.display = 'none';
            }
        }

        // 清空输入框或填充现有内容
        const textInput = document.getElementById('plan-text-input');
        if (textInput) {
            if (this.currentMode === 'edit' && planId) {
                const plans = PlanStorage.getPlansByDate(dateStr);
                const plan = plans.find(p => p.id === planId);
                if (plan) {
                    textInput.value = plan.text;
                }
            } else {
                textInput.value = '';
            }
            textInput.focus();
        }

        // 显示对话框
        this.overlay.classList.remove('hidden');
    },

    // 更新预览（遗忘曲线计划）
    updatePreview(startDateStr) {
        // 艾宾浩斯遗忘曲线间隔：1, 3, 6, 14, 29 天
        const intervals = [1, 3, 6, 14, 29];
        const previewContainer = document.getElementById('plan-preview-dates');
        if (!previewContainer) return;

        previewContainer.innerHTML = '';

        intervals.forEach(interval => {
            const date = new Date(startDateStr);
            date.setDate(date.getDate() + interval);
            const dateStr = PlanStorage.formatDate(date);
            const dateObj = new Date(dateStr);
            
            const dateEl = document.createElement('div');
            dateEl.className = 'plan-preview-date';
            dateEl.textContent = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
            previewContainer.appendChild(dateEl);
        });
    },

    // 处理确认
    handleConfirm() {
        const textInput = document.getElementById('plan-text-input');
        if (!textInput || !textInput.value.trim()) {
            alert('请输入计划内容');
            return;
        }

        const text = textInput.value.trim();

        if (this.currentMode === 'add') {
            // 添加计划
            if (this.currentType === 'normal') {
                PlanStorage.addPlan(this.currentDateStr, {
                    text: text,
                    type: 'normal'
                });
            } else {
                PlanStorage.addEbbinghausPlan(this.currentDateStr, text);
            }
        } else {
            // 编辑计划
            const editScope = document.querySelector('input[name="edit-scope"]:checked')?.value || 'current';
            PlanStorage.updatePlan(this.currentDateStr, this.currentPlanId, text, editScope);
        }

        // 更新日历和列表
        if (window.PlanCalendar) {
            window.PlanCalendar.update();
        }
        if (window.PlanList) {
            window.PlanList.refresh();
        }

        this.hide();
    },

    // 隐藏对话框
    hide() {
        if (this.overlay) {
            this.overlay.classList.add('hidden');
        }
        // 清空状态
        this.currentMode = null;
        this.currentType = null;
        this.currentDateStr = null;
        this.currentPlanId = null;
    }
};

// 删除确认对话框
const PlanDeleteDialog = {
    overlay: null,
    dialog: null,
    currentDateStr: null,
    currentPlanId: null,
    currentPlanType: null,

    // 初始化
    init() {
        this.overlay = document.getElementById('plan-delete-dialog-overlay');
        this.dialog = this.overlay?.querySelector('.plan-delete-dialog');
        
        if (!this.overlay || !this.dialog) return;

        // 绑定事件
        const closeBtn = document.getElementById('plan-delete-dialog-close');
        const cancelBtn = document.getElementById('plan-delete-cancel');
        const confirmBtn = document.getElementById('plan-delete-confirm');

        if (closeBtn) closeBtn.addEventListener('click', () => this.hide());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hide());
        if (confirmBtn) confirmBtn.addEventListener('click', () => this.handleConfirm());

        // 点击遮罩层关闭
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });
    },

    // 显示删除确认对话框
    show(dateStr, planId) {
        if (!this.overlay || !this.dialog) return;

        this.currentDateStr = dateStr;
        this.currentPlanId = planId;

        const plans = PlanStorage.getPlansByDate(dateStr);
        const plan = plans.find(p => p.id === planId);
        if (!plan) return;

        this.currentPlanType = plan.type;

        // 更新消息
        const message = document.getElementById('plan-delete-message');
        if (message) {
            message.textContent = `确定要删除计划"${plan.text}"吗？`;
        }

        // 显示/隐藏删除选项（仅遗忘曲线计划）
        const deleteOptions = document.getElementById('plan-delete-options');
        if (deleteOptions) {
            if (plan.type === 'ebbinghaus') {
                deleteOptions.style.display = 'block';
                // 重置为"仅当前日期"
                const currentRadio = document.querySelector('input[name="delete-scope"][value="current"]');
                if (currentRadio) currentRadio.checked = true;
            } else {
                deleteOptions.style.display = 'none';
            }
        }

        this.overlay.classList.remove('hidden');
    },

    // 处理确认删除
    handleConfirm() {
        const deleteScope = document.querySelector('input[name="delete-scope"]:checked')?.value || 'current';
        PlanStorage.deletePlan(this.currentDateStr, this.currentPlanId, deleteScope);

        // 更新日历和列表
        if (window.PlanCalendar) {
            window.PlanCalendar.update();
        }
        if (window.PlanList) {
            window.PlanList.refresh();
        }

        this.hide();
    },

    // 隐藏对话框
    hide() {
        if (this.overlay) {
            this.overlay.classList.add('hidden');
        }
        this.currentDateStr = null;
        this.currentPlanId = null;
        this.currentPlanType = null;
    }
};

