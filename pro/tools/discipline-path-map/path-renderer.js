// 路径渲染模块
// 目标：不是喷枪，而是“压实的土路 + 草梗毛刺”

export class PathRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // 低饱和卡其色调色板（中心土色）
    this.coreColors = [
      '#ab8f5b', // 卡其土黄
      '#938458', // 暗土色
      '#87805a', // 灰黄土
    ];

    // 草毛刺颜色（更暗、更透明）
    this.fringeColors = [
      'rgba(110, 100, 70, 0.45)',
      'rgba(95, 105, 70, 0.38)',
      'rgba(90, 85, 60, 0.32)',
    ];
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 绘制从 p0 到 p1 的一小段路径
   * @param {{x:number,y:number}} p0
   * @param {{x:number,y:number}} p1
   * @param {number} baseRadius 半宽（中心压实带的大致半径）
   */
  drawSegment(p0, p1, baseRadius) {
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (!isFinite(dist) || dist === 0) return;

    const ux = dx / dist;
    const uy = dy / dist;

    // 中心压实区：仅用一笔连续 stroke，避免“一个个圆圈”的喷枪感
    this.#drawCoreStroke(p0, p1, baseRadius);

    // 在这段中间位置附近生成草毛刺
    const midX = (p0.x + p1.x) * 0.5;
    const midY = (p0.y + p1.y) * 0.5;
    this.#drawFringe(midX, midY, baseRadius, ux, uy);
  }

  // 根据空间位置决定颜色，避免每帧随机导致“圈圈分界”
  #getCoreColorAt(x, y) {
    const n =
      (Math.sin(x * 0.005) + Math.cos(y * 0.005) + Math.sin((x + y) * 0.003)) *
        0.25 +
      0.5; // 映射到 0–1 之间的缓变噪声
    const idx = Math.min(
      this.coreColors.length - 1,
      Math.floor(n * this.coreColors.length),
    );
    return this.coreColors[idx];
  }

  // 中心“压实土路”：连续、略带内部纹理，但边缘相对干净
  #drawCoreStroke(p0, p1, baseRadius) {
    const ctx = this.ctx;

    // 主色：依据位置缓慢变化，而不是每帧随机
    const cx = (p0.x + p1.x) * 0.5;
    const cy = (p0.y + p1.y) * 0.5;
    const mainColor = this.#getCoreColorAt(cx, cy);
    const width = baseRadius * 2.1; // 总宽度

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 主体一笔，保证连续
    ctx.strokeStyle = mainColor;
    ctx.globalAlpha = 0.96;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();

    ctx.restore();
  }

  // 边缘“草毛刺区”：稀疏、短刺、有缺口感
  #drawFringe(x, y, coreRadius, ux, uy) {
    const ctx = this.ctx;

    // 路径法线（大致垂直于走向）
    const nx = -uy;
    const ny = ux;

    const spikes = 4 + (Math.random() * 3) | 0; // 4–6 根

    ctx.save();
    ctx.lineCap = 'round';

    for (let i = 0; i < spikes; i++) {
      const side = Math.random() < 0.5 ? -1 : 1; // 左/右侧
      // 刺从主体边缘稍外一点开始
      const baseOffset = coreRadius * (1.02 + Math.random() * 0.25);

      // 起点在法线方向偏移
      const startX = x + nx * side * baseOffset;
      const startY = y + ny * side * baseOffset;

      // 刺长度 2–9px
      const len = 2 + Math.random() * 7;

      // 刺方向：大致沿法线方向，带一点弯折
      const angleJitter = (Math.random() - 0.5) * 0.7; // -0.35 ~ 0.35
      const cosJ = Math.cos(angleJitter);
      const sinJ = Math.sin(angleJitter);
      const jx = nx * cosJ - ny * sinJ;
      const jy = nx * sinJ + ny * cosJ;

      const endX = startX + jx * side * len;
      const endY = startY + jy * side * len;

      ctx.beginPath();
      ctx.strokeStyle =
        this.fringeColors[(Math.random() * this.fringeColors.length) | 0];
      ctx.lineWidth = 0.8 + Math.random() * 0.6;
      ctx.globalAlpha = 0.22 + Math.random() * 0.2; // 更低透明度，保留断续感
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    ctx.restore();
  }
}


