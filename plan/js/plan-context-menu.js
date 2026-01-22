// Plan 右键菜单模块
const PlanContextMenu = {
    menu: null,
    currentDateStr: null,

    // 初始化
    init() {
        this.menu = document.getElementById('plan-context-menu');
        if (!this.menu) return;

        // 绑定菜单项点击事件
        const items = this.menu.querySelectorAll('.plan-context-item');
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = item.getAttribute('data-action');
                this.handleAction(action);
                this.hide();
            });
        });

        // 点击其他地方隐藏菜单
        document.addEventListener('click', () => this.hide());
        document.addEventListener('contextmenu', (e) => {
            // 如果点击的不是日期单元格，隐藏菜单
            if (!e.target.closest('.plan-day')) {
                this.hide();
            }
        });
    },

    // 显示菜单
    show(event, dateStr) {
        if (!this.menu) return;
        
        this.currentDateStr = dateStr;
        
        // 检查该日期是否有计划
        const hasPlans = PlanStorage.hasPlans(dateStr);
        const viewPlansItem = this.menu.querySelector('[data-action="view-plans"]');
        if (viewPlansItem) {
            viewPlansItem.style.display = hasPlans ? 'block' : 'none';
        }

        // 定位菜单
        this.menu.classList.remove('hidden');
        const x = event.clientX;
        const y = event.clientY;
        
        // 确保菜单不超出视口
        const menuRect = this.menu.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let left = x;
        let top = y;
        
        if (x + menuRect.width > windowWidth) {
            left = windowWidth - menuRect.width - 10;
        }
        if (y + menuRect.height > windowHeight) {
            top = windowHeight - menuRect.height - 10;
        }
        
        this.menu.style.left = `${left}px`;
        this.menu.style.top = `${top}px`;
    },

    // 隐藏菜单
    hide() {
        if (this.menu) {
            this.menu.classList.add('hidden');
        }
    },

    // 处理菜单动作
    handleAction(action) {
        if (!this.currentDateStr) return;

        switch (action) {
            case 'add-normal':
                if (window.PlanDialog) {
                    window.PlanDialog.show('normal', this.currentDateStr);
                }
                break;
            case 'add-ebbinghaus':
                if (window.PlanDialog) {
                    window.PlanDialog.show('ebbinghaus', this.currentDateStr);
                }
                break;
            case 'view-plans':
                if (window.PlanList) {
                    window.PlanList.show(this.currentDateStr);
                }
                break;
        }
    }
};

