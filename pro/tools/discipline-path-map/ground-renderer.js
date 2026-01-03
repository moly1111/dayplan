export class GroundRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }
    
    render() {
        const { width, height } = this.canvas;
        
        // 深色底（蓝黑/深灰）
        const gradient = this.ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#0a0a15');
        gradient.addColorStop(0.5, '#0f0f1a');
        gradient.addColorStop(1, '#0a0a15');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
        
        // 添加非常细微的纹理（低对比噪声）
        this.addTexture();
    }
    
    addTexture() {
        const { width, height } = this.canvas;
        const imageData = this.ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // 生成低对比噪声
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 3; // 非常轻微的随机变化
            data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
}

