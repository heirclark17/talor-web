import React, { useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, {
  Circle,
  Rect,
  Path,
  G,
  Defs,
  LinearGradient,
  Stop,
  Polygon,
  Ellipse,
  Line,
} from 'react-native-svg';
import { PatternType } from '../../constants/backgrounds';

interface PatternBackgroundProps {
  patternType: PatternType;
  colors: readonly string[];
  isDark: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Seeded random for consistent patterns
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
}

export function PatternBackground({ patternType, colors, isDark }: PatternBackgroundProps) {
  const patternElements = useMemo(() => {
    const random = seededRandom(patternType.charCodeAt(0) * 100 + (isDark ? 1 : 0));
    const baseColor = colors[0];
    const accentColor = colors[1] || colors[0];
    const highlightColor = colors[2] || colors[1] || colors[0];

    switch (patternType) {
      case 'hexagons':
        return renderHexagons(random, accentColor);
      case 'dots-grid':
        return renderDotsGrid(random, accentColor);
      case 'waves':
        return renderWaves(random, accentColor);
      case 'topographic':
        return renderTopographic(random, accentColor);
      case 'blobs':
        return renderBlobs(random, accentColor, highlightColor);
      case 'noise-grain':
        return renderNoiseGrain(random, accentColor);
      case 'circuit-board':
        return renderCircuitBoard(random, accentColor);
      case 'mesh-gradient':
        return renderMeshGradient(random, colors);
      case 'bokeh':
        return renderBokeh(random, accentColor, highlightColor);
      case 'crystals':
        return renderCrystals(random, accentColor, highlightColor);
      case 'marble':
        return renderMarble(random, accentColor, highlightColor);
      case 'water-ripples':
        return renderWaterRipples(random, accentColor);
      case 'fabric-weave':
        return renderFabricWeave(random, accentColor);
      case 'starfield':
        return renderStarfield(random, accentColor);
      case 'aurora-bands':
        return renderAuroraBands(random, colors);
      case 'leopard':
        return renderLeopard(random, accentColor, highlightColor);
      case 'cheetah':
        return renderCheetah(random, accentColor, highlightColor);
      case 'festive-pattern':
        return renderFestivePattern(random, accentColor, highlightColor);
      case 'hearts':
        return renderHearts(random, accentColor, highlightColor);
      case 'leaves':
        return renderLeaves(random, accentColor, highlightColor);
      case 'snowflakes':
        return renderSnowflakes(random, accentColor);
      case 'pumpkins':
        return renderPumpkins(random, accentColor, highlightColor);
      case 'fireworks':
        return renderFireworks(random, accentColor, highlightColor);
      case 'eggs':
        return renderEggs(random, accentColor, highlightColor);
      case 'pinatas':
        return renderPinatas(random, accentColor, highlightColor);
      case 'geometric-abstract':
        return renderGeometric(random, accentColor, highlightColor);
      case 'organic-flow':
        return renderOrganicFlow(random, accentColor, highlightColor);
      default:
        return null;
    }
  }, [patternType, colors, isDark]);

  return (
    <View style={styles.container}>
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={styles.svg}>
        <Defs>
          <LinearGradient id="bgGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors[0]} stopOpacity="1" />
            <Stop offset="1" stopColor={colors[1] || colors[0]} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="url(#bgGradient)" />
        {patternElements}
      </Svg>
    </View>
  );
}

// Pattern rendering functions
function renderHexagons(random: () => number, color: string) {
  const hexSize = 40;
  const elements: React.ReactNode[] = [];
  const cols = Math.ceil(SCREEN_WIDTH / (hexSize * 1.5)) + 2;
  const rows = Math.ceil(SCREEN_HEIGHT / (hexSize * 1.732)) + 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * hexSize * 1.5;
      const y = row * hexSize * 1.732 + (col % 2 === 0 ? 0 : hexSize * 0.866);
      const opacity = 0.1 + random() * 0.15;

      const points = Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        return `${x + hexSize * 0.4 * Math.cos(angle)},${y + hexSize * 0.4 * Math.sin(angle)}`;
      }).join(' ');

      elements.push(
        <Polygon
          key={`hex-${row}-${col}`}
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={opacity}
        />
      );
    }
  }
  return <G>{elements}</G>;
}

