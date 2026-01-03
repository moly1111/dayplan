// 交互处理模块
// - 左键拖动：在路径层绘制土路，并在黑暗层擦除
// - 滚轮：以鼠标为中心缩放（zoom）整张地图
// - 中键拖动：平移（pan）地图
// - 右键：弹出自定义菜单（占位）

export class InteractionHandler {
  constructor(rootCanvas, pathRenderer, darknessRenderer, uiCanvas) {
    this.rootCanvas = rootCanvas; // 用于尺寸和事件绑定
    this.pathRenderer = pathRenderer;
    this.darknessRenderer = darknessRenderer;
    this.uiCanvas = uiCanvas;

    this.container = rootCanvas.parentElement;

    // 视图变换（用于 zoom & pan）
    this.scale = 1;
    this.minScale = 0.5;
    this.maxScale = 2.5;
    this.offsetX = 0;
    this.offsetY = 0;

    // 绘制相关
    this.isDrawing = false;
    this.isPanning = false;
    this.lastPointer = null; // 屏幕坐标
    this.targetWorld = null; // 目标世界坐标
    this.followerWorld = null; // 跟随点世界坐标
    this.lastFollowerWorld = null;

    // 基础粗细范围（配合压感做连续变化）
    this.baseRadiusMin = 10; // 很快时的最细
    this.baseRadiusMax = 34; // 很慢时的最粗
    this.lastPressure = 1; // 用于平滑粗细变化（0-1）

    // 上一帧时间，用于估算“速度”
    this.lastFrameTime = performance.now();

    // 右键菜单
    this.contextMenu = document.getElementById('context-menu');

    this.#bindEvents();
    this.#startLoop();
  }

  // 将屏幕坐标转换为世界坐标（canvas 内部坐标）
  screenToWorld(x, y) {
    const rect = this.rootCanvas.getBoundingClientRect();
    const canvasX = x - rect.left;
    const canvasY = y - rect.top;
    return {
      x: (canvasX - this.offsetX) / this.scale,
      y: (canvasY - this.offsetY) / this.scale,
    };
  }

  // 更新 container 的 CSS 变换，实现缩放和平移
  updateTransform() {
    if (!this.container) return;
    this.container.style.transformOrigin = '0 0';
    this.container.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;
  }

  #bindEvents() {
    const canvas = this.rootCanvas;
    const target = this.container || canvas; // 实际接收鼠标事件的元素（容器在最上层）

