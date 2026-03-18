// 多语言支持模块
const I18n = {
    currentLang: 'zh',
    
    texts: {
        zh: {
            // 设置面板
            'settings.title': '设置',
            'settings.data': '数据',
            'settings.backup': '备份',
            'settings.import': '导入',
            'settings.topReminder': '顶部提醒',
            'settings.showWarning': '显示本地存储警告',
            'settings.taskEffects': '完成任务特效',
            'settings.animation': '动画开关',
            'settings.sound': '音效开关',
            'settings.cheerOnComplete': '今日全部完成时播放欢呼',
            'settings.confettiOnComplete': '今日全部完成时飘落彩带',
            'settings.features': '功能',
            'settings.showTimer': '显示计时功能',
            'settings.whiteNoise': '白噪音',
            'settings.rain': '雨声',
            'settings.fire': '篝火',
            'settings.ai': 'AI',
            'settings.apiKey': 'DeepSeek API Key',
            'settings.apiKeyNote': '仅保存在本地浏览器，不会上传到服务器。',
            'settings.appearance': '外观',
            'settings.language': '语言 / Language',
            
            // 目标网址弹窗
            'targetUrl.title': '目标网址',
            'targetUrl.hint': '单击时间跳转，双击时间编辑',
            'targetUrl.ok': '确定',
            
            // 任务相关
            'task.inputPlaceholder': '添加计划，按 Enter 确认',
            'task.totalTimeLabel': '总用时：',
            'task.minutes': '分钟',
            'task.hours': '小时',
            'task.hms': '{hours} 小时 {minutes} 分钟',
            'task.estimateBtn': '预期完成时间',
            'task.estimateBtnTitle': '点击获取 AI 预估完成时间',
            'task.estimating': '预估中...',
            'task.estimateFailed': '预估失败',
            'task.timer': '计时',
            'task.timerTitle': '点击开始计时',
            'task.timerFormatError': '格式错误！请输入 mm:ss 格式（例如：05:30）',
            
            // Focus 区域
            'focus.title': 'Focus',
            'focus.dragHint': '长按拖动任务到此处',
            'focus.inputPrompt': '输入 Focus 任务：',
            
            // 日历
            'calendar.weekdays': ['日', '一', '二', '三', '四', '五', '六'],
            'calendar.monthFormat': '{year}年{month}月',
            
            // 警告条
            'warning.message': '本工具的所有数据仅存储在本地浏览器中，不会同步或上传到云端。清理浏览器数据或更换设备将导致数据永久丢失。建议定期使用右上角「备份」功能保存数据。',
            'warning.close': '关闭',
            'warning.dismiss': '永久关闭',
            
            // 其他
            'completed': '已完成',
            'today': '今天',
            'footer.backup': '数据丢失将无法找回，请定期备份并妥善保存。\nData cannot be recovered if lost. Please back up regularly.',
            
            // 快捷任务
            'quickTasks.title': '常用任务',
            'quickTasks.inputPlaceholder': '输入常用任务内容',
            'quickTasks.add': '添加',
            'quickTasks.tip': '数据仅存本地，可随时编辑',
            'quickTasks.empty': '暂无常用任务，在下方添加',
            'quickTasks.use': '添加',
            'quickTasks.useTitle': '添加到今日任务',
            'quickTasks.delete': '删除',
            'quickTasks.deleteTitle': '删除此任务',
            'quickTasks.deleteConfirm': '确定要删除这个常用任务吗？',
            'quickTasks.inputRequired': '请输入任务内容',
            
            // 拖拽提示
            'drag.tomorrow': '→ 明天',
            'drag.yesterday': '← 昨天',
            
            // 编辑
            'edit.estimatePrompt': '修改预估时间（分钟）：',
            'edit.invalidNumber': '请输入有效的数字（≥0）',
            
            // 按钮提示
            'btn.music': '背景音乐',
            'btn.settings': '设置',
            
            // 页面标题
            'page.title': '计划表 - XKM',
            
            // 导入导出
            'import.success': '导入成功！',
            'import.failed': '导入失败：数据格式不正确',
            
            // 错误提示
            'error.saveFailed': '保存数据失败，可能是存储空间不足'
        },
        en: {
            // Settings panel
            'settings.title': 'Settings',
            'settings.data': 'Data',
            'settings.backup': 'Backup',
            'settings.import': 'Import',
            'settings.topReminder': 'Top Reminder',
            'settings.showWarning': 'Show local storage warning',
            'settings.taskEffects': 'Task Completion Effects',
            'settings.animation': 'Animation',
            'settings.sound': 'Sound',
            'settings.cheerOnComplete': 'Play cheer when all done today',
            'settings.confettiOnComplete': 'Show confetti when all done today',
            'settings.features': 'Features',
            'settings.showTimer': 'Show timer feature',
            'settings.whiteNoise': 'White Noise',
            'settings.rain': 'Rain',
            'settings.fire': 'Fire',
            'settings.ai': 'AI',
            'settings.apiKey': 'DeepSeek API Key',
            'settings.apiKeyNote': 'Stored locally only, never uploaded.',
            
            // Target URL popup
            'targetUrl.title': 'Target URL',
            'targetUrl.hint': 'Click time to jump, double-click to edit',
            'targetUrl.ok': 'OK',
            'settings.appearance': 'Appearance',
            'settings.language': '语言 / Language',
            
            // Tasks
            'task.inputPlaceholder': 'Add task, press Enter',
            'task.totalTimeLabel': 'Total: ',
            'task.minutes': 'min',
            'task.hours': 'hr',
            'task.hms': '{hours} hr {minutes} min',
            'task.estimateBtn': 'Estimate Time',
            'task.estimateBtnTitle': 'Click to get AI estimate',
            'task.estimating': 'Estimating...',
            'task.estimateFailed': 'Failed',
            'task.timer': 'Timer',
            'task.timerTitle': 'Click to start timer',
            'task.timerFormatError': 'Invalid format! Use mm:ss (e.g., 05:30)',
            
            // Focus area
            'focus.title': 'Focus',
            'focus.dragHint': 'Long press to drag task here',
            'focus.inputPrompt': 'Enter Focus task:',
            
            // Calendar
            'calendar.weekdays': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            'calendar.monthFormat': '{month} {year}',
            
            // Warning bar
            'warning.message': 'All data is stored locally in your browser only, not synced to the cloud. Clearing browser data or switching devices will result in permanent data loss. Please use the "Backup" feature regularly.',
            'warning.close': 'Close',
            'warning.dismiss': 'Never show again',
            
            // Other
            'completed': 'Completed',
            'today': 'Today',
            'footer.backup': 'Data cannot be recovered if lost. Please back up regularly.',
            
            // Quick tasks
            'quickTasks.title': 'Quick Tasks',
            'quickTasks.inputPlaceholder': 'Enter task content',
            'quickTasks.add': 'Add',
            'quickTasks.tip': 'Stored locally, editable anytime',
            'quickTasks.empty': 'No quick tasks yet, add below',
            'quickTasks.use': 'Add',
            'quickTasks.useTitle': 'Add to today\'s tasks',
            'quickTasks.delete': 'Delete',
            'quickTasks.deleteTitle': 'Delete this task',
            'quickTasks.deleteConfirm': 'Are you sure you want to delete this quick task?',
            'quickTasks.inputRequired': 'Please enter task content',
            
            // Drag hints
            'drag.tomorrow': '→ Tomorrow',
            'drag.yesterday': '← Yesterday',
            
            // Edit
            'edit.estimatePrompt': 'Edit estimate (minutes):',
            'edit.invalidNumber': 'Please enter a valid number (≥0)',
            
            // Button tooltips
            'btn.music': 'Background Music',
            'btn.settings': 'Settings',
            
            // Page title
            'page.title': 'Planner - XKM',
            
            // Import/Export
            'import.success': 'Import successful!',
            'import.failed': 'Import failed: Invalid data format',
            
            // Error messages
            'error.saveFailed': 'Failed to save data, storage may be full'
        }
    },
    
    // 获取翻译文本
    t(key) {
        const lang = this.currentLang;
        return this.texts[lang][key] || this.texts['zh'][key] || key;
    },
    
    // 设置语言
    setLang(lang) {
        if (this.texts[lang]) {
            this.currentLang = lang;
            this.applyLanguage();
        }
    },
    
    // 应用语言到界面
    applyLanguage() {
        // 更新所有带 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = this.t(key);
            if (text) {
                el.textContent = text;
            }
        });
        
        // 更新 placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const text = this.t(key);
            if (text) {
                el.placeholder = text;
            }
        });
        
        // 更新 title 属性
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const text = this.t(key);
            if (text) {
                el.title = text;
            }
        });
        
        // 更新特定元素
        this.updateSpecificElements();
    },
    
    // 更新特定元素
    updateSpecificElements() {
        // 任务输入框
        const taskInput = document.getElementById('task-input');
        if (taskInput) {
            taskInput.placeholder = this.t('task.inputPlaceholder');
        }
        
        // Focus 标题
        const focusHeader = document.querySelector('.focus-header');
        if (focusHeader) {
            focusHeader.textContent = this.t('focus.title');
        }
        
        // 总用时标签
        const totalTimeLabel = document.querySelector('.total-time-label');
        if (totalTimeLabel) {
            totalTimeLabel.textContent = this.t('task.totalTimeLabel');
        }
        
        // 触发 updateTotalTime 刷新（如果存在的话）
        if (typeof Tasks !== 'undefined' && Tasks.loadTasks) {
            const currentDateStr = Tasks.currentDateStr || (typeof Calendar !== 'undefined' ? Calendar.formatDate(new Date()) : null);
            if (currentDateStr) {
                Tasks.loadTasks(currentDateStr);
            }
        }
        
        // Completed 标题
        const completedSummary = document.querySelector('.completed-section summary');
        if (completedSummary) {
            completedSummary.textContent = this.t('completed');
        }
        
        // Today 标题 (需要检查当前是否显示今天)
        const dateTitle = document.getElementById('date-title');
        if (dateTitle && (dateTitle.textContent === 'Today' || dateTitle.textContent === '今天')) {
            dateTitle.textContent = this.t('today');
        }
        
        // 底部声明
        const footer = document.querySelector('.footer p');
        if (footer) {
            const text = this.t('footer.backup');
            footer.innerHTML = text.replace(/\n/g, '<br>');
        }
        
        // Focus 空提示
        const focusEmptyHint = document.querySelector('.focus-empty-hint');
        if (focusEmptyHint) {
            focusEmptyHint.textContent = this.t('focus.dragHint');
        }
        
        // 快捷任务
        const quickTasksTitle = document.querySelector('.quick-tasks-title');
        if (quickTasksTitle) {
            quickTasksTitle.textContent = this.t('quickTasks.title');
        }
        
        const quickTaskInput = document.getElementById('quick-task-input');
        if (quickTaskInput) {
            quickTaskInput.placeholder = this.t('quickTasks.inputPlaceholder');
        }
        
        const quickTaskAddBtn = document.getElementById('quick-task-add');
        if (quickTaskAddBtn) {
            quickTaskAddBtn.textContent = this.t('quickTasks.add');
        }
        
        const quickTasksTip = document.querySelector('.quick-tasks-tip');
        if (quickTasksTip) {
            quickTasksTip.textContent = this.t('quickTasks.tip');
        }
        
        // 重新渲染日历（如果存在）
        if (typeof Calendar !== 'undefined' && Calendar.render) {
            Calendar.render();
        }
        
        // 页面标题
        document.title = this.t('page.title');
    },
    
    // 初始化
    init() {
        const settings = typeof Storage !== 'undefined' ? Storage.getSettings() : {};
        this.currentLang = settings.language || 'zh';
        this.applyLanguage();
    }
};
