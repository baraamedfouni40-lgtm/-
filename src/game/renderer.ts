import {
  BoyEntity,
  HeroineProfile,
  Obstacle,
  PowerUp,
  ArenaConfig,
  BananaTrap,
  KeyItem,
  HeroineHunter,
  CharacterCustomization,
} from '../types/game';

export class GameRenderer {
  // Draw the arena background, floor grid, boundary warning lines, and exits
  public drawArena(ctx: CanvasRenderingContext2D, arena: ArenaConfig, gateUnlocked = false) {
    // Fill main field
    ctx.fillStyle = arena.bgColor;
    ctx.fillRect(0, 0, arena.width, arena.height);

    // Grid lines / floor patterns
    ctx.save();
    ctx.strokeStyle = arena.gridColor;
    ctx.lineWidth = 1.5;
    const gridSize = 80;

    for (let x = 0; x <= arena.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, arena.height);
      ctx.stroke();
    }
    for (let y = 0; y <= arena.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(arena.width, y);
      ctx.stroke();
    }

    // Center court circle / emblem
    ctx.beginPath();
    ctx.arc(arena.width / 2, arena.height / 2, 160, 0, Math.PI * 2);
    ctx.strokeStyle = arena.borderColor + '33';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center star emblem
    ctx.beginPath();
    ctx.arc(arena.width / 2, arena.height / 2, 8, 0, Math.PI * 2);
    ctx.fillStyle = arena.borderColor + '66';
    ctx.fill();

    // Arena boundary barrier with glowing neon borders & exit gates
    const borderCol = gateUnlocked ? '#22c55e' : arena.borderColor;
    ctx.lineWidth = gateUnlocked ? 12 : 8;
    ctx.strokeStyle = borderCol;
    ctx.shadowColor = borderCol;
    ctx.shadowBlur = gateUnlocked ? 25 : 15;
    ctx.strokeRect(4, 4, arena.width - 8, arena.height - 8);

    // Draw comic Exit signs around the 4 borders where boys run to escape
    ctx.shadowBlur = 0;
    ctx.font = 'bold 14px "Cairo", sans-serif';
    ctx.fillStyle = gateUnlocked ? '#22c55e' : '#ef4444';
    ctx.textAlign = 'center';

    const exitLabel = gateUnlocked ? '🟢 البوابة مفتوحة! اهرب هنا!' : '🚪 مخرج الهروب (EXIT)';

    // Top & Bottom exits
    ctx.fillText(exitLabel, arena.width / 2, 24);
    ctx.fillText(exitLabel, arena.width / 2, arena.height - 14);

