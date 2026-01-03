export class DarknessRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.alpha = 0.92; // 初始黑暗透明度
    }
    
    render() {
        const { width, height } = this.canvas;
        
        // 填充高 alpha 黑暗
        this.ctx.fillStyle = `rgba(0, 0, 0, ${this.alpha})`;
        this.ctx.fillRect(0, 0, width, height);
    }
    
    // 兼容旧接口：单点擦除（实质上就是一点长为 0 的线段）
    erase(x, y, radius) {
        this.eraseSegment({ x, y }, { x, y }, radius);
    }

    // 按线段擦除一整段黑暗，避免高速度时出现一串圆圈的感觉
    eraseSegment(p0, p1, radius) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
        ctx.lineWidth = radius * 2;

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();

        ctx.restore();
    }
    
    reset() {
        this.render();
    }
}