function renderDotsGrid(random: () => number, color: string) {
  const spacing = 24;
  const elements: React.ReactNode[] = [];
  const cols = Math.ceil(SCREEN_WIDTH / spacing) + 1;
  const rows = Math.ceil(SCREEN_HEIGHT / spacing) + 1;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const opacity = 0.15 + random() * 0.2;
      const size = 1.5 + random() * 1.5;
      elements.push(
        <Circle
          key={`dot-${row}-${col}`}
          cx={col * spacing}
          cy={row * spacing}
          r={size}
          fill={color}
          opacity={opacity}
        />
      );
    }
  }
  return <G>{elements}</G>;
}

function renderWaves(random: () => number, color: string) {
  const elements: React.ReactNode[] = [];
  const waveCount = 12;
  const waveSpacing = SCREEN_HEIGHT / waveCount;

  for (let i = 0; i < waveCount; i++) {
    const y = i * waveSpacing;
    const amplitude = 15 + random() * 20;
    const frequency = 0.008 + random() * 0.004;
    const phase = random() * Math.PI * 2;

    let path = `M 0 ${y}`;
    for (let x = 0; x <= SCREEN_WIDTH; x += 5) {
      const yOffset = Math.sin(x * frequency + phase) * amplitude;
      path += ` L ${x} ${y + yOffset}`;
    }

    elements.push(
      <Path
        key={`wave-${i}`}
        d={path}
        stroke={color}
        strokeWidth={1.5}
        fill="none"
        opacity={0.15 + random() * 0.15}
      />
    );
  }
  return <G>{elements}</G>;
}

function renderTopographic(random: () => number, color: string) {
  const elements: React.ReactNode[] = [];
  const lineCount = 20;

  for (let i = 0; i < lineCount; i++) {
    const centerX = SCREEN_WIDTH / 2 + (random() - 0.5) * 100;
    const centerY = SCREEN_HEIGHT / 2 + (random() - 0.5) * 200;
    const radius = 50 + i * 30;
    const points = 60;
    const wobble = 20 + random() * 30;

    let path = '';
    for (let p = 0; p <= points; p++) {
      const angle = (p / points) * Math.PI * 2;
      const r = radius + Math.sin(angle * 3 + random() * 2) * wobble;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      path += p === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    path += ' Z';

    elements.push(
      <Path
        key={`topo-${i}`}
        d={path}
        stroke={color}
        strokeWidth={1}
        fill="none"
        opacity={0.1 + random() * 0.15}
      />
    );
  }
  return <G>{elements}</G>;
}

function renderBlobs(random: () => number, color1: string, color2: string) {
  const elements: React.ReactNode[] = [];
  const blobCount = 8;

  for (let i = 0; i < blobCount; i++) {
    const cx = random() * SCREEN_WIDTH;
    const cy = random() * SCREEN_HEIGHT;
    const rx = 80 + random() * 120;
    const ry = 60 + random() * 100;
    const color = random() > 0.5 ? color1 : color2;

    elements.push(
      <Ellipse
        key={`blob-${i}`}
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={color}
        opacity={0.08 + random() * 0.1}
      />
    );
  }
  return <G>{elements}</G>;
}

function renderNoiseGrain(random: () => number, color: string) {
  const elements: React.ReactNode[] = [];
  const particleCount = 500;

  for (let i = 0; i < particleCount; i++) {
    const x = random() * SCREEN_WIDTH;
    const y = random() * SCREEN_HEIGHT;
    const size = 0.5 + random() * 1.5;
    const opacity = 0.03 + random() * 0.08;

    elements.push(
      <Circle key={`grain-${i}`} cx={x} cy={y} r={size} fill={color} opacity={opacity} />
    );
  }
  return <G>{elements}</G>;
}

function renderCircuitBoard(random: () => number, color: string) {
  const elements: React.ReactNode[] = [];
  const nodeCount = 30;
  const nodes: { x: number; y: number }[] = [];

  // Create nodes
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: random() * SCREEN_WIDTH,
      y: random() * SCREEN_HEIGHT,
    });
  }

  // Connect nodes
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const connections = 1 + Math.floor(random() * 2);

    for (let j = 0; j < connections; j++) {
      const targetIdx = Math.floor(random() * nodes.length);
      if (targetIdx !== i) {
        const target = nodes[targetIdx];
        // Create right-angle paths
        const midX = random() > 0.5 ? node.x : target.x;

        elements.push(
          <Path
            key={`circuit-${i}-${j}`}
            d={`M ${node.x} ${node.y} L ${midX} ${node.y} L ${midX} ${target.y} L ${target.x} ${target.y}`}
            stroke={color}
            strokeWidth={1}
            fill="none"
            opacity={0.15 + random() * 0.1}
          />
        );
      }
    }

    // Draw node
    elements.push(
      <Circle
        key={`node-${i}`}
        cx={node.x}
        cy={node.y}
        r={3}
        fill={color}
        opacity={0.25 + random() * 0.15}
      />
    );
  }
  return <G>{elements}</G>;
}

