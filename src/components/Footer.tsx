import { Link } from 'react-router-dom'
import { site } from '../data/site'

export default function Footer() {
  return (
    <footer className="border-t border-ink/5 bg-cream">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2">
          <p className="font-display text-2xl">
            IJP <span className="text-ink/50">Au-pair</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-ink/60">
            Wir bringen Familien und Au-pairs zusammen – persönlich begleitet und mit Sprachschule an der Seite.
          </p>
        </div>

        <div>
          <p className="label">Plattform</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/familien" className="hover:text-coral">
                Au-pair finden
              </Link>
            </li>
            <li>
              <Link to="/aupair" className="hover:text-coral">
                Au-pair werden
              </Link>
            </li>
            <li>
              <Link to="/#sprachschule" className="hover:text-coral">
                Sprachschule
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="label">Kontakt</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-coral">
                {site.email}
              </a>
            </li>
            <li className="text-ink/60">{site.hours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/5">
        <div className="container-x flex flex-col justify-between gap-2 py-5 text-xs text-ink/50 sm:flex-row">
          <span>© {new Date().getFullYear()} IJP International Job Placement UG</span>
          <span className="flex gap-4">
            <Link to="/impressum" className="hover:text-coral">
              Impressum
            </Link>
            <Link to="/datenschutz" className="hover:text-coral">
              Datenschutz
            </Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
