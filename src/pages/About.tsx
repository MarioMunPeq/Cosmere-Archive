/**
 * /about — the project, its sources and its author.
 *
 * M2 · Block 5. This was a two-page ArchivalViewer manuscript: 256 lines whose
 * left page held a drop cap and a 2×2 metadata grid, and whose right page held
 * three columns of links in a layout that only made sense on the paper spread.
 * With the shell rebuilt around a single scrolling column, a paper spread is
 * the wrong shape.
 *
 * The content is unchanged — same four metadata fields, same three sources, same
 * thanks, same two contact links, same rights note. Only the container changed,
 * and it now uses the reading tokens (`--measure`, `--text-lead`,
 * `--text-on-page-*`) that §5.4 sets for long-form text.
 */

import { useSEOMeta } from '@/hooks/useSEOMeta'

import Signature from '@/components/about/Signature'

const FACTS: [string, string][] = [
  ['Author', 'Mario Muñoz Pequeño'],
  ['Role', 'Multiplatform Application Developer'],
  ['Project', 'Personal Passion Project'],
  ['Status', 'Continuously Growing'],
]

const SOURCES: { name: string; url: string; note: string }[] = [
  {
    name: 'The Coppermind',
    url: 'https://coppermind.net',
    note: 'The community wiki this archive draws its canon from.',
  },
  {
    name: 'Brandon Sanderson',
    url: 'https://www.brandonsanderson.com',
    note: 'The author, whose published work is the source of everything here.',
  },
  {
    name: 'Way of the Shard',
    url: 'https://wob.coppermind.net',
    note: 'Words of Brandon: the primary record for anything unreleased.',
  },
]

const CONTACT: { name: string; url: string; handle: string }[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/MarioMunPeq',
    handle: '@MarioMunPeq',
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/mario-mu%C3%B1oz-peque%C3%B1o/',
    handle: 'Mario Muñoz Pequeño',
  },
]

export default function About() {
  useSEOMeta({
    title: 'About the Archive — Cosmere Archive',
    description:
      'A personal project by Mario Muñoz Pequeño, inspired by Brandon Sanderson’s Cosmere. Sources, rights and contact.',
  })

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--surface-void)]">
      <div className="relative flex shrink-0 flex-col items-center gap-2 px-5 pt-5 pb-3">
        <div
          className="relative px-6 py-2"
          style={{
            background: 'linear-gradient(180deg, #3a2a14 0%, #24180a 100%)',
            border: '1px solid #5a3e1e',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(190,150,100,0.12)',
          }}
        >
          <h1 className="font-[var(--font-display)] text-[var(--text-h3)] tracking-[0.04em] text-[#d8b878]">
            About the Archive
          </h1>
        </div>
        <span className="font-[var(--font-display)] text-[13px] italic text-[#d8b878]">
          A personal project inspired by Brandon Sanderson's Cosmere.
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <article
          className="mx-auto max-w-[var(--reading-max)] px-[var(--gutter-md)] py-[var(--spacing-2xl)] max-md:px-[var(--gutter)]"
          style={{
            background: 'linear-gradient(152deg, #f2e9d4 0%, #eae0c8 40%, #e0d4b6 76%, #d6c8a6 100%)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {/* Opening */}
          <div className="max-w-[var(--measure)] space-y-md text-[var(--text-on-page-secondary)]">
            <p className="text-lead leading-[var(--lh-body)]">
              Most software projects are started to solve a problem, or to fill a gap. This one was started because I
              wanted to build something I genuinely care about. The Cosmere became that project.
            </p>
            <p className="text-lead leading-[var(--lh-body)]">
              I wanted the archive I imagined as a reader — one that connects the books to the people, the people to the
              worlds, and the worlds to the history that shaped them — and that turned out to be the archive worth
              building.
            </p>
            <p className="text-lead leading-[var(--lh-body)]">
              This archive was never intended to compete with the remarkable work of communities like The Coppermind. It
              borrows from them generously and credits them below.
            </p>
          </div>

          {/* Facts */}
          <section className="mt-[var(--spacing-2xl)]">
            <h2 className="text-nano tracking-[var(--ls-caps-wide)] text-[#3a2a1a] uppercase">At a glance</h2>
            <dl className="mt-md grid grid-cols-1 gap-x-[var(--spacing-xl)] gap-y-[var(--spacing-sm)] sm:grid-cols-2">
              {FACTS.map(([term, value]) => (
                <div
                  key={term}
                  className="flex items-baseline gap-md border-b border-[var(--border-subtle-on-page)] pb-xs"
                >
                  <dt className="w-24 shrink-0 text-micro tracking-[var(--ls-caps)] text-[#3a2a1a] uppercase">
                    {term}
                  </dt>
                  <dd className="min-w-0 text-[var(--text-on-page-primary)]">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Sources */}
          <section className="mt-[var(--spacing-2xl)]">
            <h2 className="text-nano tracking-[var(--ls-caps-wide)] text-[#3a2a1a] uppercase">Sources</h2>
            <ul className="mt-md space-y-md">
              {SOURCES.map((source) => (
                <li key={source.name}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-[var(--text-on-page-link)] underline decoration-[var(--border-interactive-on-page)] underline-offset-4 transition-colors hover:text-[var(--text-on-page-primary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring-on-page)]"
                  >
                    {source.name}
                  </a>
                  <p className="mt-2xs max-w-[var(--measure)] text-[var(--text-on-page-secondary)]">{source.note}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Rights */}
          <section className="mt-[var(--spacing-2xl)]">
            <h2 className="text-nano tracking-[var(--ls-caps-wide)] text-[#3a2a1a] uppercase">Rights</h2>
            <p className="mt-md max-w-[var(--measure)] text-[var(--text-on-page-secondary)]">
              This is an educational project with no commercial intent. All rights to the Cosmere, its worlds and its
              characters belong to Brandon Sanderson.
            </p>
          </section>

          {/* Thanks */}
          <section className="mt-[var(--spacing-2xl)]">
            <h2 className="text-nano tracking-[var(--ls-caps-wide)] text-[#3a2a1a] uppercase">Thanks</h2>
            <p className="mt-md max-w-[var(--measure)] text-[var(--text-on-page-secondary)]">
              Deep gratitude to the contributors of The Coppermind, whose meticulous work makes archives like this
              possible. Without their dedication, this project would not exist.
            </p>
          </section>

          {/* Contact */}
          <section className="mt-[var(--spacing-2xl)]">
            <h2 className="text-nano tracking-[var(--ls-caps-wide)] text-[#3a2a1a] uppercase">Contact</h2>
            <ul className="mt-md flex flex-wrap gap-lg">
              {CONTACT.map((c) => (
                <li key={c.name}>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex min-h-[var(--target-min)] items-center gap-2xs text-[var(--text-on-page-link)] underline decoration-[var(--border-interactive-on-page)] underline-offset-4 transition-colors hover:text-[var(--text-on-page-primary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring-on-page)]"
                  >
                    {c.name}
                    <span className="text-[#3a2a1a] no-underline">{c.handle}</span>
                  </a>
                </li>
              ))}
            </ul>

            <Signature />
          </section>
        </article>
      </div>
    </div>
  )
}