function renderMeshGradient(random: () => number, colors: readonly string[]) {
  const elements: React.ReactNode[] = [];
  const blobCount = 6;

  for (let i = 0; i < blobCount; i++) {
    const cx = random() * SCREEN_WIDTH;
    const cy = random() * SCREEN_HEIGHT;
    const r = 150 + random() * 200;
    const color = colors[i % colors.length];

    elements.push(
      <Circle key={`mesh-${i}`} cx={cx} cy={cy} r={r} fill={color} opacity={0.2 + random() * 0.15} />
    );
  }
  return <G>{elements}</G>;
}

function renderBokeh(random: () => number, color1: string, color2: string) {
  const elements: React.ReactNode[] = [];
  const circleCount = 25;

  for (let i = 0; i < circleCount; i++) {
    const cx = random() * SCREEN_WIDTH;
    const cy = random() * SCREEN_HEIGHT;
    const r = 20 + random() * 60;
    const color = random() > 0.5 ? color1 : color2;

    elements.push(
      <Circle
        key={`bokeh-${i}`}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={1}
        opacity={0.1 + random() * 0.15}
      />
    );
  }
  return <G>{elements}</G>;
}

function renderCrystals(random: () => number, color1: string, color2: string) {
  const elements: React.ReactNode[] = [];
  const crystalCount = 15;

  for (let i = 0; i < crystalCount; i++) {
    const cx = random() * SCREEN_WIDTH;
    const cy = random() * SCREEN_HEIGHT;
    const size = 40 + random() * 80;
    const sides = 4 + Math.floor(random() * 3);
    const rotation = random() * Math.PI;
    const color = random() > 0.5 ? color1 : color2;

    const points = Array.from({ length: sides }, (_, j) => {
      const angle = (j / sides) * Math.PI * 2 + rotation;
      const r = size * (0.5 + random() * 0.5);
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');

    elements.push(
      <Polygon
        key={`crystal-${i}`}
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1}
        opacity={0.15 + random() * 0.1}
      />
    );
  }
  return <G>{elements}</G>;
}

function renderMarble(random: () => number, color1: string, color2: string) {
  const elements: React.ReactNode[] = [];
  const veinCount = 15;

  for (let i = 0; i < veinCount; i++) {
    const startX = random() * SCREEN_WIDTH;
    const startY = random() * SCREEN_HEIGHT;
    const color = random() > 0.5 ? color1 : color2;

    let path = `M ${startX} ${startY}`;
    let x = startX;
    let y = startY;

    for (let j = 0; j < 8; j++) {
      x += (random() - 0.5) * 150;
      y += random() * 100;
      path += ` Q ${x + (random() - 0.5) * 50} ${y - 25} ${x} ${y}`;
    }

    elements.push(
      <Path
        key={`marble-${i}`}
        d={path}
        stroke={color}
        strokeWidth={0.5 + random() * 1.5}
        fill="none"
        opacity={0.08 + random() * 0.12}
      />
    );
  }
  return <G>{elements}</G>;
}

function renderWaterRipples(random: () => number, color: string) {
  const elements: React.ReactNode[] = [];
  const rippleGroups = 5;

  for (let g = 0; g < rippleGroups; g++) {
    const cx = random() * SCREEN_WIDTH;
    const cy = random() * SCREEN_HEIGHT;
    const rippleCount = 4 + Math.floor(random() * 4);

    for (let i = 0; i < rippleCount; i++) {
      const r = 30 + i * 25;
      elements.push(
        <Circle
          key={`ripple-${g}-${i}`}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={0.15 - i * 0.02}
        />
      );
    }
  }
  return <G>{elements}</G>;
}

function renderFabricWeave(random: () => number, color: string) {
  const elements: React.ReactNode[] = [];
  const spacing = 16;
  const cols = Math.ceil(SCREEN_WIDTH / spacing) + 1;
  const rows = Math.ceil(SCREEN_HEIGHT / spacing) + 1;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * spacing;
      const y = row * spacing;
      const isHorizontal = (row + col) % 2 === 0;

      if (isHorizontal) {
        elements.push(
          <Line
            key={`weave-h-${row}-${col}`}
            x1={x - spacing / 2}
            y1={y}
            x2={x + spacing / 2}
            y2={y}
            stroke={color}
            strokeWidth={2}
            opacity={0.1 + random() * 0.1}
          />
        );
      } else {
        elements.push(
          <Line
            key={`weave-v-${row}-${col}`}
            x1={x}
            y1={y - spacing / 2}
            x2={x}
            y2={y + spacing / 2}
            stroke={color}
            strokeWidth={2}
            opacity={0.1 + random() * 0.1}
          />
        );
      }
    }
  }
  return <G>{elements}</G>;
}

