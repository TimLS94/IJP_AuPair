import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  GraduationCap,
  HeartHandshake,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { images } from '../data/site'
import { Img, Reveal } from '../components/ui'

const greetings = [
  'Hallo',
  'Hola',
  'Bonjour',
  'Ciao',
  'Olá',
  'Привіт',
  'გამარჯობა',
  'Jambo',
  'Halo',
  'Xin chào',
  'Hello',
  'Merhaba',
]

const steps = [
  {
    icon: Search,
    title: 'Entdecken',
    text: 'Familien stöbern durch Profile. Au-pairs legen in wenigen Minuten ihr eigenes an.',
  },
  {
    icon: MessageCircle,
    title: 'Kennenlernen',
    text: 'IJP stellt den Kontakt her und begleitet die ersten Gespräche – persönlich, nicht per Algorithmus.',
  },
  {
    icon: HeartHandshake,
    title: 'Ankommen',
    text: 'Wir unterstützen bei den Formalitäten und bleiben das ganze Jahr an eurer Seite.',
  },
]

const school = [
  {
    icon: BookOpen,
    title: 'Deutschkurse für jedes Niveau',
    text: 'Vom ersten „Guten Morgen“ bis zur sicheren Unterhaltung am Abendbrottisch.',
  },
  {
    icon: Users,
    title: 'Lernen in Gemeinschaft',
    text: 'Im Kurs treffen Au-pairs andere Au-pairs – Freundschaften inklusive.',
  },
  {
    icon: Award,
    title: 'Mit Ziel vor Augen',
    text: 'Wer möchte, bereitet sich gezielt auf ein Sprachzertifikat vor.',
  },
]

