import type React from 'react';

interface Props extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  variant?: 'emblem' | 'full';
  animated?: boolean;
}

export const CaretoLogo: React.FC<Props> = ({
  size = 32,
  variant = 'emblem',
  animated = true,
  className,
  style,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="80 80 380 320"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', ...style }}
      {...props}
    >
      <defs>
        {/* Dark glassmorphic background gradient */}
        <radialGradient id="caretoBgGlow" cx="50%" cy="46%" r="58%">
          <stop offset="0%" stopColor="#0b1e36" stopOpacity="1" />
          <stop offset="65%" stopColor="#040b14" stopOpacity="1" />
          <stop offset="100%" stopColor="#010408" stopOpacity="1" />
        </radialGradient>

        {/* Electric ice-blue linear gradient for hero car body & loop */}
        <linearGradient id="cyanStreak" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="35%" stopColor="#7dd3fc" />
          <stop offset="85%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        {/* Deep luminous metallic gradient */}
        <linearGradient id="bodyAccent" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>

        {/* Periodic Linear Shimmer / Sweep Gradient */}
        <linearGradient id="periodicSweep" x1="-100%" y1="-100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="38%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="47%" stopColor="#bae6fd" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="53%" stopColor="#7dd3fc" stopOpacity="0.5" />
          <stop offset="62%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          {animated && (
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              values="-1.6 -1.6; 1.6 1.6; 1.6 1.6"
              keyTimes="0; 0.45; 1"
              dur="4.5s"
              repeatCount="indefinite"
            />
          )}
        </linearGradient>

        {/* Subtle ambient glow filter */}
        <filter id="iceGlow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Intense star spark bloom filter */}
        <filter id="sparkleBloom" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="bloom" />
          <feMerge>
            <feMergeNode in="bloom" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Clip mask to confine periodic shine precisely to the car & C-loop elements */}
        <mask id="logoEmblemMask">
          <rect width="512" height="512" fill="#000000" />
          <g fill="#ffffff" stroke="#ffffff">
            <path
              d="M 330 118 C 300 102 265 96 230 98 C 155 104 96 165 96 240 C 96 318 158 382 236 382 C 285 382 328 358 352 322"
              fill="none"
              strokeWidth="26"
              strokeLinecap="round"
            />
            <path
              d="M 338 108 L 382 132 L 358 152"
              fill="none"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 160 252 C 176 218 206 186 244 178 C 278 170 326 174 372 222 L 396 248 L 378 252 C 340 232 300 220 252 222 C 214 224 186 238 160 252 Z"
              fill="#ffffff"
              stroke="none"
            />
            <path
              d="M 144 264 C 180 256 220 254 264 254 C 316 254 366 260 404 274 C 414 277 420 285 418 293 C 415 301 405 306 392 305 C 356 302 322 298 280 298 C 232 298 190 304 152 312 C 142 314 134 308 132 299 C 130 290 135 282 144 264 Z"
              fill="#ffffff"
              stroke="none"
            />
            <circle cx="348" cy="304" r="28" fill="#ffffff" />
            <circle cx="196" cy="304" r="28" fill="#ffffff" />
          </g>
        </mask>
      </defs>

      {animated && (
        <style>{`
          @keyframes caretoAmbientHaloPulse {
            0%, 100% {
              opacity: 0.12;
              transform: scale(0.96);
              transform-origin: 256px 225px;
            }
            50% {
              opacity: 0.28;
              transform: scale(1.08);
              transform-origin: 256px 225px;
            }
          }
          @keyframes caretoLaserPulse {
            0%, 100% {
              opacity: 0.7;
              filter: drop-shadow(0 0 2px #7dd3fc);
            }
            35%, 55% {
              opacity: 1;
              filter: drop-shadow(0 0 10px #bae6fd);
            }
          }
          @keyframes caretoArrowGlintFlash {
            0%, 38% {
              opacity: 0;
              transform: scale(0.2) rotate(0deg);
              transform-origin: 358px 126px;
            }
            45% {
              opacity: 1;
              transform: scale(1.25) rotate(45deg);
              transform-origin: 358px 126px;
            }
            52% {
              opacity: 0.3;
              transform: scale(0.7) rotate(90deg);
              transform-origin: 358px 126px;
            }
            56%, 100% {
              opacity: 0;
              transform: scale(0) rotate(90deg);
              transform-origin: 358px 126px;
            }
          }
          @keyframes caretoNoseGlintFlash {
            0%, 46% {
              opacity: 0;
              transform: scale(0.2) rotate(0deg);
              transform-origin: 418px 276px;
            }
            53% {
              opacity: 1;
              transform: scale(1.3) rotate(45deg);
              transform-origin: 418px 276px;
            }
            60% {
              opacity: 0.2;
              transform: scale(0.6) rotate(90deg);
              transform-origin: 418px 276px;
            }
            64%, 100% {
              opacity: 0;
              transform: scale(0) rotate(90deg);
              transform-origin: 418px 276px;
            }
          }
          @keyframes caretoWheelHubGlow {
            0%, 100% {
              fill: #7dd3fc;
              r: 10px;
              opacity: 0.85;
            }
            48% {
              fill: #e0f2fe;
              r: 12px;
              opacity: 1;
            }
          }
          .careto-ambient-halo {
            animation: caretoAmbientHaloPulse 4.5s ease-in-out infinite;
          }
          .careto-headlight-beam {
            animation: caretoLaserPulse 4.5s ease-in-out infinite;
          }
          .careto-glint-arrow {
            animation: caretoArrowGlintFlash 4.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          }
          .careto-glint-nose {
            animation: caretoNoseGlintFlash 4.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          }
          .careto-wheel-core {
            animation: caretoWheelHubGlow 4.5s ease-in-out infinite;
          }
        `}</style>
      )}

      {/* App Icon / Canvas Container removed to have transparent background */}

      {/* Ambient Backdrop Halo for Depth */}
      <circle
        cx="256"
        cy="225"
        r="135"
        fill="#7dd3fc"
        filter="url(#iceGlow)"
        className={animated ? 'careto-ambient-halo' : undefined}
        opacity={animated ? undefined : 0.2}
      />

      {/* Outer Iconic Enclosure: Fluid, Aerodynamic 'C' Shape for CARETO */}
      <path
        d="M 330 118 C 300 102 265 96 230 98 C 155 104 96 165 96 240 C 96 318 158 382 236 382 C 285 382 328 358 352 322"
        fill="none"
        stroke="url(#cyanStreak)"
        strokeWidth="20"
        strokeLinecap="round"
        filter="url(#iceGlow)"
      />

      {/* Dynamic Speed Cut / Intake Chevron on upper right */}
      <path
        d="M 338 108 L 382 132 L 358 152"
        fill="none"
        stroke="#e0f2fe"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Streamlined High-Tech Fastback Car Silhouette */}
      <g id="carEmblem">
        {/* Main Coupe Roofline & Aerodynamic Cabin */}
        <path
          d="M 160 252 C 176 218 206 186 244 178 C 278 170 326 174 372 222 L 396 248 L 378 252 C 340 232 300 220 252 222 C 214 224 186 238 160 252 Z"
          fill="url(#bodyAccent)"
        />
        {/* Cockpit Windshield & Glass Area */}
        <path
          d="M 218 228 C 234 204 258 196 288 194 C 320 194 346 208 366 226 L 348 232 C 324 220 298 214 268 216 C 246 218 230 224 218 228 Z"
          fill="#061220"
        />
        {/* Sleek Continuous Beltline & Shoulder Wing */}
        <path
          d="M 144 264 C 180 256 220 254 264 254 C 316 254 366 260 404 274 C 414 277 420 285 418 293 C 415 301 405 306 392 305 C 356 302 322 298 280 298 C 232 298 190 304 152 312 C 142 314 134 308 132 299 C 130 290 135 282 144 264 Z"
          fill="#ffffff"
          filter="url(#sparkleBloom)"
        />
        {/* Wheels */}
        <circle cx="348" cy="304" r="28" fill="#040a12" stroke="#7dd3fc" strokeWidth="9" />
        <circle
          cx="348"
          cy="304"
          r="10"
          fill="#bae6fd"
          className={animated ? 'careto-wheel-core' : undefined}
        />
        <circle cx="196" cy="304" r="28" fill="#040a12" stroke="#7dd3fc" strokeWidth="9" />
        <circle
          cx="196"
          cy="304"
          r="10"
          fill="#bae6fd"
          className={animated ? 'careto-wheel-core' : undefined}
        />
        {/* Headlight Laser Blade */}
        <g className={animated ? 'careto-headlight-beam' : undefined}>
          <polygon
            points="404,272 432,274 416,282 396,280"
            fill="#7dd3fc"
            filter="url(#sparkleBloom)"
          />
          <line
            x1="416"
            y1="274"
            x2="446"
            y2="276"
            stroke="#e0f2fe"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      </g>

      {/* PERIODIC LIGHT SWEEP OVERLAY */}
      <rect
        x="0"
        y="0"
        width="512"
        height="512"
        fill="url(#periodicSweep)"
        mask="url(#logoEmblemMask)"
        pointerEvents="none"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* SYNCHRONIZED SPARKLES */}
      <g
        className={animated ? 'careto-glint-arrow' : undefined}
        filter="url(#sparkleBloom)"
        opacity={animated ? undefined : 0.8}
      >
        <path
          d="M 358 126 Q 358 114 358 108 Q 358 114 358 126 Q 370 126 376 126 Q 370 126 358 126 Q 358 138 358 144 Q 358 138 358 126 Q 346 126 340 126 Q 346 126 358 126 Z"
          fill="#ffffff"
        />
        <line
          x1="358"
          y1="108"
          x2="358"
          y2="144"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="340"
          y1="126"
          x2="376"
          y2="126"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="358" cy="126" r="4.5" fill="#7dd3fc" />
      </g>
      <g
        className={animated ? 'careto-glint-nose' : undefined}
        filter="url(#sparkleBloom)"
        opacity={animated ? undefined : 0.8}
      >
        <path
          d="M 418 276 Q 418 266 418 260 Q 418 266 418 276 Q 428 276 434 276 Q 428 276 418 276 Q 418 286 418 292 Q 418 286 418 276 Q 408 276 402 276 Q 408 276 418 276 Z"
          fill="#ffffff"
        />
        <circle cx="418" cy="276" r="4" fill="#bae6fd" />
      </g>
    </svg>
  );
};