function renderStarfield(random: () => number, color: string) {
  const elements: React.ReactNode[] = [];
  const starCount = 150;

  for (let i = 0; i < starCount; i++) {
    const x = random() * SCREEN_WIDTH;
    const y = random() * SCREEN_HEIGHT;
    const size = 0.5 + random() * 2;
    const opacity = 0.3 + random() * 0.7;

    elements.push(
      <Circle key={`star-${i}`} cx={x} cy={y} r={size} fill={color} opacity={opacity} />
    );
  }
  return <G>{elements}</G>;
}

function renderAuroraBands(random: () => number, colors: readonly string[]) {
  const elements: React.ReactNode[] = [];
  const bandCount = 5;

  for (let i = 0; i < bandCount; i++) {
    const y = (SCREEN_HEIGHT / bandCount) * i;
    const height = SCREEN_HEIGHT / bandCount + 50;
    const color = colors[i % colors.length];

    let path = `M 0 ${y}`;
    for (let x = 0; x <= SCREEN_WIDTH; x += 10) {
      const yOffset = Math.sin(x * 0.01 + i) * 30;
      path += ` L ${x} ${y + yOffset}`;
    }
    path += ` L ${SCREEN_WIDTH} ${y + height}`;
    for (let x = SCREEN_WIDTH; x >= 0; x -= 10) {
      const yOffset = Math.sin(x * 0.01 + i + 1) * 30;
      path += ` L ${x} ${y + height + yOffset}`;
    }
    path += ' Z';

    elements.push(<Path key={`aurora-${i}`} d={path} fill={color} opacity={0.15 + random() * 0.1} />);
  }
  return <G>{elements}</G>;
}

