import styles from "./NeonGlowOverlay.module.css";

/**
 * All paths are in the image's native pixel space (1105 × 683).
 * The SVG uses preserveAspectRatio="xMidYMid slice" which mirrors
 * objectFit: cover, so every outline stays locked to its object at
 * any viewport size / resolution.
 */

// Outer silhouette of the person + the stool they're sitting on.
// Clockwise from head top: head → right face/neck/shoulder/arm/lap
// → right stool leg → bottom → left stool leg → left lap/arm/shoulder → head.
const BODY_PATH =
  "M 552,147" +
  " C 566,145 595,156 610,174" +
  " C 622,190 624,212 622,232" +
  " C 620,252 614,268 603,282" +
  " C 597,294 588,304 578,310" +
  " C 596,309 635,310 667,320" +
  " C 688,328 708,346 708,374" +
  " C 708,402 694,446 668,486" +
  " C 650,515 632,535 618,552" +
  " C 622,562 624,574 622,582" +
  " C 610,586 598,587 596,587" +
  " C 596,612 597,648 598,683" +
  " L 506,683" +
  " C 507,648 508,612 508,587" +
  " C 505,587 493,586 481,582" +
  " C 479,574 481,562 486,552" +
  " C 472,535 454,515 436,486" +
  " C 410,446 396,402 396,374" +
  " C 396,346 416,328 437,320" +
  " C 469,310 508,309 526,310" +
  " C 516,304 507,294 501,282" +
  " C 490,268 484,252 482,232" +
  " C 480,212 482,190 494,174" +
  " C 509,156 538,145 552,147" +
  " Z";

// Far-left bar stool: seat top + left edge + right edge of seat + two legs.
// Open path: up left leg → across seat (3 sides) → down right leg.
const LEFT_STOOL_PATH =
  "M 77,683 L 75,395 L 57,395 L 57,367 L 183,367 L 183,395 L 164,395 L 166,683";

// Far-right bar stool: mirror of the left stool.
const RIGHT_STOOL_PATH =
  "M 938,683 L 937,395 L 923,395 L 923,367 L 1048,367 L 1048,395 L 1034,395 L 1036,683";

// Front edge of the long wooden table in the background.
const TABLE_PATH = "M 200,463 L 900,463";

export function NeonGlowOverlay(): React.ReactElement {
  return (
    <svg
      className={styles.overlay}
      viewBox="0 0 1105 683"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/*
          Three-layer neon tube model — all strokes are 1-2px wide;
          the glow comes entirely from blur spreading the colour outward.

          ambient : wide (σ=12) very faint spill into the air
          corona  : tight (σ=4)  bright ring just around the tube
          filament: σ=1   micro-smooth on the crisp 1px wire
        */}
        <filter id="neonAmbient" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="neonCorona" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="neonFilament" x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── BODY — spark A (forward, medium) ── */}
      <path className={styles.bodyA} d={BODY_PATH} fill="none"
        stroke="rgba(255,40,5,0.30)" strokeWidth="2" filter="url(#neonAmbient)" />
      <path className={styles.bodyA} d={BODY_PATH} fill="none"
        stroke="rgba(255,60,10,0.80)" strokeWidth="2" filter="url(#neonCorona)" />
      <path className={styles.bodyA} d={BODY_PATH} fill="none"
        stroke="rgba(255,200,160,1.00)" strokeWidth="1" filter="url(#neonFilament)" />

      {/* ── BODY — spark B (forward, faster, ~40% offset) ── */}
      <path className={styles.bodyB} d={BODY_PATH} fill="none"
        stroke="rgba(255,40,5,0.30)" strokeWidth="2" filter="url(#neonAmbient)" />
      <path className={styles.bodyB} d={BODY_PATH} fill="none"
        stroke="rgba(255,60,10,0.80)" strokeWidth="2" filter="url(#neonCorona)" />
      <path className={styles.bodyB} d={BODY_PATH} fill="none"
        stroke="rgba(255,200,160,1.00)" strokeWidth="1" filter="url(#neonFilament)" />

      {/* ── BODY — spark C (reverse, ~58% offset, counter-clockwise) ── */}
      <path className={styles.bodyC} d={BODY_PATH} fill="none"
        stroke="rgba(255,40,5,0.30)" strokeWidth="2" filter="url(#neonAmbient)" />
      <path className={styles.bodyC} d={BODY_PATH} fill="none"
        stroke="rgba(255,60,10,0.80)" strokeWidth="2" filter="url(#neonCorona)" />
      <path className={styles.bodyC} d={BODY_PATH} fill="none"
        stroke="rgba(255,200,160,1.00)" strokeWidth="1" filter="url(#neonFilament)" />

      {/* ── LEFT STOOL ── */}
      <path className={styles.stoolL} d={LEFT_STOOL_PATH} fill="none"
        stroke="rgba(255,40,5,0.30)" strokeWidth="2" filter="url(#neonAmbient)" />
      <path className={styles.stoolL} d={LEFT_STOOL_PATH} fill="none"
        stroke="rgba(255,60,10,0.80)" strokeWidth="2" filter="url(#neonCorona)" />
      <path className={styles.stoolL} d={LEFT_STOOL_PATH} fill="none"
        stroke="rgba(255,200,160,1.00)" strokeWidth="1" filter="url(#neonFilament)" />

      {/* ── RIGHT STOOL ── */}
      <path className={styles.stoolR} d={RIGHT_STOOL_PATH} fill="none"
        stroke="rgba(255,40,5,0.30)" strokeWidth="2" filter="url(#neonAmbient)" />
      <path className={styles.stoolR} d={RIGHT_STOOL_PATH} fill="none"
        stroke="rgba(255,60,10,0.80)" strokeWidth="2" filter="url(#neonCorona)" />
      <path className={styles.stoolR} d={RIGHT_STOOL_PATH} fill="none"
        stroke="rgba(255,200,160,1.00)" strokeWidth="1" filter="url(#neonFilament)" />

      {/* ── TABLE FRONT EDGE ── */}
      <path className={styles.tableE} d={TABLE_PATH} fill="none"
        stroke="rgba(255,40,5,0.30)" strokeWidth="2" filter="url(#neonAmbient)" />
      <path className={styles.tableE} d={TABLE_PATH} fill="none"
        stroke="rgba(255,60,10,0.80)" strokeWidth="2" filter="url(#neonCorona)" />
      <path className={styles.tableE} d={TABLE_PATH} fill="none"
        stroke="rgba(255,200,160,1.00)" strokeWidth="1" filter="url(#neonFilament)" />
    </svg>
  );
}
