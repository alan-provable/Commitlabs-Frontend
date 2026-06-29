'use client'

import {
  EXPOSURE_ZONE_THRESHOLDS,
  getExposureLevel,
  type ExposureLevel,
} from '@/utils/exposure'
import styles from './VolatilityExposureMeter.module.css'
import { useReducedMotion } from '@/lib/a11y/useReducedMotion'

export interface VolatilityExposureMeterProps {
  /** Current exposure as a percentage (0–100). Clamped when rendering. */
  valuePercent?: number
  /** When true, shows an explicit insufficient-data state instead of a numeric reading. */
  insufficientData?: boolean
  /** Optional short description of what the exposure means. */
  description?: string
  /** Zone boundaries used for level labels and accessible annotations. */
  zoneThresholds?: typeof EXPOSURE_ZONE_THRESHOLDS
}

function clamp(value: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, value))
}

export default function VolatilityExposureMeter({
  valuePercent = 0,
  insufficientData = false,
  description,
  zoneThresholds = EXPOSURE_ZONE_THRESHOLDS,
}: VolatilityExposureMeterProps) {
  const percent = clamp(valuePercent)
  const level = exposureLevel(percent)
  const ariaLabel = `Volatility exposure: ${percent}%, ${level} range.`
  const reducedMotion = useReducedMotion()

  return (
    <section
      className={styles.container}
      aria-labelledby="volatility-exposure-title"
      aria-describedby={
        description || insufficientData ? 'volatility-exposure-desc' : undefined
      }
    >
      <div className={styles.header}>
        <h2 id="volatility-exposure-title" className={styles.title}>
          Volatility Exposure
        </h2>
        <span className={styles.percentLabel}>
          {insufficientData ? '—' : `${Math.round(percent)}%`}
        </span>
      </div>

      <div
        className={styles.barTrack}
        role="meter"
        aria-valuenow={insufficientData ? undefined : percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
        aria-valuetext={valueText}
      >
        {!insufficientData && (
          <div
            className={styles.barMask}
            style={{ width: `${percent}%` }}
          >
            <div className={styles.barGradient} />
          </div>
        )}
      </div>

      <div className={styles.labelsRow}>
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>

      {insufficientData && (
        <p id="volatility-exposure-desc" className={styles.description}>
          Insufficient data — not enough value history or drawdown metrics to compute exposure.
        </p>
      )}

      {!insufficientData && description && (
        <p id="volatility-exposure-desc" className={styles.description}>
          {description}
        </p>
      )}
    </section>
  )
}