function renderLeopard(random: () => number, color1: string, color2: string) {
  const elements: React.ReactNode[] = [];
  const spotCount = 40;

  for (let i = 0; i < spotCount; i++) {
    const cx = random() * SCREEN_WIDTH;
    const cy = random() * SCREEN_HEIGHT;
    const rx = 12 + random() * 20;
    const ry = 8 + random() * 15;
    const rotation = random() * 180;

    // Outer ring
    elements.push(
      <Ellipse
        key={`leopard-outer-${i}`}
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={color2}
        strokeWidth={3}
        opacity={0.6}
        transform={`rotate(${rotation} ${cx} ${cy})`}
      />
    );

    // Inner spots
    for (let j = 0; j < 3; j++) {
      const angle = random() * Math.PI * 2;
      const dist = 5 + random() * 8;
      elements.push(
        <Circle
          key={`leopard-inner-${i}-${j}`}
          cx={cx + Math.cos(angle) * dist}
          cy={cy + Math.sin(angle) * dist}
          r={2 + random() * 3}
          fill={color2}
          opacity={0.5}
        />
      );
    }
  }
  return <G>{elements}</G>;
}

function renderCheetah(random: () => number, color1: string, color2: string) {
  const elements: React.ReactNode[] = [];
  const spotCount = 80;

  for (let i = 0; i < spotCount; i++) {
    const cx = random() * SCREEN_WIDTH;
    const cy = random() * SCREEN_HEIGHT;
    const r = 4 + random() * 8;

    elements.push(
      <Circle key={`cheetah-${i}`} cx={cx} cy={cy} r={r} fill={color2} opacity={0.5 + random() * 0.3} />
    );
  }
  return <G>{elements}</G>;
}

function renderFestivePattern(random: () => number, color1: string, color2: string) {
  const elements: React.ReactNode[] = [];
  const itemCount = 30;

  for (let i = 0; i < itemCount; i++) {
    const x = random() * SCREEN_WIDTH;
    const y = random() * SCREEN_HEIGHT;
    const size = 15 + random() * 25;
    const color = random() > 0.5 ? color1 : color2;

    // Simple star shape
    const points = Array.from({ length: 10 }, (_, j) => {
      const angle = (j / 10) * Math.PI * 2 - Math.PI / 2;
      const r = j % 2 === 0 ? size : size * 0.5;
      return `${x + r * Math.cos(angle)},${y + r * Math.sin(angle)}`;
    }).join(' ');

    elements.push(
      <Polygon key={`festive-${i}`} points={points} fill={color} opacity={0.25 + random() * 0.15} />
    );
  }
  return <G>{elements}</G>;
}

function renderHearts(random: () => number, color1: string, color2: string) {
  const elements: React.ReactNode[] = [];
  const heartCount = 25;

  for (let i = 0; i < heartCount; i++) {
    const x = random() * SCREEN_WIDTH;
    const y = random() * SCREEN_HEIGHT;
    const size = 15 + random() * 25;
    const color = random() > 0.5 ? color1 : color2;

    // Heart path
    const path = `M ${x} ${y + size * 0.3}
      C ${x} ${y - size * 0.3} ${x - size * 0.5} ${y - size * 0.3} ${x - size * 0.5} ${y}
      C ${x - size * 0.5} ${y + size * 0.4} ${x} ${y + size * 0.6} ${x} ${y + size * 0.8}
      C ${x} ${y + size * 0.6} ${x + size * 0.5} ${y + size * 0.4} ${x + size * 0.5} ${y}
      C ${x + size * 0.5} ${y - size * 0.3} ${x} ${y - size * 0.3} ${x} ${y + size * 0.3}`;

    elements.push(
      <Path key={`heart-${i}`} d={path} fill={color} opacity={0.2 + random() * 0.15} />
    );
  }
  return <G>{elements}</G>;
}

