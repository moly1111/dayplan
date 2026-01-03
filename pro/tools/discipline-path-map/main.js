import { PathRenderer } from './path-renderer.js';
import { GroundRenderer } from './ground-renderer.js';
import { DarknessRenderer } from './darkness-renderer.js';
import { InteractionHandler } from './interaction-handler.js';

class DisciplinePathMap {
    constructor() {
        this.groundCanvas = document.getElementById('ground-canvas');
        this.pathCanvas = document.getElementById('path-canvas');
        this.darknessCanvas = document.getElementById('darkness-canvas');
        this.uiCanvas = document.getElementById('ui-canvas');
        
        this.setupCanvases();
        
        this.groundRenderer = new GroundRenderer(this.groundCanvas);
        this.pathRenderer = new PathRenderer(this.pathCanvas);
        this.darknessRenderer = new DarknessRenderer(this.darknessCanvas);
        this.interactionHandler = new InteractionHandler(
            this.groundCanvas,
            this.pathRenderer,
            this.darknessRenderer,
            this.uiCanvas
        );
        
        this.init();
    }
    
    setupCanvases() {
        const resize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            [this.groundCanvas, this.pathCanvas, this.darknessCanvas, this.uiCanvas].forEach(canvas => {
                canvas.width = width;
                canvas.height = height;
            });
        };
        
        resize();
        window.addEventListener('resize', resize);
    }
    
    init() {
        this.groundRenderer.render();
        this.darknessRenderer.render();
        this.drawStartNode();
    }
    
    drawStartNode() {
        const ctx = this.uiCanvas.getContext('2d');
        const centerX = this.uiCanvas.width / 2;
        const centerY = this.uiCanvas.height / 2;
        
        ctx.save();
        ctx.strokeStyle = 'rgba(200, 180, 150, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

// 启动应用
new DisciplinePathMap();