    // 禁用默认右键菜单
    target.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.#showContextMenu(e.clientX, e.clientY);
    });

    target.addEventListener('mousedown', (e) => {
      // 仅在 canvas 范围内处理
      e.preventDefault();
      this.#hideContextMenu();

      if (e.button === 0) {
        // 左键：开始绘制
        const world = this.screenToWorld(e.clientX, e.clientY);
        this.isDrawing = true;
        this.container.classList.add('drawing');
        this.followerWorld = { ...world };
        this.lastFollowerWorld = { ...world };
        this.targetWorld = { ...world };
        this.lastPointer = { x: e.clientX, y: e.clientY };
      } else if (e.button === 1) {
        // 中键：开始平移
        this.isPanning = true;
        this.container.classList.add('panning');
        this.lastPointer = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0 && this.isDrawing) {
        this.isDrawing = false;
        this.container.classList.remove('drawing');
      } else if (e.button === 1 && this.isPanning) {
        this.isPanning = false;
        this.container.classList.remove('panning');
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDrawing) {
        // 更新目标世界坐标
        this.targetWorld = this.screenToWorld(e.clientX, e.clientY);
        this.lastPointer = { x: e.clientX, y: e.clientY };
      } else if (this.isPanning && this.lastPointer) {
        // 平移
        const dx = e.clientX - this.lastPointer.x;
        const dy = e.clientY - this.lastPointer.y;
        this.offsetX += dx;
        this.offsetY += dy;
        this.lastPointer = { x: e.clientX, y: e.clientY };
        this.updateTransform();
      }
    });

    // 滚轮缩放（以鼠标为中心）
    target.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();

        const wheelDelta = e.deltaY;
        const zoomFactor = 1.0 - wheelDelta * 0.0015; // 滚轮越快缩放越明显
        const newScale = this.#clamp(
          this.scale * zoomFactor,
          this.minScale,
          this.maxScale,
        );

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // 当前鼠标在世界坐标中的位置
        const worldX = (mouseX - this.offsetX) / this.scale;
        const worldY = (mouseY - this.offsetY) / this.scale;

        // 更新缩放，并调整 offset 以保持鼠标位置不变
        this.scale = newScale;
        this.offsetX = mouseX - worldX * this.scale;
        this.offsetY = mouseY - worldY * this.scale;
        this.updateTransform();
      },
      { passive: false },
    );

    // 全局点击隐藏菜单
    window.addEventListener('click', (e) => {
      if (this.contextMenu && !this.contextMenu.contains(e.target)) {
        this.#hideContextMenu();
      }
    });
  }

  #showContextMenu(x, y) {
    if (!this.contextMenu) return;
    this.contextMenu.style.left = `${x}px`;
    this.contextMenu.style.top = `${y}px`;
    this.contextMenu.classList.remove('hidden');
  }

  #hideContextMenu() {
    if (!this.contextMenu) return;
    this.contextMenu.classList.add('hidden');
  }

  #clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  // 动画循环：负责 smoothing + 绘制段 + 擦除黑暗
  #startLoop() {
    const loop = () => {
      const now = performance.now();
      const dt = Math.max(16, now - this.lastFrameTime); // 约 60fps
      this.lastFrameTime = now;

      if (this.isDrawing && this.targetWorld && this.followerWorld) {
        // 简单惯性 / smoothing：跟随点向目标点插值移动
        const lerpFactor = 0.32; // 滞后感
        const tx = this.targetWorld.x;
        const ty = this.targetWorld.y;
        const fx = this.followerWorld.x;
        const fy = this.followerWorld.y;

        const newFx = fx + (tx - fx) * lerpFactor;
        const newFy = fy + (ty - fy) * lerpFactor;

        const prev = { ...this.followerWorld };
        const curr = { x: newFx, y: newFy };
        this.followerWorld = curr;

        const vx = curr.x - prev.x;
        const vy = curr.y - prev.y;
        const dist = Math.sqrt(vx * vx + vy * vy);
        const speed = dist / (dt || 16); // 粗略速度估计

        // 速度 → “压感”（类似毛笔）：
        // - 非线性 + 平滑：慢速时压感接近 1，快速时迅速衰减
        // - 使用上一帧的压感做插值，保证是一个连续变化量，而非跳档
        // 提高敏感度，让快慢差异更直观
        const raw = this.#clamp(speed * 220, 0, 1); // 系数越大，对速度越敏感
        const targetPressure = Math.pow(1 - raw, 2.0); // 更陡的曲线：中高速迅速变细
        const smoothFactor = 0.45; // 稍快一点的响应，手感更“跟手”
        this.lastPressure =
          this.lastPressure +
          (targetPressure - this.lastPressure) * smoothFactor;
        const pressure = this.lastPressure;

        const baseRadius =
          this.baseRadiusMin +
          (this.baseRadiusMax - this.baseRadiusMin) * pressure;

        // ——“画笔逻辑”：把 prev→curr 按固定空间步长切成多段，逐段绘制——
        if (dist > 0) {
          const stepLen = Math.max(2, baseRadius * 0.6); // 与粗细相关的固定步长
          const steps = Math.max(1, Math.ceil(dist / stepLen));

          let lastPoint = prev;
          for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const px = prev.x + vx * t;
            const py = prev.y + vy * t;
            const point = { x: px, y: py };

            // 在路径层绘制“土路”（连续小段）
            this.pathRenderer.drawSegment(lastPoint, point, baseRadius);

            // 在黑暗层沿段擦除，半径略大于路径厚度（始终连续）
            const eraseRadius = baseRadius * 1.15;
            if (typeof this.darknessRenderer.eraseSegment === 'function') {
              this.darknessRenderer.eraseSegment(lastPoint, point, eraseRadius);
            } else {
              this.darknessRenderer.erase(point.x, point.y, eraseRadius);
            }

            lastPoint = point;
          }
        }
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}