function renderLeaves(random: () => number, color1: string, color2: string) {
  const elements: React.ReactNode[] = [];
  const leafCount = 30;

  for (let i = 0; i < leafCount; i++) {
    const x = random() * SCREEN_WIDTH;
    const y = random() * SCREEN_HEIGHT;
    const size = 20 + random() * 40;
    const rotation = random() * 360;
    const color = random() > 0.5 ? color1 : color2;

    // Leaf shape
    const path = `M ${x} ${y}
      Q ${x + size * 0.3} ${y - size * 0.4} ${x} ${y - size}
      Q ${x - size * 0.3} ${y - size * 0.4} ${x} ${y}`;

    elements.push(
      <Path
        key={`leaf-${i}`}
        d={path}
        fill={color}
        opacity={0.25 + random() * 0.15}
        transform={`rotate(${rotation} ${x} ${y})`}
      />
    );
  }
  return <G>{elements}</G>;
}

function renderSnowflakes(random: () => number, color: string) {
  const elements: React.ReactNode[] = [];
  const flakeCount = 60;

  for (let i = 0; i < flakeCount; i++) {
    const cx = random() * SCREEN_WIDTH;
    const cy = random() * SCREEN_HEIGHT;
    const size = 4 + random() * 12;

    // Simple 6-point star
    for (let j = 0; j < 6; j++) {
      const angle = (j / 6) * Math.PI * 2;
      elements.push(
        <Line
          key={`snow-${i}-${j}`}
          x1={cx}
          y1={cy}
          x2={cx + Math.cos(angle) * size}
          y2={cy + Math.sin(angle) * size}
          stroke={color}
          strokeWidth={1}
          opacity={0.4 + random() * 0.4}
        />
      );
    }
  }
  return <G>{elements}</G>;
}

function renderPumpkins(random: () => number, color1: string, color2: string) {
  const elements: React.ReactNode[] = [];
  const pumpkinCount = 20;

  for (let i = 0; i < pumpkinCount; i++) {
    const cx = random() * SCREEN_WIDTH;
    const cy = random() * SCREEN_HEIGHT;
    const size = 20 + random() * 40;

    // Pumpkin body (oval)
    elements.push(
      <Ellipse
        key={`pumpkin-${i}`}
        cx={cx}
        cy={cy}
        rx={size}
        ry={size * 0.8}
        fill={color1}
        opacity={0.3 + random() * 0.2}
      />
    );

    // Stem
    elements.push(
      <Rect
        key={`stem-${i}`}
        x={cx - 3}
        y={cy - size * 0.8 - 10}
        width={6}
        height={12}
        fill={color2}
        opacity={0.4}
      />
    );
  }
  return <G>{elements}</G>;
}

function renderFireworks(random: () => number, color1: string, color2: string) {
  const elements: React.ReactNode[] = [];
  const burstCount = 8;

  for (let i = 0; i < burstCount; i++) {
    const cx = random() * SCREEN_WIDTH;
    const cy = random() * SCREEN_HEIGHT;
    const rays = 8 + Math.floor(random() * 8);
    const size = 40 + random() * 80;
    const color = random() > 0.5 ? color1 : color2;

    for (let j = 0; j < rays; j++) {
      const angle = (j / rays) * Math.PI * 2;
      const len = size * (0.5 + random() * 0.5);

      elements.push(
        <Line
          key={`firework-${i}-${j}`}
          x1={cx}
          y1={cy}
          x2={cx + Math.cos(angle) * len}
          y2={cy + Math.sin(angle) * len}
          stroke={color}
          strokeWidth={2}
          opacity={0.3 + random() * 0.3}
        />
      );

      // Sparkle at end
      elements.push(
        <Circle
          key={`sparkle-${i}-${j}`}
          cx={cx + Math.cos(angle) * len}
          cy={cy + Math.sin(angle) * len}
          r={2 + random() * 3}
          fill={color}
          opacity={0.5 + random() * 0.3}
        />
      );
    }
  }
  return <G>{elements}</G>;
}

