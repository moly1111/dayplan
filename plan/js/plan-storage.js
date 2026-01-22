// Plan 数据存储管理模块（独立存储）
const PlanStorage = {
    // 获取所有数据
    getAllData() {
        const data = localStorage.getItem('planApp');
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('Failed to parse plan data:', e);
                return this.getDefaultData();
            }
        }
        return this.getDefaultData();
    },

    // 获取默认数据结构
    getDefaultData() {
        return {
            plans: {},  // { "YYYY-MM-DD": [plan1, plan2, ...] }
            settings: {
                theme: 'light'  // 继承主应用设置或独立设置
            }
        };
    },

    // 保存所有数据
    saveAllData(data) {
        try {
            localStorage.setItem('planApp', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save plan data:', e);
            alert('保存数据失败，可能是存储空间不足');
        }
    },

    // 获取指定日期的计划
    getPlansByDate(dateStr) {
        const data = this.getAllData();
        return data.plans[dateStr] || [];
    },

    // 保存指定日期的计划
    savePlansByDate(dateStr, plans) {
        const data = this.getAllData();
        if (plans.length === 0) {
            delete data.plans[dateStr];
        } else {
            data.plans[dateStr] = plans;
        }
        this.saveAllData(data);
    },

    // 添加计划
    addPlan(dateStr, planData) {
        const plans = this.getPlansByDate(dateStr);
        // 如果指定了ID，使用它；否则生成新ID
        const planId = planData.id !== undefined ? planData.id : this.getNextPlanId(dateStr);
        const plan = {
            id: planId,
            text: planData.text,
            type: planData.type,  // "normal" | "ebbinghaus"
            createdAt: planData.createdAt || dateStr,
            completedAt: null,
            ...(planData.type === 'ebbinghaus' && {
                ebbinghausDates: planData.ebbinghausDates || [],
                ebbinghausIndex: planData.ebbinghausIndex || 0,
                ebbinghausRootId: planData.ebbinghausRootId || planId  // 根计划ID，用于关联所有相关日期
            })
        };
        plans.push(plan);
        this.savePlansByDate(dateStr, plans);
        return plan;
    },

    // 添加遗忘曲线计划（自动添加所有相关日期）
    addEbbinghausPlan(startDateStr, text) {
        // 艾宾浩斯遗忘曲线间隔：1, 3, 6, 14, 29 天（相对于起始日期）
        // 例如：1.1添加 -> 1.2, 1.4, 1.7, 1.15, 1.30
        const intervals = [1, 3, 6, 14, 29];
        const rootId = Date.now(); // 使用时间戳作为根ID
        
        // 计算所有日期（包括起始日期）
        const dates = [startDateStr];
        intervals.forEach(interval => {
            const date = new Date(startDateStr);
            date.setDate(date.getDate() + interval);
            dates.push(this.formatDate(date));
        });

        // 在所有日期添加计划（使用递增的ID，但共享rootId）
        dates.forEach((dateStr, index) => {
            // 为每个日期生成唯一的ID（基于rootId和index）
            const planId = rootId + index;
            this.addPlan(dateStr, {
                id: planId,
                text: text,
                type: 'ebbinghaus',
                createdAt: startDateStr,
                ebbinghausDates: dates,
                ebbinghausIndex: index,
                ebbinghausRootId: rootId
            });
        });

        return rootId;
    },

    // 完成计划
    completePlan(dateStr, planId) {
        const plans = this.getPlansByDate(dateStr);
        const plan = plans.find(p => p.id === planId);
        if (plan) {
            plan.completedAt = plan.completedAt ? null : this.formatDate(new Date());
            this.savePlansByDate(dateStr, plans);
            return true;
        }
        return false;
    },

    // 删除计划
    deletePlan(dateStr, planId, scope = 'current') {
        const plans = this.getPlansByDate(dateStr);
        const plan = plans.find(p => p.id === planId);
        
        if (!plan) return false;

        if (plan.type === 'ebbinghaus' && scope === 'all') {
            // 删除所有相关日期的计划
            if (plan.ebbinghausDates) {
                plan.ebbinghausDates.forEach(dateStr => {
                    const datePlans = this.getPlansByDate(dateStr);
                    const filtered = datePlans.filter(p => 
                        !(p.type === 'ebbinghaus' && p.ebbinghausRootId === plan.ebbinghausRootId)
                    );
                    this.savePlansByDate(dateStr, filtered);
                });
            }
        } else {
            // 只删除当前日期的计划
            const filtered = plans.filter(p => p.id !== planId);
            this.savePlansByDate(dateStr, filtered);
        }
        return true;
    },

    // 更新计划文本
    updatePlan(dateStr, planId, newText, scope = 'current') {
        const plans = this.getPlansByDate(dateStr);
        const plan = plans.find(p => p.id === planId);
        
        if (!plan) return false;

        if (plan.type === 'ebbinghaus' && scope === 'all') {
            // 更新所有相关日期的计划
            if (plan.ebbinghausDates) {
                plan.ebbinghausDates.forEach(dateStr => {
                    const datePlans = this.getPlansByDate(dateStr);
                    datePlans.forEach(p => {
                        if (p.type === 'ebbinghaus' && p.ebbinghausRootId === plan.ebbinghausRootId) {
                            p.text = newText;
                        }
                    });
                    this.savePlansByDate(dateStr, datePlans);
                });
            }
        } else {
            // 只更新当前日期的计划
            plan.text = newText;
            this.savePlansByDate(dateStr, plans);
        }
        return true;
    },

    // 获取下一个计划ID
    getNextPlanId(dateStr) {
        const plans = this.getPlansByDate(dateStr);
        if (plans.length === 0) return 1;
        return Math.max(...plans.map(p => p.id)) + 1;
    },

    // 获取所有有计划的日期
    getAllPlanDates() {
        const data = this.getAllData();
        return Object.keys(data.plans || {});
    },

    // 检查日期是否有计划
    hasPlans(dateStr) {
        const plans = this.getPlansByDate(dateStr);
        return plans.length > 0;
    },

    // 检查日期是否有未完成计划
    hasPendingPlans(dateStr) {
        const plans = this.getPlansByDate(dateStr);
        return plans.some(p => !p.completedAt);
    },

    // 格式化日期为 YYYY-MM-DD
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // 导出数据
    exportData() {
        const data = this.getAllData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plan-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // 导入数据
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            // 验证数据结构
            if (!data.plans || !data.settings) {
                throw new Error('Invalid data structure');
            }
            // 数据验证通过，保存
            this.saveAllData(data);
            return true;
        } catch (e) {
            console.error('Failed to import plan data:', e);
            alert('导入失败：数据格式不正确');
            return false;
        }
    },

    // 获取设置
    getSettings() {
        const data = this.getAllData();
        return data.settings || { theme: 'light' };
    },

    // 保存设置
    saveSettings(settings) {
        const data = this.getAllData();
        data.settings = { ...data.settings, ...settings };
        this.saveAllData(data);
    }
};