    // Left & Right exits
    ctx.save();
    ctx.translate(24, arena.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(exitLabel, 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(arena.width - 24, arena.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillText(exitLabel, 0, 0);
    ctx.restore();

    ctx.restore();
  }

  // Draw obstacles (benches, trees, cones, fences)
  public drawObstacles(ctx: CanvasRenderingContext2D, obstacles: Obstacle[]) {
    for (const ob of obstacles) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;

      if (ob.type === 'bench') {
        // Wood / metallic bench
        ctx.fillStyle = ob.color;
        ctx.beginPath();
        ctx.roundRect(ob.x, ob.y, ob.width, ob.height, 6);
        ctx.fill();

        // Slats
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(ob.x + 2, ob.y + 2, ob.width - 4, ob.height - 4);
      } else if (ob.type === 'cone') {
        // Traffic / training cone
        ctx.fillStyle = ob.color;
        ctx.beginPath();
        ctx.arc(ob.x + ob.width / 2, ob.y + ob.height / 2, ob.width / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ob.x + ob.width / 2, ob.y + ob.height / 2, ob.width / 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = ob.color;
        ctx.beginPath();
        ctx.arc(ob.x + ob.width / 2, ob.y + ob.height / 2, ob.width / 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (ob.type === 'tree') {
        // Campus green tree top-down
        ctx.fillStyle = '#065f46';
        ctx.beginPath();
        ctx.arc(ob.x + ob.width / 2, ob.y + ob.height / 2, ob.width / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(ob.x + ob.width / 2, ob.y + ob.height / 2 - 4, ob.width / 2.6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Fence
        ctx.fillStyle = ob.color;
        ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
      }
      ctx.restore();
    }
  }

  // Draw collectible power-ups
  public drawPowerUps(ctx: CanvasRenderingContext2D, powerUps: PowerUp[]) {
    for (const pu of powerUps) {
      if (pu.collected) continue;
      ctx.save();
      const bobY = Math.sin(pu.bobTimer * 6) * 5;
      const cy = pu.y + bobY;

      // Glow halo
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#f59e0b';

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(pu.x, cy, 18, 0, Math.PI * 2);
      ctx.fill();

      // Icon symbol inside
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#1e1b4b';
      ctx.font = 'bold 16px "Cairo", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let icon = '⚡';
      if (pu.type === 'megaphone') icon = '📢';
      if (pu.type === 'star') icon = '⭐';
      if (pu.type === 'shield') icon = '🛡️';

      ctx.fillText(icon, pu.x, cy);
      ctx.restore();
    }
  }

  // Draw the Heroine (player) with heroic costume, animated aura, and cape
  public drawHeroine(
    ctx: CanvasRenderingContext2D,
    heroine: HeroineProfile,
    x: number,
    y: number,
    facingAngle: number,
    isMoving: boolean,
    walkCycle: number,
    isRage: boolean,
    intimidationRadius: number,
    custom?: CharacterCustomization
  ) {
    ctx.save();
    ctx.translate(x, y);

    const skinColor = custom?.skinTone || '#fed7aa';
    const eyeColor = custom?.eyeColor || '#ec4899';
    const hairColor = custom?.hairColor || heroine.secondaryColor;
    const hairStyle = custom?.hairStyle || 'long';
    const shirtColor = custom?.shirtColor || heroine.color;
    const pantsColor = custom?.pantsColor || '#0f172a';
    const shoesColor = custom?.shoesColor || '#fbbf24';
    const accessory = custom?.accessory || 'headband';
    const outfitStyle = custom?.outfitStyle || 'superhero_suit';
    const mainAura = custom?.auraColor || heroine.color;

    // 1. Draw Intimidation / Fear Aura
    const auraPulse = Math.sin(walkCycle * 4) * 8;
    const currentRadius = intimidationRadius + auraPulse + (isRage ? 40 : 0);

    const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, currentRadius);
    grad.addColorStop(0, mainAura + '77');
    grad.addColorStop(0.7, mainAura + '22');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
    ctx.fill();

    // Aura ring outline with electric ticks
    ctx.strokeStyle = isRage ? '#fbbf24' : mainAura;
    ctx.lineWidth = isRage ? 3 : 1.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Extra accessory aura
    if (accessory === 'energy_aura') {
      ctx.save();
      ctx.strokeStyle = mainAura;
      ctx.lineWidth = 2;
      ctx.shadowColor = mainAura;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Rotate to face movement direction
    ctx.rotate(facingAngle);

    // Dynamic ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flowing Heroic Cape (sways with movement)
    if (accessory === 'hero_cape' || outfitStyle === 'superhero_suit') {
      const capeWiggle = Math.sin(walkCycle * 6) * 6;
      ctx.fillStyle = isRage ? '#ef4444' : hairColor;
      ctx.beginPath();
      ctx.moveTo(-8, -5);
      ctx.lineTo(-25 - (isMoving ? 9 : 0), -13 + capeWiggle);
      ctx.lineTo(-25 - (isMoving ? 9 : 0), 13 + capeWiggle);
      ctx.lineTo(-8, 5);
      ctx.closePath();
      ctx.fill();
    }

    // Heroic athletic legs (running animation)
    const legOffset = isMoving ? Math.sin(walkCycle * 8) * 7 : 0;
    ctx.fillStyle = pantsColor; // athletic leggings
    // Left leg
    ctx.beginPath();
    ctx.ellipse(-2, -7 + legOffset, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right leg
    ctx.beginPath();
    ctx.ellipse(-2, 7 - legOffset, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Heroic Shoes / Sneakers / Boots
    ctx.fillStyle = shoesColor;
    ctx.fillRect(2, -9 + legOffset, 5.5, 4);
    ctx.fillRect(2, 5 - legOffset, 5.5, 4);
    // Soles
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, -9 + legOffset, 1.5, 4);
    ctx.fillRect(6, 5 - legOffset, 1.5, 4);

    // Torso / Outfit Style
    ctx.fillStyle = shirtColor;
    ctx.shadowColor = isRage ? '#f59e0b' : shirtColor;
    ctx.shadowBlur = isRage ? 16 : 6;
    ctx.beginPath();
    ctx.roundRect(-8, -10, 16, 20, 6);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Specific Outfit Style Details
    if (outfitStyle === 'superhero_suit') {
      // Golden Chest Emblem / Champion Star
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(1, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      // Power Belt
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-8, -2, 3, 4);
    } else if (outfitStyle === 'hoodie') {
      // Hood seam and pocket
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(-2, -6, 5, 12);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-5, -3);
      ctx.lineTo(-5, 3);
      ctx.stroke();
    } else if (outfitStyle === 'ninja') {
      // Crossed ninja tunic lines
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-6, -9);
      ctx.lineTo(2, 0);
      ctx.lineTo(-6, 9);
      ctx.stroke();
      // Red sash
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-7, -9, 3, 18);
    } else if (outfitStyle === 'sports_jersey') {
      // Number 7 on chest
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('7', 0, 0);
    } else if (outfitStyle === 'cyber_armor') {
      // Glowing tech core
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 8;
      ctx.fillRect(-1, -3, 4, 6);
      ctx.shadowBlur = 0;
    }

    // Gold Chain Accessory
    if (accessory === 'gold_chain') {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(1, 0, 5, -0.6, 0.6);
      ctx.stroke();
    }

    // Arms
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.ellipse(0, -11 + legOffset * 0.4, 6, 3.5, 0, 0, Math.PI * 2);
    ctx.ellipse(0, 11 - legOffset * 0.4, 6, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Heroine Head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(6, 0, 11, 0, Math.PI * 2);
    ctx.fill();

    // Hair Style Rendering
    ctx.fillStyle = hairColor;
    if (hairStyle === 'spiky') {
      ctx.beginPath();
      ctx.moveTo(-4, -10);
      ctx.lineTo(-12, -14);
      ctx.lineTo(-6, -8);
      ctx.lineTo(-15, 0);
      ctx.lineTo(-6, 8);
      ctx.lineTo(-12, 14);
      ctx.lineTo(-4, 10);
      ctx.closePath();
      ctx.fill();
    } else if (hairStyle === 'ponytail') {
      ctx.beginPath();
      ctx.arc(2, 0, 11, Math.PI * 0.45, Math.PI * 1.55);
      ctx.closePath();
      ctx.fill();
      // Ponytail tail
      ctx.beginPath();
      ctx.arc(-14, -2, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (hairStyle === 'braids') {
      ctx.beginPath();
      ctx.arc(2, 0, 11, Math.PI * 0.45, Math.PI * 1.55);
      ctx.closePath();
      ctx.fill();
      // Twin braids
      ctx.fillRect(-16, -9, 12, 4);
      ctx.fillRect(-16, 5, 12, 4);
    } else if (hairStyle === 'afro') {
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
    } else if (hairStyle === 'undercut') {
      ctx.beginPath();
      ctx.arc(3, 0, 11, Math.PI * 0.3, Math.PI * 1.7);
      ctx.lineTo(-8, 3);
      ctx.closePath();
      ctx.fill();
    } else {
      // Long flowing hair
      ctx.beginPath();
      ctx.arc(2, 0, 12, Math.PI * 0.45, Math.PI * 1.55);
      ctx.lineTo(-20, 0);
      ctx.closePath();
      ctx.fill();
    }

    // Expressive Heroic Eyes with eyeColor!
    // White Sclera
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(10.5, -4, 2.8, 0, Math.PI * 2);
    ctx.arc(10.5, 4, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Iris with custom eyeColor
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(11, -4, 1.8, 0, Math.PI * 2);
    ctx.arc(11, 4, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(11.2, -4, 0.9, 0, Math.PI * 2);
    ctx.arc(11.2, 4, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(10.6, -4.5, 0.6, 0, Math.PI * 2);
    ctx.arc(10.6, 3.5, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Eyeliner / Heroic Lashes
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(9, -6);
    ctx.lineTo(12.5, -4);
    ctx.moveTo(9, 6);
    ctx.lineTo(12.5, 4);
    ctx.stroke();

    // Confident grin
    if (accessory !== 'ninja_mask') {
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(10, 0, 3, -0.3, 0.3);
      ctx.stroke();
    } else {
      // Ninja Mask
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(8, -5, 4, 10);
    }

    // Accessories: Glasses
    if (accessory === 'glasses') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(9, -7, 3, 5);
      ctx.fillRect(9, 2, 3, 5);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(10, -2);
      ctx.lineTo(10, 2);
      ctx.stroke();
    }

    // Accessories: Headphones
    if (accessory === 'headphones') {
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(4, -13, 4, 26);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(5, -14, 3, 3);
      ctx.fillRect(5, 11, 3, 3);
    }

    // Accessories: Headband / Tiara
    if (accessory === 'headband') {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(7, -8, 3, 16);
      ctx.fillRect(-2, 7, 5, 2);
    }

    // Accessories: Golden Crown
    if (accessory === 'golden_crown') {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(8, -8);
      ctx.lineTo(12, -10);
      ctx.lineTo(10, 0);
      ctx.lineTo(12, 10);
      ctx.lineTo(8, 8);
      ctx.closePath();
      ctx.fill();
      // Red Jewel
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(9.5, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Accessories: Cat Ears
    if (accessory === 'cat_ears') {
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.moveTo(4, -10);
      ctx.lineTo(2, -16);
      ctx.lineTo(8, -11);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(4, 10);
      ctx.lineTo(2, 16);
      ctx.lineTo(8, 11);
      ctx.closePath();
      ctx.fill();
      // Pink ear inside
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(3.5, -13, 2, 3);
      ctx.fillRect(3.5, 10, 2, 3);
    }

    // Heroic power hands / glowing bracelets
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(5, -13, 4, 0, Math.PI * 2);
    ctx.arc(5, 13, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw a Boy with funny comical expressions, running legs, sweat drops, panic poses, and full customization
  public drawBoy(ctx: CanvasRenderingContext2D, boy: BoyEntity, custom?: CharacterCustomization) {
    if (boy.isEscaped) return;

    ctx.save();
    ctx.translate(boy.x, boy.y);

    const skinColor = custom?.skinTone || '#fed7aa';
    const eyeColor = custom?.eyeColor || '#0284c7';
    const pantsColor = custom?.pantsColor || '#1e293b';
    const shirtColor = custom?.shirtColor || boy.shirtColor;
    const shoesColor = custom?.shoesColor || '#ffffff';
    const hairColor = custom?.hairColor || boy.hairColor;
    const hairStyle = custom?.hairStyle || 'messy';
    const outfitStyle = custom?.outfitStyle || 'casual';
    const accessory = custom?.accessory || (boy.type === 'gamer' ? 'headphones' : 'none');

    // Energy Aura accessory
    if (accessory === 'energy_aura') {
      const auraColor = custom?.auraColor || '#38bdf8';
      ctx.save();
      ctx.strokeStyle = auraColor;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = auraColor;
      ctx.shadowBlur = 10;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, boy.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 4, boy.radius * 0.9, boy.radius * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rotate towards movement
    ctx.rotate(boy.facingAngle);

    const isPanicking = boy.isPanicking || boy.fear > 70;
    const legFreq = isPanicking ? 14 : 7;
    const legSwing = Math.sin(boy.legCycle * legFreq) * (isPanicking ? 9 : 5);

    // Hero Cape if equipped
    if (accessory === 'hero_cape') {
      const capeWiggle = Math.sin(boy.legCycle * 6) * 5;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-7, -4);
      ctx.lineTo(-22, -10 + capeWiggle);
      ctx.lineTo(-22, 10 + capeWiggle);
      ctx.lineTo(-7, 4);
      ctx.closePath();
      ctx.fill();
    }

    // 1. Legs (Running frantically!)
    ctx.fillStyle = pantsColor; // Pants
    // Left leg
    ctx.beginPath();
    ctx.ellipse(-2, -6 + legSwing, 6, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right leg
    ctx.beginPath();
    ctx.ellipse(-2, 6 - legSwing, 6, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shoes / Sneakers with custom shoesColor
    ctx.fillStyle = shoesColor;
    ctx.fillRect(2, -8 + legSwing, 5.5, 3.5);
    ctx.fillRect(2, 4.5 - legSwing, 5.5, 3.5);
    // Soles
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(6.5, -8 + legSwing, 1.2, 3.5);
    ctx.fillRect(6.5, 4.5 - legSwing, 1.2, 3.5);

    // 2. Torso (Outfit style)
    ctx.fillStyle = shirtColor;
    ctx.beginPath();
    ctx.roundRect(-7, -8, 14, 16, 4);
    ctx.fill();

    // Outfit Style Details
    if (outfitStyle === 'hoodie') {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(-2, -5, 4, 10);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-5, -2);
      ctx.lineTo(-5, 2);
      ctx.stroke();
    } else if (outfitStyle === 'superhero_suit') {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (outfitStyle === 'ninja') {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-5, -7);
      ctx.lineTo(1, 0);
      ctx.lineTo(-5, 7);
      ctx.stroke();
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-6, -7, 2.5, 14);
    } else if (outfitStyle === 'sports_jersey') {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('10', 0, 0);
    } else if (outfitStyle === 'cyber_armor') {
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-1, -2, 3, 4);
    }

    // Gold Chain Accessory
    if (accessory === 'gold_chain') {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(1, 0, 5, -0.6, 0.6);
      ctx.stroke();
    }

    // 3. Arms
    ctx.fillStyle = skinColor;
    if (isPanicking) {
      // Hilarious flailing arms forward / up in total terror!
      const armWiggle = Math.sin(boy.legCycle * 18) * 4;
      ctx.beginPath();
      ctx.ellipse(10, -11 + armWiggle, 6, 3.5, 0.4, 0, Math.PI * 2);
      ctx.ellipse(10, 11 - armWiggle, 6, 3.5, -0.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.ellipse(0, -10 + legSwing * 0.5, 5, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(0, 10 - legSwing * 0.5, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(4, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    // Hair Style Rendering
    ctx.fillStyle = hairColor;
    if (hairStyle === 'spiky') {
      ctx.beginPath();
      ctx.moveTo(-4, -8);
      ctx.lineTo(-9, -12);
      ctx.lineTo(-3, -9);
      ctx.lineTo(-12, 0);
      ctx.lineTo(-3, 9);
      ctx.lineTo(-9, 12);
      ctx.lineTo(-4, 8);
      ctx.closePath();
      ctx.fill();
    } else if (hairStyle === 'long') {
      ctx.beginPath();
      ctx.arc(0, 0, 11, Math.PI * 0.35, Math.PI * 1.65);
      ctx.lineTo(-15, 0);
      ctx.closePath();
      ctx.fill();
    } else if (hairStyle === 'ponytail') {
      ctx.beginPath();
      ctx.arc(1, 0, 10, Math.PI * 0.4, Math.PI * 1.6);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-10, -2, 4.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (hairStyle === 'afro') {
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();
    } else if (hairStyle === 'braids') {
      ctx.beginPath();
      ctx.arc(1, 0, 10, Math.PI * 0.4, Math.PI * 1.6);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(-12, -7, 8, 3);
      ctx.fillRect(-12, 4, 8, 3);
    } else if (hairStyle === 'undercut') {
      ctx.beginPath();
      ctx.arc(2, 0, 9.5, Math.PI * 0.3, Math.PI * 1.7);
      ctx.lineTo(-6, 2);
      ctx.closePath();
      ctx.fill();
    } else {
      // Classic Messy
      ctx.beginPath();
      ctx.arc(1, 0, 10, Math.PI * 0.4, Math.PI * 1.6);
      ctx.closePath();
      ctx.fill();
    }

    // Comical Eyes & Face based on Fear with eyeColor!
    if (isPanicking) {
      // Super wide cartoon terrified eyes `O_O`
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(8, -4, 4.2, 0, Math.PI * 2);
      ctx.arc(8, 4, 4.2, 0, Math.PI * 2);
      ctx.fill();

      // Iris with custom eyeColor!
      ctx.fillStyle = eyeColor;
      const pupilShift = (Math.random() - 0.5) * 1.5;
      ctx.beginPath();
      ctx.arc(9 + pupilShift, -4, 2.4, 0, Math.PI * 2);
      ctx.arc(9 + pupilShift, 4, 2.4, 0, Math.PI * 2);
      ctx.fill();

      // Tiny black pupils shivering in fear
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(9 + pupilShift, -4, 1.2, 0, Math.PI * 2);
      ctx.arc(9 + pupilShift, 4, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Catchlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(8.3 + pupilShift, -4.7, 0.7, 0, Math.PI * 2);
      ctx.arc(8.3 + pupilShift, 3.3, 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Screaming gaping open mouth `O`
      if (accessory !== 'ninja_mask') {
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.ellipse(9, 0, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Normal cartoon eyes with white sclera and vibrant custom eyeColor iris!
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(8, -3.2, 2.8, 0, Math.PI * 2);
      ctx.arc(8, 3.2, 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Iris in custom eyeColor
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(8.4, -3.2, 1.8, 0, Math.PI * 2);
      ctx.arc(8.4, 3.2, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Black pupil
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(8.7, -3.2, 0.9, 0, Math.PI * 2);
      ctx.arc(8.7, 3.2, 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Catchlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(8.2, -3.7, 0.6, 0, Math.PI * 2);
      ctx.arc(8.2, 2.7, 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Eyebrows
      ctx.strokeStyle = hairColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(6.5, -4.8);
      ctx.lineTo(9.5, -4.2);
      ctx.moveTo(6.5, 4.8);
      ctx.lineTo(9.5, 4.2);
      ctx.stroke();

      // Smile or straight mouth
      if (accessory !== 'ninja_mask') {
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, -1.2);
        ctx.lineTo(8, 1.2);
        ctx.stroke();
      }
    }

    // Ninja Mask
    if (accessory === 'ninja_mask') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(7, -5, 4, 10);
    }

    // Accessories: Sunglasses
    if (accessory === 'glasses') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(7, -6, 3, 4);
      ctx.fillRect(7, 2, 3, 4);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(8, -2);
      ctx.lineTo(8, 2);
      ctx.stroke();
    }

    // Accessories: Headphones
    if (accessory === 'headphones') {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(1, -11, 4, 22);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(2, -12, 3, 3);
      ctx.fillRect(2, 9, 3, 3);
    }

    // Accessories: Headband
    if (accessory === 'headband') {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(5, -9, 3, 18);
      ctx.fillRect(-3, 6, 5, 2);
    }

    // Accessories: Cap
    if (accessory === 'cap' || hairStyle === 'cap') {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(3, 0, 9.5, Math.PI * 0.4, Math.PI * 1.6);
      ctx.fill();
      ctx.fillRect(8, -5, 4, 10);
    }

    // Accessories: Golden Crown
    if (accessory === 'golden_crown') {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(6, -7);
      ctx.lineTo(10, -9);
      ctx.lineTo(8, 0);
      ctx.lineTo(10, 9);
      ctx.lineTo(6, 7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(7.5, 0, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Accessories: Cat Ears
    if (accessory === 'cat_ears') {
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.moveTo(3, -9);
      ctx.lineTo(1, -15);
      ctx.lineTo(7, -10);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(3, 9);
      ctx.lineTo(1, 15);
      ctx.lineTo(7, 10);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    // 5. Overhead Fear Gauge Bar (World-matched, floating over head)
    if (boy.fear > 5) {
      ctx.save();
      const barW = 32;
      const barH = 5;
      const barX = boy.x - barW / 2;
      const barY = boy.y - boy.radius - 14;

      // Dark background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

      // Gradient fear fill (yellow -> red)
      const fillW = (boy.fear / 100) * barW;
      ctx.fillStyle = boy.fear > 70 ? '#ef4444' : '#f59e0b';
      ctx.fillRect(barX, barY, fillW, barH);

      // Warning exclamation icon when terrified
      if (boy.fear >= 80) {
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('❗', boy.x + 18, barY + 5);
      }

      ctx.restore();
    }
  }

  // Draw Banana Peel Traps dropped by player boy
  public drawBananaTraps(ctx: CanvasRenderingContext2D, traps: BananaTrap[]) {
    for (const trap of traps) {
      ctx.save();
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 8;
      ctx.fillText('🍌', trap.x, trap.y);
      ctx.restore();
    }
  }

  // Draw glowing Golden Keys needed to unlock the escape gate
  public drawKeys(ctx: CanvasRenderingContext2D, keys: KeyItem[]) {
    for (const key of keys) {
      if (key.collected) continue;
      ctx.save();
      const bobY = Math.sin(key.bobTimer * 5) * 6;
      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 16;
      ctx.fillText('🔑', key.x, key.y + bobY);

      // Sparkle halo
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(key.x, key.y + bobY, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Draw Heroine Hunter AI in Boy Survival Mode
  public drawHeroineHunter(
    ctx: CanvasRenderingContext2D,
    hunter: HeroineHunter
  ) {
    // 1. Draw Shockwave Telegraph Warning (expanding red ring) if charging
    if (hunter.telegraphTimer > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(hunter.x, hunter.y, hunter.telegraphRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 8]);
      ctx.stroke();

      ctx.font = 'bold 14px "Cairo", sans-serif';
      ctx.fillStyle = '#f87171';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ صدمة هيبة قادمة!', hunter.x, hunter.y - hunter.telegraphRadius - 8);
      ctx.restore();
    }

    // 2. Draw the Heroine herself
    this.drawHeroine(
      ctx,
      hunter.profile,
      hunter.x,
      hunter.y,
      hunter.facingAngle,
      hunter.stunTimer <= 0,
      hunter.walkCycle,
      hunter.telegraphTimer > 0,
      hunter.profile.intimidationRadius
    );

    // 3. Stunned / Slipped stars spinning above head
    if (hunter.stunTimer > 0) {
      ctx.save();
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💫 تزلجت وسقطت! 💫', hunter.x, hunter.y - 35);
      ctx.restore();
    }
  }

  // Draw the Player Boy with an identifying marker, customization, and magnet field
  public drawPlayerBoy(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facingAngle: number,
    walkCycle: number,
    isMoving: boolean,
    panicPercent: number,
    custom?: CharacterCustomization,
    magnetRadius = 0
  ) {
    ctx.save();

    // 0. Magnet Field Indicator (if magnet skill unlocked)
    if (magnetRadius > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(x, y, magnetRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 1. Player Identifying Ring & Arrow
    const auraCol = custom?.auraColor || '#38bdf8';
    ctx.strokeStyle = auraCol;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.stroke();

    // "أنت (You)" comic badge above head
    ctx.font = 'bold 12px "Cairo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = auraCol;
    ctx.shadowColor = auraCol;
    ctx.shadowBlur = 6;
    ctx.fillText('🔻 أنـت', x, y - 30);
    ctx.shadowBlur = 0;

    // Draw boy character with full customizations
    const playerEntity: BoyEntity = {
      id: 999,
      type: 'runner',
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 14,
      baseSpeed: 200,
      fear: panicPercent,
      isPanicking: panicPercent > 70,
      isEscaped: false,
      facingAngle,
      legCycle: walkCycle,
      sweatTimer: 0,
      shirtColor: custom?.shirtColor || '#0284c7',
      hairColor: custom?.hairColor || '#451a03',
      panicCryCooldown: 0,
      stumbleTimer: 0,
      name: 'أنت',
    };

    this.drawBoy(ctx, playerEntity, custom);
    ctx.restore();
  }
}

export const renderer = new GameRenderer();
