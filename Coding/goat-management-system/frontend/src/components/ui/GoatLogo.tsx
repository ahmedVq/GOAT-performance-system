/**
 * GOAT Martial Arts official badge logo — inline SVG recreation.
 * Circular badge: goat silhouette, camo bg, "GOAT MARTIAL ARTS" arc,
 * boxing gloves, martial arts belt, EGYPT · MMXXIV.
 */
import { CSSProperties } from 'react'

interface Props {
  size?: number
  className?: string
  glow?: boolean
  style?: CSSProperties
}

export function GoatLogo({ size = 60, className = '', glow = false, style }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 300 300"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style ?? (glow ? { filter: 'drop-shadow(0 0 10px rgba(225,25,25,0.5))' } : undefined)}
    >
      <defs>
        <pattern id="camo" x="0" y="0" width="52" height="52" patternUnits="userSpaceOnUse">
          <rect width="52" height="52" fill="#1a1a1a"/>
          <path d="M0 8 Q12 2 22 12 Q32 22 18 28 Q4 32 0 20Z" fill="#222"/>
          <path d="M28 0 Q46 6 50 18 Q54 32 40 36 Q26 38 25 26 Q24 14 28 0Z" fill="#181818"/>
          <path d="M8 36 Q22 30 32 42 Q42 52 28 54 Q14 58 6 48 Q0 40 8 36Z" fill="#202020"/>
          <path d="M46 40 Q56 38 54 50 Q52 62 44 56 Q36 50 46 40Z" fill="#252525"/>
          <path d="M0 0 Q6 4 8 10 Q10 16 4 16 Q-2 16 0 8Z" fill="#1e1e1e"/>
        </pattern>

        <clipPath id="badgeClip">
          <circle cx="150" cy="150" r="113"/>
        </clipPath>

        {/* Arc paths for text */}
        <path id="topArc300" d="M 28,150 A 122,122 0 0,1 272,150" fill="none"/>
      </defs>

      {/* ── Outer badge fill ── */}
      <circle cx="150" cy="150" r="149" fill="#0c0c0c"/>

      {/* ── Red outer ring ── */}
      <circle cx="150" cy="150" r="146" fill="none" stroke="#E11919" strokeWidth="8"/>
      <circle cx="150" cy="150" r="139" fill="none" stroke="#E11919" strokeWidth="1.5" opacity="0.35"/>

      {/* ── Dark text band ── */}
      <circle cx="150" cy="150" r="135" fill="#111111"/>

      {/* ── Inner red ring ── */}
      <circle cx="150" cy="150" r="118" fill="none" stroke="#E11919" strokeWidth="5"/>
      <circle cx="150" cy="150" r="114" fill="none" stroke="#E11919" strokeWidth="1" opacity="0.25"/>

      {/* ── Camo center ── */}
      <circle cx="150" cy="150" r="112" fill="url(#camo)"/>
      {/* Dark overlay for depth */}
      <circle cx="150" cy="150" r="112" fill="#000" opacity="0.28"/>

      {/* ══════════════════════════════════════════ */}
      {/* ── TOP TEXT: GOAT MARTIAL ARTS ── */}
      <text
        fontFamily="'Arial Black', 'Impact', 'Arial Bold', sans-serif"
        fontSize="15"
        fontWeight="900"
        fill="white"
        letterSpacing="2.5"
      >
        <textPath href="#topArc300" startOffset="50%" textAnchor="middle">
          GOAT MARTIAL ARTS
        </textPath>
      </text>

      {/* ══════════════════════════════════════════ */}
      {/* ── LEFT SIDE: red bar + boxing glove ── */}
      <rect x="24" y="143" width="26" height="4" fill="#E11919"/>
      <rect x="24" y="149" width="26" height="2" fill="#E11919" opacity="0.45"/>
      {/* Left glove */}
      <g transform="translate(36,135)">
        <ellipse cx="0" cy="0" rx="9.5" ry="7.5" fill="white"/>
        <path d="M 4,-4 Q 10,-8 13,-4 Q 14,0 8,2 Z" fill="white"/>
        <rect x="-9.5" y="5" width="19" height="6" rx="2" fill="white"/>
        <line x1="-9.5" y1="7" x2="9.5" y2="7" stroke="#ccc" strokeWidth="1" opacity="0.4"/>
      </g>

      {/* ── RIGHT SIDE: boxing glove + red bar ── */}
      <rect x="250" y="143" width="26" height="4" fill="#E11919"/>
      <rect x="250" y="149" width="26" height="2" fill="#E11919" opacity="0.45"/>
      {/* Right glove (mirrored) */}
      <g transform="translate(264,135) scale(-1,1)">
        <ellipse cx="0" cy="0" rx="9.5" ry="7.5" fill="white"/>
        <path d="M 4,-4 Q 10,-8 13,-4 Q 14,0 8,2 Z" fill="white"/>
        <rect x="-9.5" y="5" width="19" height="6" rx="2" fill="white"/>
        <line x1="-9.5" y1="7" x2="9.5" y2="7" stroke="#ccc" strokeWidth="1" opacity="0.4"/>
      </g>

      {/* ══════════════════════════════════════════ */}
      {/* ── GOAT SILHOUETTE (white, standing, facing right) ── */}
      <g transform="translate(150,148) scale(0.78)">

        {/* Body */}
        <ellipse cx="2" cy="-12" rx="50" ry="30" fill="white"/>

        {/* Rump (back curve) */}
        <path d="M -45,-22 Q -58,-16 -56,-4 Q -54,8 -44,8 Q -40,4 -42,-4 Q -44,-12 -38,-20 Z"
          fill="white"/>

        {/* Chest / shoulder bump */}
        <path d="M 48,-28 Q 58,-36 60,-28 Q 62,-18 54,-14 Q 46,-12 44,-20 Z" fill="white"/>

        {/* Neck */}
        <path d="M 38,-36 Q 48,-62 52,-78 Q 55,-88 50,-92 Q 44,-95 40,-84 Q 36,-70 26,-46 Z"
          fill="white"/>

        {/* Head */}
        <ellipse cx="50" cy="-90" rx="17" ry="14" fill="white"/>

        {/* Snout / muzzle */}
        <ellipse cx="63" cy="-86" rx="10" ry="8" fill="white"/>

        {/* Horn – long, swept back */}
        <path d="M 42,-100 Q 26,-118 22,-110 Q 18,-102 30,-94 Q 38,-90 42,-100 Z" fill="white"/>
        {/* Second horn partial */}
        <path d="M 48,-103 Q 36,-114 34,-108 Q 32,-104 40,-98 Z" fill="#e8e8e8"/>

        {/* Ear */}
        <ellipse cx="35" cy="-96" rx="6" ry="9" fill="white" transform="rotate(-15 35 -96)"/>

        {/* Eye (dark) */}
        <ellipse cx="58" cy="-90" rx="2.5" ry="2.5" fill="#1a1a1a"/>

        {/* Beard */}
        <path d="M 62,-78 Q 68,-64 64,-58 Q 60,-54 58,-60 Q 56,-68 60,-76 Z" fill="white"/>

        {/* Tail – upright short */}
        <path d="M -52,-6 Q -64,2 -60,12 Q -56,20 -48,14 Q -42,8 -48,-4 Z" fill="white"/>

        {/* Front legs */}
        <rect x="16" y="14" width="12" height="52" rx="6" fill="white"/>
        <rect x="32" y="12" width="12" height="50" rx="6" fill="white"/>
        {/* Front hooves */}
        <rect x="16" y="60" width="12" height="9" rx="3" fill="#ddd"/>
        <rect x="32" y="56" width="12" height="9" rx="3" fill="#ddd"/>

        {/* Back legs */}
        <rect x="-32" y="14" width="12" height="52" rx="6" fill="white"/>
        <rect x="-46" y="16" width="12" height="50" rx="6" fill="white"/>
        {/* Back hooves */}
        <rect x="-32" y="60" width="12" height="9" rx="3" fill="#ddd"/>
        <rect x="-46" y="60" width="12" height="9" rx="3" fill="#ddd"/>

        {/* Udder */}
        <ellipse cx="-8" cy="16" rx="10" ry="6" fill="#f5d0d0" opacity="0.75"/>
      </g>

      {/* ══════════════════════════════════════════ */}
      {/* ── MARTIAL ARTS BELT at bottom ── */}
      {/* Left belt tail */}
      <path d="M 58,232 Q 88,250 122,254 L 122,246 Q 90,242 62,224 Z" fill="white"/>
      {/* Right belt tail */}
      <path d="M 242,232 Q 212,250 178,254 L 178,246 Q 210,242 238,224 Z" fill="white"/>

      {/* Belt stripe left */}
      <path d="M 62,228 Q 90,246 124,249 L 124,246 Q 90,243 62,224 Z" fill="#ccc" opacity="0.35"/>
      {/* Belt stripe right */}
      <path d="M 238,228 Q 210,246 176,249 L 176,246 Q 210,243 238,224 Z" fill="#ccc" opacity="0.35"/>

      {/* Center knot */}
      <path d="M 120,244 Q 130,234 140,246 Q 145,254 136,258 Q 124,262 120,252 Z" fill="white"/>
      <path d="M 180,244 Q 170,234 160,246 Q 155,254 164,258 Q 176,262 180,252 Z" fill="white"/>
      {/* Knot center overlap */}
      <path d="M 132,248 Q 142,240 150,243 Q 158,246 168,238 Q 162,258 150,260 Q 138,258 132,248 Z"
        fill="white"/>
      {/* Knot shadow details */}
      <path d="M 138,249 Q 144,244 150,246 Q 156,248 162,243" fill="none" stroke="#bbb" strokeWidth="1.5" opacity="0.5"/>

      {/* ── EGYPT text ── */}
      <text x="88" y="218" fill="white" fontSize="11.5" fontFamily="Arial, sans-serif"
        fontStyle="italic" fontWeight="700" textAnchor="middle" letterSpacing="1.2">
        EGYPT
      </text>

      {/* ── MMXXIV text ── */}
      <text x="212" y="218" fill="white" fontSize="11.5" fontFamily="Arial, sans-serif"
        fontStyle="italic" fontWeight="700" textAnchor="middle" letterSpacing="1.2">
        MMXXIV
      </text>

      {/* ── Vignette overlay ── */}
      <defs>
        <radialGradient id="vig300" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="transparent"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0.45"/>
        </radialGradient>
      </defs>
      <circle cx="150" cy="150" r="149" fill="url(#vig300)"/>
    </svg>
  )
}
