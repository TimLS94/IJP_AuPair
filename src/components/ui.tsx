import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, X } from 'lucide-react'
import type { Fit } from '../lib/matching'

export function Img({ src, alt, className = '' }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div role="img" aria-label={alt} className={`bg-gradient-to-br from-sand via-sun/40 to-coral/40 ${className}`} />
    )
  }

  return (
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />
  )
}

export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}

export function MatchBadge() {
  return <span className="rounded-full bg-coral px-3 py-1 text-xs font-medium text-white">Match</span>
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={`chip ${active ? 'chip-active' : ''}`}>
      {children}
    </button>
  )
}

export function ScoreBadge({ percent }: { percent: number }) {
  const tone = percent >= 80 ? 'bg-forest text-cream' : percent >= 50 ? 'bg-sun text-ink' : 'bg-white/90 text-ink/70'
  return <span className={`rounded-full px-3 py-1 text-xs font-medium backdrop-blur ${tone}`}>{percent} % passend</span>
}

export function FitList({ fit, title }: { fit: Fit; title: string }) {
  return (
    <div className="mt-6 rounded-2xl bg-white p-4">
      <p className="label flex items-center justify-between">
        <span>{title}</span>
        <span className="text-ink">{fit.percent} %</span>
      </p>
      <ul className="mt-2 space-y-1.5 text-sm">
        {fit.items.map((i) => (
          <li key={i.label} className="flex items-start gap-2">
            {i.ok ? (
              <Check size={15} className="mt-0.5 shrink-0 text-forest" />
            ) : (
              <X size={15} className="mt-0.5 shrink-0 text-coral" />
            )}
            <span className={i.ok ? '' : 'text-ink/60'}>{i.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
