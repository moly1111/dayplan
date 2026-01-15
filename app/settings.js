// 设置模块
const Settings = {
    // 初始化
    init() {
        this.loadSettings();
        this.bindEvents();
        this.checkWarningBar();
        this.checkDonateQR();
    },

    // 加载设置
    loadSettings() {
        const settings = Storage.getSettings();
        
        // 应用主题
        if (settings.theme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
        
        // 更新设置面板
        const showWarningCheckbox = document.getElementById('show-warning-checkbox');
        const killAnimationCheckbox = document.getElementById('kill-animation-checkbox');
        const killSoundCheckbox = document.getElementById('kill-sound-checkbox');
        const todayCheerSoundCheckbox = document.getElementById('today-cheer-sound-checkbox');
        const todayConfettiCheckbox = document.getElementById('today-confetti-checkbox');
        const themeLight = document.getElementById('theme-light');
        const themeDark = document.getElementById('theme-dark');
        const deepseekApiKeyInput = document.getElementById('deepseek-api-key-input');
        
        if (showWarningCheckbox) {
            showWarningCheckbox.checked = settings.showWarning;
        }
        if (killAnimationCheckbox) {
            killAnimationCheckbox.checked = settings.killAnimation;
        }
        if (killSoundCheckbox) {
            killSoundCheckbox.checked = settings.killSound;
        }
        if (todayCheerSoundCheckbox) {
            todayCheerSoundCheckbox.checked = !!settings.todayCheerSound;
        }
        if (todayConfettiCheckbox) {
            todayConfettiCheckbox.checked = !!settings.todayConfetti;
        }
        if (themeLight) {
            themeLight.checked = settings.theme === 'light';
        }
        if (themeDark) {
            themeDark.checked = settings.theme === 'dark';
        }
        if (deepseekApiKeyInput) {
            deepseekApiKeyInput.value = settings.deepseekApiKey || '';
        }
    },

    // 绑定事件
    bindEvents() {
        // 设置按钮
        const settingsBtn = document.getElementById('settings-btn');
        const settingsPanel = document.getElementById('settings-panel');
        
        if (settingsBtn && settingsPanel) {
            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                settingsPanel.classList.toggle('hidden');
            });
            
            // 点击外部关闭设置面板
            document.addEventListener('click', (e) => {
                if (!settingsPanel.contains(e.target) && 
                    !settingsBtn.contains(e.target)) {
                    settingsPanel.classList.add('hidden');
                }
            });
        }
        
        // 顶部提醒开关
        const showWarningCheckbox = document.getElementById('show-warning-checkbox');
        if (showWarningCheckbox) {
            showWarningCheckbox.addEventListener('change', (e) => {
                Storage.saveSettings({ showWarning: e.target.checked });
                this.checkWarningBar();
            });
        }
        
        // 动画开关
        const killAnimationCheckbox = document.getElementById('kill-animation-checkbox');
        if (killAnimationCheckbox) {
            killAnimationCheckbox.addEventListener('change', (e) => {
                Storage.saveSettings({ killAnimation: e.target.checked });
            });
        }
        
        // 音效开关
        const killSoundCheckbox = document.getElementById('kill-sound-checkbox');
        if (killSoundCheckbox) {
            killSoundCheckbox.addEventListener('change', (e) => {
                Storage.saveSettings({ killSound: e.target.checked });
            });
        }

        // 今日全部完成欢呼
        const todayCheerSoundCheckbox = document.getElementById('today-cheer-sound-checkbox');
        if (todayCheerSoundCheckbox) {
            todayCheerSoundCheckbox.addEventListener('change', (e) => {
                Storage.saveSettings({ todayCheerSound: e.target.checked });
            });
        }

        // 今日全部完成彩带
        const todayConfettiCheckbox = document.getElementById('today-confetti-checkbox');
        if (todayConfettiCheckbox) {
            todayConfettiCheckbox.addEventListener('change', (e) => {
                Storage.saveSettings({ todayConfetti: e.target.checked });
            });
        }
        
        // 主题切换
        const themeLight = document.getElementById('theme-light');
        const themeDark = document.getElementById('theme-dark');
        const deepseekApiKeyInput = document.getElementById('deepseek-api-key-input');
        
        if (themeLight) {
            themeLight.addEventListener('change', (e) => {
                if (e.target.checked) {
                    Storage.saveSettings({ theme: 'light' });
                    document.body.classList.remove('dark');
                }
            });
        }
        
        if (themeDark) {
            themeDark.addEventListener('change', (e) => {
                if (e.target.checked) {
                    Storage.saveSettings({ theme: 'dark' });
                    document.body.classList.add('dark');
                }
            });
        }

        // DeepSeek API Key 输入
        if (deepseekApiKeyInput) {
            let saveTimer = null;
            const saveApiKey = () => {
                const value = deepseekApiKeyInput.value.trim();
                Storage.saveSettings({ deepseekApiKey: value });
            };

            deepseekApiKeyInput.addEventListener('input', () => {
                if (saveTimer) clearTimeout(saveTimer);
                saveTimer = setTimeout(saveApiKey, 400);
            });

            deepseekApiKeyInput.addEventListener('blur', saveApiKey);
        }
        
        // 导出按钮
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                Storage.exportData();
            });
        }
        
        // 导入按钮
        const importBtn = document.getElementById('import-btn');
        const importInput = document.getElementById('import-input');
        
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
                        if (Storage.importData(jsonString)) {
                            // 重新加载所有数据
                            this.loadSettings();
                            this.checkWarningBar();
                            if (window.Tasks) {
                                Tasks.loadTasks(Tasks.currentDateStr);
                            }
                            if (window.Calendar) {
                                Calendar.update();
                            }
                            alert('导入成功！');
                        }
                    };
                    reader.readAsText(file);
                }
                // 清空 input，以便可以重复选择同一文件
                importInput.value = '';
            });
        }
        
        // 关闭警告条
        const closeWarning = document.getElementById('close-warning');
        const dismissWarning = document.getElementById('dismiss-warning');
        const warningBar = document.getElementById('warning-bar');
        
        if (closeWarning && warningBar) {
            closeWarning.addEventListener('click', () => {
                // 本次关闭，使用 sessionStorage 记录
                sessionStorage.setItem('warningClosedThisSession', 'true');
                warningBar.classList.add('hidden');
            });
        }
        
        if (dismissWarning && warningBar) {
            dismissWarning.addEventListener('click', () => {
                // 永久关闭
                Storage.saveSettings({ showWarning: false });
                warningBar.classList.add('hidden');
            });
        }
    },

    // 检查是否显示警告条
    checkWarningBar() {
        const settings = Storage.getSettings();
        const warningBar = document.getElementById('warning-bar');
        
        if (warningBar) {
            if (settings.showWarning) {
                // 检查本次会话是否已关闭
                const closedThisSession = sessionStorage.getItem('warningClosedThisSession');
                if (!closedThisSession) {
                    warningBar.classList.remove('hidden');
                } else {
                    warningBar.classList.add('hidden');
                }
            } else {
                warningBar.classList.add('hidden');
            }
        }
    },

    // 检查赞赏二维码是否存在并显示
    checkDonateQR() {
        const donateImg = document.getElementById('donate-qr');
        if (!donateImg) return;
        
        const donateContent = donateImg.parentElement;
        const donateText = donateContent?.querySelector('p');
        
        const img = new Image();
        img.onload = () => {
            // 图片存在，显示图片和文字
            donateImg.style.display = 'block';
            if (donateText) {
                donateText.style.display = 'block';
            }
            // 绑定点击放大事件
            this.bindDonateQRClick();
        };
        img.onerror = () => {
            // 图片不存在，保持隐藏
            donateImg.style.display = 'none';
            if (donateText) {
                donateText.style.display = 'none';
            }
        };
        // 尝试加载图片
        img.src = donateImg.src;
    },

    // 绑定赞赏码点击放大事件
    bindDonateQRClick() {
        const donateImg = document.getElementById('donate-qr');
        const donateModal = document.getElementById('donate-modal');
        const donateQRLarge = document.getElementById('donate-qr-large');
        const modalClose = document.querySelector('.donate-modal-close');
        const modalOverlay = document.querySelector('.donate-modal-overlay');
        
        if (!donateImg || !donateModal || !donateQRLarge) return;
        
        // 点击小图显示大图
        donateImg.addEventListener('click', () => {
            donateQRLarge.src = donateImg.src;
            donateModal.classList.remove('hidden');
            // 阻止body滚动
            document.body.style.overflow = 'hidden';
        });
        
        // 关闭模态框
        const closeModal = () => {
            donateModal.classList.add('hidden');
            document.body.style.overflow = '';
        };
        
        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }
        
        if (modalOverlay) {
            modalOverlay.addEventListener('click', closeModal);
        }
        
        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !donateModal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }
};

// 页面加载完成后初始化设置
document.addEventListener('DOMContentLoaded', () => {
    Settings.init();
});