function renderEggs(random: () => number, color1: string, color2: string) {
  const elements: React.ReactNode[] = [];
  const eggCount = 25;

  for (let i = 0; i < eggCount; i++) {
    const cx = random() * SCREEN_WIDTH;
    const cy = random() * SCREEN_HEIGHT;
    const size = 15 + random() * 25;
    const color = random() > 0.5 ? color1 : color2;

    // Egg shape (taller ellipse)
    elements.push(
      <Ellipse
        key={`egg-${i}`}
        cx={cx}
        cy={cy}
        rx={size * 0.6}
        ry={size}
        fill={color}
        opacity={0.2 + random() * 0.2}
      />
    );
  }
  return <G>{elements}</G>;
}

function renderPinatas(random: () => number, color1: string, color2: string) {
  const elements: React.ReactNode[] = [];
  const count = 20;

  for (let i = 0; i < count; i++) {
    const x = random() * SCREEN_WIDTH;
    const y = random() * SCREEN_HEIGHT;
    const size = 20 + random() * 30;
    const color = random() > 0.5 ? color1 : color2;

    // Simplified star/donkey shape
    const points = Array.from({ length: 5 }, (_, j) => {
      const angle = (j / 5) * Math.PI * 2 - Math.PI / 2;
      const r = j % 2 === 0 ? size : size * 0.5;
      return `${x + r * Math.cos(angle)},${y + r * Math.sin(angle)}`;
    }).join(' ');

    elements.push(
      <Polygon key={`pinata-${i}`} points={points} fill={color} opacity={0.25 + random() * 0.15} />
    );
  }
  return <G>{elements}</G>;
}

function renderGeometric(random: () => number, color1: string, color2: string) {
  const elements: React.ReactNode[] = [];
  const shapeCount = 20;

  for (let i = 0; i < shapeCount; i++) {
    const x = random() * SCREEN_WIDTH;
    const y = random() * SCREEN_HEIGHT;
    const size = 30 + random() * 60;
    const rotation = random() * 360;
    const color = random() > 0.5 ? color1 : color2;
    const shapeType = Math.floor(random() * 3);

    if (shapeType === 0) {
      // Triangle
      const points = `${x},${y - size / 2} ${x - size / 2},${y + size / 2} ${x + size / 2},${y + size / 2}`;
      elements.push(
        <Polygon
          key={`geo-${i}`}
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.2 + random() * 0.15}
          transform={`rotate(${rotation} ${x} ${y})`}
        />
      );
    } else if (shapeType === 1) {
      // Square
      elements.push(
        <Rect
          key={`geo-${i}`}
          x={x - size / 2}
          y={y - size / 2}
          width={size}
          height={size}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.2 + random() * 0.15}
          transform={`rotate(${rotation} ${x} ${y})`}
        />
      );
    } else {
      // Circle
      elements.push(
        <Circle
          key={`geo-${i}`}
          cx={x}
          cy={y}
          r={size / 2}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.2 + random() * 0.15}
        />
      );
    }
  }
  return <G>{elements}</G>;
}

function renderOrganicFlow(random: () => number, color1: string, color2: string) {
  const elements: React.ReactNode[] = [];
  const flowCount = 6;

  for (let i = 0; i < flowCount; i++) {
    const startX = random() * SCREEN_WIDTH;
    const startY = random() * SCREEN_HEIGHT;
    const color = random() > 0.5 ? color1 : color2;

    let path = `M ${startX} ${startY}`;
    let x = startX;
    let y = startY;

    for (let j = 0; j < 5; j++) {
      const cx1 = x + (random() - 0.5) * 200;
      const cy1 = y + random() * 150;
      const cx2 = x + (random() - 0.5) * 200;
      const cy2 = y + random() * 150 + 75;
      x = x + (random() - 0.5) * 150;
      y = y + random() * 200 + 50;
      path += ` C ${cx1} ${cy1} ${cx2} ${cy2} ${x} ${y}`;
    }

    elements.push(
      <Path
        key={`flow-${i}`}
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={40 + random() * 60}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.08 + random() * 0.08}
      />
    );
  }
  return <G>{elements}</G>;
}

export default PatternBackground;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