const gallery = [
  { src: images.family, alt: 'Familie unterwegs', caption: 'Familienzeit', className: 'md:col-span-2 md:row-span-2' },
  { src: images.classroom, alt: 'Gemeinsames Lernen', caption: 'Sprachkurs', className: '' },
  { src: images.town, alt: 'Altstadt in Deutschland', caption: 'Neues Zuhause', className: '' },
  { src: images.play, alt: 'Spielen mit Kindern', caption: 'Alltag', className: '' },
  { src: images.heroFriends, alt: 'Freundinnen und Freunde', caption: 'Freundschaften', className: '' },
]

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-sun/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 top-60 h-96 w-96 rounded-full bg-coral/15 blur-3xl" />

        <div className="container-x relative grid items-center gap-14 py-14 md:grid-cols-2 md:py-24">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-1.5 text-xs font-medium">
              <Sparkles size={14} className="text-coral" /> Au-pair-Vermittlung mit Sprachschule
            </span>
            <h1 className="mt-6 text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Ein Jahr,
              <br />
              das <em className="text-coral">bleibt.</em>
            </h1>
            <p className="mt-6 max-w-md text-lg text-ink/70">
              IJP bringt Familien und Au-pairs zusammen. Einfach, persönlich begleitet – und mit Deutschkurs, damit aus
              Ankommen Zuhause wird.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/familien" className="btn-primary">
                Au-pair finden <ArrowRight size={16} />
              </Link>
              <Link to="/aupair" className="btn-ghost">
                Au-pair werden
              </Link>
            </div>
            <p className="mt-6 text-sm text-ink/50">
              Lieber direkt sprechen?{' '}
              <Link to="/kontakt" className="underline underline-offset-4 hover:text-coral">
                IJP kontaktieren
              </Link>
            </p>
          </Reveal>

          <Reveal delay={150} className="relative mx-auto w-full max-w-md md:max-w-none">
            <div className="grid grid-cols-5 gap-4">
              <Img
                src={images.heroMain}
                alt="Familie mit Au-pair"
                className="col-span-3 aspect-[3/4] w-full rounded-[2.5rem] rounded-tl-[6rem]"
              />
              <div className="col-span-2 flex flex-col gap-4 pt-10">
                <Img src={images.heroKid} alt="Lachendes Kind" className="aspect-square w-full rounded-full" />
                <Img
                  src={images.heroFriends}
                  alt="Au-pairs unterwegs"
                  className="aspect-[3/4] w-full rounded-[2rem] rounded-br-[5rem]"
                />
              </div>
            </div>
            <div className="absolute -left-3 bottom-10 flex animate-float items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-xl shadow-ink/10 sm:-left-8">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-forest text-cream">
                <GraduationCap size={18} />
              </span>
              <div>
                <p className="text-sm font-medium">Sprachkurs</p>
                <p className="text-xs text-ink/50">gehört bei uns dazu</p>
              </div>
            </div>
            <div
              className="absolute -right-2 top-4 flex animate-float items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium shadow-xl shadow-ink/10"
              style={{ animationDelay: '1.5s' }}
            >
              <ShieldCheck size={16} className="text-coral" /> Persönlich begleitet
            </div>
          </Reveal>
        </div>
      </section>

      <div className="overflow-hidden border-y border-ink/5 bg-white py-5" aria-hidden="true">
        <div className="flex w-max animate-marquee">
          {[...greetings, ...greetings].map((g, i) => (
            <span key={i} className="flex items-center font-display text-2xl text-ink/70">
              <span className="px-6">{g}</span>
              <span className="text-coral">✦</span>
            </span>
          ))}
        </div>
      </div>

      <section className="container-x py-20 md:py-28">
        <div className="grid gap-5 md:grid-cols-2">
          <Reveal>
            <Link
              to="/familien"
              className="group flex h-full flex-col justify-between rounded-[2rem] bg-sand p-8 transition hover:bg-sun/60 sm:p-10"
            >
              <div>
                <p className="eyebrow !text-ink/50">Für Familien</p>
                <h2 className="mt-4 text-3xl sm:text-4xl">Die passende Unterstützung für Ihren Alltag.</h2>
                <p className="mt-4 max-w-sm text-ink/70">
                  Filtern Sie nach Sprache, Erfahrung und Startdatum. Gefällt Ihnen ein Profil, übernimmt IJP den Rest.
                </p>
              </div>
              <span className="mt-10 inline-flex items-center gap-2 font-medium">
                Profile ansehen
                <ArrowUpRight
                  size={18}
                  className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </Reveal>
          <Reveal delay={100}>
            <Link
              to="/aupair"
              className="group flex h-full flex-col justify-between rounded-[2rem] bg-ink p-8 text-cream transition hover:bg-coral sm:p-10"
            >
              <div>
                <p className="eyebrow !text-cream/60">Für Au-pairs</p>
                <h2 className="mt-4 text-3xl sm:text-4xl">Dein Abenteuer in Deutschland beginnt hier.</h2>
                <p className="mt-4 max-w-sm text-cream/70">
                  Erstelle in drei kurzen Schritten dein Profil. Wir helfen dir, eine Familie zu finden, bei der du dich
                  wohlfühlst.
                </p>
              </div>
              <span className="mt-10 inline-flex items-center gap-2 font-medium">
                Jetzt registrieren
                <ArrowUpRight
                  size={18}
                  className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="container-x pb-20 md:pb-28">
        <Reveal>
          <p className="eyebrow">So funktioniert's</p>
          <h2 className="mt-3 max-w-xl text-4xl sm:text-5xl">Drei Schritte. Kein Papierchaos.</h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 100}>
              <div className="card h-full p-8">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sand">
                    <s.icon size={20} />
                  </span>
                  <span className="font-display text-5xl text-ink/10">0{i + 1}</span>
                </div>
                <h3 className="mt-8 text-2xl">{s.title}</h3>
                <p className="mt-2 text-ink/60">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x pb-20 md:pb-28">
        <Reveal>
          <p className="eyebrow">Eindrücke</p>
          <h2 className="mt-3 max-w-xl text-4xl sm:text-5xl">Momente, die man nicht planen kann.</h2>
        </Reveal>
        <div className="mt-12 grid auto-rows-[11rem] grid-cols-2 gap-4 md:auto-rows-[14rem] md:grid-cols-4">
          {gallery.map((g, i) => (
            <Reveal key={g.caption} delay={i * 60} className={g.className}>
              <figure className="group relative h-full overflow-hidden rounded-3xl">
                <Img src={g.src} alt={g.alt} className="h-full w-full transition duration-700 group-hover:scale-105" />
                <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium backdrop-blur">
                  {g.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
          <Reveal delay={300} className="col-span-2 md:col-span-1">
            <Link
              to="/aupair"
              className="flex h-full flex-col justify-between rounded-3xl bg-coral p-6 text-white transition hover:bg-ink"
            >
              <Sparkles size={22} />
              <p className="font-display text-2xl leading-tight">Dein Moment fehlt hier noch.</p>
            </Link>
          </Reveal>
        </div>
      </section>

      <section id="sprachschule" className="bg-forest text-cream">
        <div className="container-x grid items-center gap-14 py-20 md:grid-cols-2 md:py-28">
          <Reveal className="relative order-2 md:order-1">
            <Img
              src={images.students}
              alt="Sprachkurs in kleiner Gruppe"
              className="aspect-[4/5] w-full rounded-[2.5rem] rounded-tr-[7rem]"
            />
            <div className="absolute -bottom-6 right-4 w-40 rotate-3 rounded-3xl bg-sun p-5 text-ink shadow-xl sm:right-8 sm:w-48">
              <p className="font-display text-2xl leading-tight">„Ich verstehe dich.“</p>
              <p className="mt-2 text-xs text-ink/60">Der schönste Satz im ersten Monat.</p>
            </div>
          </Reveal>

          <Reveal delay={100} className="order-1 md:order-2">
            <p className="eyebrow !text-sun">Die IJP Sprachschule</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Mehr als Betreuung: Sprache, die verbindet.</h2>
            <p className="mt-5 max-w-md text-cream/70">
              Ein Au-pair-Jahr gelingt, wenn man sich versteht. Deshalb gehört bei IJP der Deutschkurs fest dazu. Ihr
              Au-pair lernt schneller, fühlt sich sicherer – und Ihre Kinder gewinnen einen Menschen, der wirklich
              mitreden kann.
            </p>
            <ul className="mt-10 space-y-6">
              {school.map((s) => (
                <li key={s.title} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cream/10">
                    <s.icon size={18} className="text-sun" />
                  </span>
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="mt-1 text-sm text-cream/60">{s.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/kontakt?thema=sprachschule" className="btn-light mt-10">
              Zur Sprachschule beraten lassen <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="container-x py-20 md:py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-sand px-8 py-16 text-center sm:px-16 sm:py-20">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-coral/20 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-sun/40 blur-2xl" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-4xl sm:text-5xl">Lieber persönlich? Wir sind für Sie da.</h2>
              <p className="mx-auto mt-4 max-w-md text-ink/70">
                Schildern Sie uns Ihre Situation – wir melden uns und finden gemeinsam das passende Au-pair.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/kontakt" className="btn-coral">
                  IJP kontaktieren <ArrowRight size={16} />
                </Link>
                <Link to="/familien" className="btn-ghost">
                  Erst mal stöbern
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
