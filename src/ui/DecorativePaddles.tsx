/**
 * Decorative SVG Paddles
 * Visual elements for the main menu
 */

export function LeftPaddle() {
  return (
    <svg
      width="180"
      height="360"
      viewBox="0 0 180 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-60"
    >
      <defs>
        <linearGradient id="leftGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff6ec4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#7873f5" stopOpacity="0.3" />
        </linearGradient>
        <filter id="leftGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feBlend in="SourceGraphic" in2="blur" />
        </filter>
      </defs>

      {/* Outer glow */}
      <rect
        x="8"
        y="20"
        rx="20"
        ry="20"
        width="164"
        height="320"
        fill="url(#leftGradient)"
        opacity="0.15"
      />

      {/* Main paddle body */}
      <rect
        x="12"
        y="24"
        rx="18"
        ry="18"
        width="156"
        height="312"
        fill="none"
        stroke="url(#leftGradient)"
        strokeWidth="2"
        filter="url(#leftGlow)"
      />

      {/* Inner details */}
      <g transform="translate(0, 60)">
        <rect
          x="28"
          y="0"
          rx="10"
          width="124"
          height="240"
          fill="#0b0b1a"
          opacity="0.4"
        />
        <rect
          x="36"
          y="8"
          rx="6"
          width="108"
          height="224"
          fill="url(#leftGradient)"
          opacity="0.08"
        />
      </g>
    </svg>
  );
}

export function RightPaddle() {
  return (
    <svg
      width="180"
      height="360"
      viewBox="0 0 180 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-60"
    >
      <defs>
        <linearGradient id="rightGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7873f5" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4facfe" stopOpacity="0.3" />
        </linearGradient>
        <filter id="rightGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feBlend in="SourceGraphic" in2="blur" />
        </filter>
      </defs>

      {/* Outer glow */}
      <rect
        x="8"
        y="20"
        rx="20"
        ry="20"
        width="164"
        height="320"
        fill="url(#rightGradient)"
        opacity="0.15"
      />

      {/* Main paddle body */}
      <rect
        x="12"
        y="24"
        rx="18"
        ry="18"
        width="156"
        height="312"
        fill="none"
        stroke="url(#rightGradient)"
        strokeWidth="2"
        filter="url(#rightGlow)"
      />

      {/* Inner details */}
      <g transform="translate(0, 60)">
        <rect
          x="28"
          y="0"
          rx="10"
          width="124"
          height="240"
          fill="#0b0b1a"
          opacity="0.4"
        />
        <rect
          x="36"
          y="8"
          rx="6"
          width="108"
          height="224"
          fill="url(#rightGradient)"
          opacity="0.08"
        />
      </g>
    </svg>
  );
}
