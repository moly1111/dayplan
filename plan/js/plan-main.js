// Plan 主逻辑模块
const PlanMain = {
    // 初始化
    init() {
        // 初始化各个模块
        if (window.PlanCalendar) {
            PlanCalendar.init();
        }

        if (window.PlanContextMenu) {
            PlanContextMenu.init();
        }

        if (window.PlanDialog) {
            PlanDialog.init();
        }

        if (window.PlanDeleteDialog) {
            PlanDeleteDialog.init();
        }

        if (window.PlanList) {
            PlanList.init();
        }

        // 绑定月份导航按钮
        const prevBtn = document.getElementById('prev-month-btn');
        const nextBtn = document.getElementById('next-month-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (window.PlanCalendar) {
                    PlanCalendar.prevMonth();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (window.PlanCalendar) {
                    PlanCalendar.nextMonth();
                }
            });
        }

        // 初始化设置面板（复用主应用的设置逻辑）
        this.initSettings();

        // 应用主题
        this.applyTheme();
    },

    // 初始化设置面板
    initSettings() {
        const settingsBtn = document.getElementById('settings-btn');
        const settingsPanel = document.getElementById('settings-panel');
        const themeSelect = document.getElementById('theme-select');
        const exportBtn = document.getElementById('export-btn');
        const importBtn = document.getElementById('import-btn');
        const importInput = document.getElementById('import-input');

        // 显示/隐藏设置面板
        if (settingsBtn && settingsPanel) {
            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                settingsPanel.classList.toggle('hidden');
            });

            // 点击外部关闭设置面板
            document.addEventListener('click', (e) => {
                if (settingsPanel && !settingsPanel.contains(e.target) && !settingsBtn.contains(e.target)) {
                    settingsPanel.classList.add('hidden');
                }
            });
        }

        // 主题切换
        if (themeSelect) {
            const settings = PlanStorage.getSettings();
            themeSelect.value = settings.theme || 'light';
            
            themeSelect.addEventListener('change', (e) => {
                const theme = e.target.value;
                PlanStorage.saveSettings({ theme });
                this.applyTheme();
            });
        }

        // 导出数据
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                PlanStorage.exportData();
            });
        }

        // 导入数据
        if (importBtn && importInput) {
            importBtn.addEventListener('click', () => {
                importInput.click();
            });

            importInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const jsonString = event.target.result;
                        if (PlanStorage.importData(jsonString)) {
                            alert('导入成功！');
                            // 刷新页面
                            if (window.PlanCalendar) {
                                PlanCalendar.update();
                            }
                            if (window.PlanList) {
                                PlanList.refresh();
                            }
                        }
                    };
                    reader.readAsText(file);
                }
                // 清空文件输入
                e.target.value = '';
            });
        }
    },

    // 应用主题
    applyTheme() {
        const settings = PlanStorage.getSettings();
        const theme = settings.theme || 'light';
        
        if (theme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }
};

// 计划列表面板模块
const PlanList = {
    panel: null,
    currentDateStr: null,

    // 初始化
    init() {
        this.panel = document.getElementById('plan-list-panel');
        if (!this.panel) return;

        const closeBtn = document.getElementById('plan-list-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // 点击遮罩层关闭（如果有）
        this.panel.addEventListener('click', (e) => {
            if (e.target === this.panel) {
                this.hide();
            }
        });
    },

    // 显示计划列表
    show(dateStr) {
        if (!this.panel) return;

        this.currentDateStr = dateStr;
        
        // 更新日期标题
        const dateTitle = document.getElementById('plan-list-date');
        if (dateTitle) {
            const date = new Date(dateStr);
            dateTitle.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        }

        // 渲染计划列表
        this.render();

        // 显示面板
        this.panel.classList.remove('hidden');
    },

    // 隐藏计划列表
    hide() {
        if (this.panel) {
            this.panel.classList.add('hidden');
        }
        this.currentDateStr = null;
    },

    // 渲染计划列表
    render() {
        const content = document.getElementById('plan-list-content');
        if (!content || !this.currentDateStr) return;

        const plans = PlanStorage.getPlansByDate(this.currentDateStr);
        
        if (plans.length === 0) {
            content.innerHTML = '<div class="plan-list-empty">该日期暂无计划</div>';
            return;
        }

        content.innerHTML = '';

        plans.forEach(plan => {
            const planItem = this.createPlanItem(plan);
            content.appendChild(planItem);
        });
    },

    // 创建计划项元素
    createPlanItem(plan) {
        const item = document.createElement('div');
        item.className = 'plan-list-item';
        if (plan.completedAt) {
            item.classList.add('plan-list-item-completed');
        }

        // 计划内容
        const text = document.createElement('div');
        text.className = 'plan-list-text';
        text.textContent = plan.text;
        item.appendChild(text);

        // 计划类型标签
        const typeLabel = document.createElement('div');
        typeLabel.className = 'plan-list-type';
        if (plan.type === 'ebbinghaus') {
            typeLabel.textContent = '遗忘曲线';
            typeLabel.classList.add('plan-list-type-ebbinghaus');
        } else {
            typeLabel.textContent = '普通';
            typeLabel.classList.add('plan-list-type-normal');
        }
        item.appendChild(typeLabel);

        // 操作按钮组
        const actions = document.createElement('div');
        actions.className = 'plan-list-actions';

        // 完成/取消完成按钮
        const completeBtn = document.createElement('button');
        completeBtn.className = 'plan-list-btn plan-list-complete';
        completeBtn.textContent = plan.completedAt ? '取消完成' : '完成';
        completeBtn.addEventListener('click', () => {
            PlanStorage.completePlan(this.currentDateStr, plan.id);
            this.refresh();
            if (window.PlanCalendar) {
                PlanCalendar.update();
            }
        });
        actions.appendChild(completeBtn);

        // 编辑按钮
        const editBtn = document.createElement('button');
        editBtn.className = 'plan-list-btn plan-list-edit';
        editBtn.textContent = '编辑';
        editBtn.addEventListener('click', () => {
            if (window.PlanDialog) {
                PlanDialog.show(plan.type, this.currentDateStr, plan.id);
            }
        });
        actions.appendChild(editBtn);

        // 删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'plan-list-btn plan-list-delete';
        deleteBtn.textContent = '删除';
        deleteBtn.addEventListener('click', () => {
            if (window.PlanDeleteDialog) {
                PlanDeleteDialog.show(this.currentDateStr, plan.id);
            }
        });
        actions.appendChild(deleteBtn);

        item.appendChild(actions);

        return item;
    },

    // 刷新列表
    refresh() {
        if (this.currentDateStr) {
            this.render();
        }
    }
};

// 全局暴露模块
window.PlanCalendar = PlanCalendar;
window.PlanContextMenu = PlanContextMenu;
window.PlanDialog = PlanDialog;
window.PlanDeleteDialog = PlanDeleteDialog;
window.PlanList = PlanList;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    PlanMain.init();
});

