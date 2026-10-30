import { Particle } from '../types/game';

export class ParticleSystem {
  private particles: Particle[] = [];

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Friction
      p.vx *= 0.94;
      p.vy *= 0.94;

      // Alpha decay
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.type === 'shockwave' || p.type === 'ring') {
        p.size += (p.scale || 180) * dt * 2.5;
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;

      if (p.type === 'comic_text' && p.text) {
        ctx.save();
        ctx.font = 'bold 15px "Cairo", sans-serif';
        const metrics = ctx.measureText(p.text);
        const bubbleW = metrics.width + 16;
        const bubbleH = 26;

        // Speech bubble pill background
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        const bx = p.x - bubbleW / 2;
        const by = p.y - bubbleH;
        ctx.roundRect(bx, by, bubbleW, bubbleH, 8);
        ctx.fill();

        // Little speech bubble pointer tail
        ctx.beginPath();
        ctx.moveTo(p.x - 4, by + bubbleH);
        ctx.lineTo(p.x, by + bubbleH + 6);
        ctx.lineTo(p.x + 4, by + bubbleH);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Speech bubble text
        ctx.shadowBlur = 0;
        ctx.fillStyle = p.color || '#e11d48';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.text, p.x, by + bubbleH / 2);
        ctx.restore();
      } else if (p.type === 'shockwave' || p.type === 'ring') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.lineWidth = 4 * p.alpha;
        ctx.strokeStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.stroke();
      } else if (p.type === 'sweat') {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'star') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.fillStyle = p.color || '#fbbf24';
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
          ctx.lineTo(Math.cos(((18 + j * 72) * Math.PI) / 180) * p.size, -Math.sin(((18 + j * 72) * Math.PI) / 180) * p.size);
          ctx.lineTo(Math.cos(((54 + j * 72) * Math.PI) / 180) * (p.size / 2), -Math.sin(((54 + j * 72) * Math.PI) / 180) * (p.size / 2));
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        // Generic circular dust / spark particle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  public emitShockwave(x: number, y: number, color: string, radius: number = 220) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: 15,
      color,
      alpha: 1,
      maxLife: 0.45,
      life: 0.45,
      type: 'shockwave',
      scale: radius,
    });

    // Secondary faster inner ring
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      size: 5,
      color: '#ffffff',
      alpha: 1,
      maxLife: 0.35,
      life: 0.35,
      type: 'ring',
      scale: radius * 0.8,
    });

    // Emitting radial sparks
    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 * i) / 18;
      const speed = 120 + Math.random() * 160;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color,
        alpha: 1,
        maxLife: 0.4 + Math.random() * 0.2,
        life: 0.4 + Math.random() * 0.2,
        type: 'spark',
      });
    }
  }

  public emitSweat(x: number, y: number) {
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y - 20,
        vx: (Math.random() - 0.5) * 60,
        vy: -70 - Math.random() * 60,
        size: 3 + Math.random() * 2,
        color: '#67e8f9',
        alpha: 1,
        maxLife: 0.4,
        life: 0.4,
        type: 'sweat',
      });
    }
  }

  public emitComicText(x: number, y: number, text: string, color = '#dc2626') {
    this.particles.push({
      x,
      y: y - 35,
      vx: (Math.random() - 0.5) * 20,
      vy: -55,
      size: 14,
      color,
      alpha: 1,
      maxLife: 1.1,
      life: 1.1,
      type: 'comic_text',
      text,
    });
  }

  public emitDust(x: number, y: number, color = 'rgba(255,255,255,0.4)') {
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 40,
      vy: (Math.random() - 0.5) * 40,
      size: 3 + Math.random() * 4,
      color,
      alpha: 0.7,
      maxLife: 0.35,
      life: 0.35,
      type: 'dust',
    });
  }

  public emitStars(x: number, y: number, count = 8, color = '#facc15') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 4,
        color,
        alpha: 1,
        maxLife: 0.6,
        life: 0.6,
        type: 'star',
      });
    }
  }

  public clear() {
    this.particles = [];
  }
}
