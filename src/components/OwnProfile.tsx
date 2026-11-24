import type { ReactNode } from 'react'
import { Check, Clock, Pencil, X } from 'lucide-react'

type Status = 'pending' | 'approved' | 'rejected'

/** „Mein Profil“: zeigt das eigene Profil so, wie andere es sehen – mit Status und Bearbeiten-Button. */
export function OwnProfile({
  eyebrow,
  status,
  statusText,
  previewLabel,
  photo,
  children,
  onEdit,
  actions,
}: {
  eyebrow: string
  status: Status
  statusText: Record<Status, string>
  previewLabel: string
  photo: ReactNode
  children: ReactNode
  onEdit: () => void
  actions?: ReactNode
}) {
  const tone =
    status === 'approved' ? 'bg-forest/10 text-forest' : status === 'rejected' ? 'bg-coral/10 text-coral' : 'bg-sun/40'
  const Icon = status === 'approved' ? Check : status === 'rejected' ? X : Clock

  return (
    <div className="container-x py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">Mein Profil</h1>
        </div>
        <button type="button" onClick={onEdit} className="btn-primary">
          <Pencil size={16} /> Profil bearbeiten
        </button>
      </div>

      <p className={`mt-6 flex items-start gap-2 rounded-2xl px-4 py-3 text-sm ${tone}`}>
        <Icon size={16} className="mt-0.5 shrink-0" />
        {statusText[status]}
      </p>

      <p className="mt-8 text-xs uppercase tracking-wider text-ink/50">{previewLabel}</p>
      <div className="card mt-3 grid overflow-hidden md:grid-cols-[2fr_3fr]">
        {photo}
        <div className="p-6 sm:p-8">{children}</div>
      </div>

      {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
    </div>
  )
}
