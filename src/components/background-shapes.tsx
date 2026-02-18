"use client";

const shapes = [
  { type: "star", color: "var(--hermes-coral)", size: 60, top: "8%", left: "5%", delay: "0s" },
  { type: "circle", color: "var(--hermes-teal)", size: 45, top: "15%", right: "8%", delay: "3s" },
  { type: "diamond", color: "var(--hermes-gold)", size: 40, top: "45%", left: "3%", delay: "6s" },
  { type: "star", color: "var(--hermes-purple)", size: 35, top: "70%", right: "6%", delay: "9s" },
  { type: "circle", color: "var(--hermes-pink)", size: 50, bottom: "12%", left: "10%", delay: "4s" },
  { type: "diamond", color: "var(--hermes-orange)", size: 30, top: "30%", right: "3%", delay: "7s" },
] as const;

export function BackgroundShapes() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 1 }}>
      {/* Sparkle dot field */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--hermes-coral) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Floating shapes */}
      {shapes.map((shape, i) => {
        const { type, color, size, delay, ...pos } = shape;
        const className = `hermes-shape hermes-shape-${type}`;
        return (
          <div
            key={i}
            className={className}
            style={{
              width: size,
              height: size,
              background: color,
              animationDelay: delay,
              ...pos,
            }}
          />
        );
      })}
    </div>
  );
}
