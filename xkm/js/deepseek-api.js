// DeepSeek API 调用模块（从本地设置中读取 API Key）
const DeepSeekAPI = {
    /**
     * 预估任务完成时间（分钟）
     * @param {string} taskText - 任务文本
     * @returns {Promise<number>} - 预估时间（分钟）
     */
    async estimateTaskTime(taskText) {
        const settings = Storage.getSettings ? Storage.getSettings() : {};
        const apiKey = settings.deepseekApiKey || '';

        if (!apiKey) {
            throw new Error('API Key 未配置，请在设置中填写 DeepSeek API Key');
        }

        const apiUrl = 'https://api.deepseek.com/chat/completions';
        const model = 'deepseek-chat';

        const systemPrompt = `你是一个任务时间估算专家。请根据用户提供的任务描述，估算完成该任务需要的时间（以分钟为单位）。

要求：
1. 只返回数字，不要包含任何文字说明
2. 如果任务描述不明确，请给出合理的估算
3. 返回格式：纯数字（例如：30、60、120）

示例：
- "写一篇1000字的文章" -> 60
- "阅读一本书的前三章" -> 90
- "整理房间" -> 45`;

        const userPrompt = `请估算完成以下任务需要的时间（分钟）：${taskText}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    stream: false
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API 请求失败: ${response.status} ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('API 返回格式异常');
            }

            const content = data.choices[0].message.content.trim();
            
            // 提取数字（支持各种格式：30、30分钟、约30分钟等）
            const match = content.match(/\d+/);
            if (!match) {
                throw new Error('无法从 AI 回复中提取时间');
            }

            const minutes = parseInt(match[0], 10);
            if (isNaN(minutes) || minutes < 0) {
                throw new Error('提取的时间无效');
            }

            return minutes;
        } catch (error) {
            console.error('DeepSeek API 调用失败:', error);
            throw error;
        }
    }
};

