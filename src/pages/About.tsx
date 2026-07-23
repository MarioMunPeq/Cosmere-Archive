import ArchivalViewer from '@/components/ars-arcanum/ArchivalViewer'
import Signature from '@/components/about/Signature'
import BackToMapButton from '@/components/ui/BackToMapButton'
import { useSEOMeta } from '@/hooks/useSEOMeta'

const sectionDivider = (
  <div className="flex items-center gap-2 my-5">
    <div className="w-8 h-px" style={{ background: 'rgba(80,60,40,0.15)' }} />
    <span className="font-serif text-[7px]" style={{ color: '#a09070' }}>
      ✦
    </span>
    <div className="flex-1 h-px" style={{ background: 'rgba(80,60,40,0.08)' }} />
  </div>
)

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="font-serif font-normal" style={{ fontSize: 'clamp(16px, 1.5vw, 20px)', color: '#2a1a0a' }}>
      {children}
    </h2>
  )
}

function LeftPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <BackToMapButton />
      </div>

      {/* Title block */}
      <div className="mb-8">
        <h1
          className="font-serif font-normal leading-none"
          style={{ fontSize: 'clamp(32px, 3.5vw, 52px)', color: '#2a1a0a' }}
        >
          About the Archive
        </h1>
        <div className="mt-5 flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'rgba(80,60,40,0.15)' }} />
          <span className="font-serif italic text-[10px]" style={{ color: '#8a7050' }}>
            ❧
          </span>
          <div className="flex-1 h-px" style={{ background: 'rgba(80,60,40,0.15)' }} />
        </div>
        <p
          className="mt-4 font-serif italic text-center"
          style={{ fontSize: 'clamp(11px, 1.1vw, 14px)', color: '#6a5030' }}
        >
          A personal project inspired by Brandon Sanderson's Cosmere.
        </p>
      </div>

      {/* Narrative */}
      <div className="flex-1 space-y-5">
        <p
          className="font-serif leading-relaxed first-letter:text-[2.4em] first-letter:font-serif first-letter:float-left first-letter:mr-2 first-letter:mt-1"
          style={{ fontSize: 'clamp(12.5px, 1.1vw, 15px)', color: '#3a2a1a', lineHeight: '1.8' }}
        >
          My journey through the Cosmere began with <em>Mistborn</em>. I had not read a fantasy novel in years, and
          something about that first book — the clarity of the magic, the weight of the world, the quiet persistence of
          its characters — pulled me back into reading with an intensity I had forgotten was possible. One series led to
          another, and before long I found myself deep in a universe far larger and more interconnected than I had ever
          imagined.
        </p>

        <p
          className="font-serif leading-relaxed"
          style={{ fontSize: 'clamp(12.5px, 1.1vw, 15px)', color: '#3a2a1a', lineHeight: '1.8' }}
        >
          As a multiplatform application developer, I have always believed that the best way to learn a new technology
          is to build something you genuinely care about. The Cosmere became that project. I wanted to practice modern
          web development — to experiment with interactive experiences, with visual storytelling, with the kind of
          interface design that makes you want to explore every corner of a page. And I wanted to do it about something
          that mattered to me.
        </p>

        <p
          className="font-serif leading-relaxed"
          style={{ fontSize: 'clamp(12.5px, 1.1vw, 15px)', color: '#3a2a1a', lineHeight: '1.8' }}
        >
          This archive was never intended to compete with the remarkable work of communities like The Coppermind. It
          exists simply as a different way to explore the Cosmere — more visual, more tactile, something closer to
          opening an ancient book than browsing a wiki. Every planet, every character, every connection you see here has
          been researched, written, and designed by a single person, driven by nothing more than admiration for the
          worlds Brandon Sanderson has created and the quiet joy of building something worth exploring.
        </p>
      </div>

      {/* Author info */}
      <div className="mt-8 pt-5" style={{ borderTop: '1px solid rgba(80,60,40,0.12)' }}>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {[
            ['AUTHOR', 'Mario Muñoz Pequeño'],
            ['ROLE', 'Multiplatform Application Developer'],
            ['PROJECT', 'Personal Passion Project'],
            ['STATUS', 'Continuously Growing'],
          ].map(([label, value]) => (
            <div key={label}>
              <span
                className="block font-serif text-[8px] uppercase tracking-[0.12em] mb-1"
                style={{ color: '#8a7050' }}
              >
                {label}
              </span>
              <span className="block font-serif" style={{ fontSize: 'clamp(11px, 1vw, 13px)', color: '#4a3a2a' }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RightPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-2">
        {/* Sources */}
        <div>
          <SectionTitle>Sources</SectionTitle>
          {sectionDivider}
          <p
            className="font-serif leading-relaxed"
            style={{ fontSize: 'clamp(12px, 1.05vw, 14px)', color: '#4a3a2a', lineHeight: '1.75' }}
          >
            Most of the information in this archive has been gathered from{' '}
            <a
              href="https://coppermind.net"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[#a09070]/30 underline-offset-2 hover:decoration-[#a09070]/60 transition-colors"
              style={{ color: '#5a4a3a' }}
            >
              The Coppermind
            </a>
            ,{' '}
            <a
              href="https://www.brandonsanderson.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[#a09070]/30 underline-offset-2 hover:decoration-[#a09070]/60 transition-colors"
              style={{ color: '#5a4a3a' }}
            >
              Brandon Sanderson's official website
            </a>
            , and{' '}
            <a
              href="https://wob.coppermind.net"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[#a09070]/30 underline-offset-2 hover:decoration-[#a09070]/60 transition-colors"
              style={{ color: '#5a4a3a' }}
            >
              Arcanum
            </a>
            . Images throughout the archive are largely community artwork, credited where possible. This is a fan-made
            educational project with no commercial intent. All rights to the Cosmere, its worlds, and its characters
            belong to Brandon Sanderson and Dragonsteel Entertainment.
          </p>
        </div>

        {/* Thanks */}
        <div>
          <SectionTitle>Thanks</SectionTitle>
          {sectionDivider}
          <p
            className="font-serif leading-relaxed"
            style={{ fontSize: 'clamp(12px, 1.05vw, 14px)', color: '#4a3a2a', lineHeight: '1.75' }}
          >
            Deep gratitude to the contributors of The Coppermind, whose meticulous work makes archives like this
            possible. To the broader Cosmere community for the discussions, theories, and shared enthusiasm that keep
            these worlds alive. And to the artists whose illustrations have given visual form to places and characters
            we had only imagined. Without their dedication, this project would not exist.
          </p>
        </div>

        {/* Contact */}
        <div>
          <SectionTitle>Contact</SectionTitle>
          {sectionDivider}
          <div className="space-y-4">
            <a
              href="https://www.linkedin.com/in/mario-mu%C3%B1oz-peque%C3%B1o/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 font-serif transition-colors"
              style={{ fontSize: 'clamp(13px, 1.2vw, 16px)', color: '#4a3a2a' }}
            >
              <svg
                viewBox="0 0 16 16"
                className="w-4 h-4 opacity-40 group-hover:opacity-70 transition-opacity shrink-0"
                fill="currentColor"
              >
                <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.016-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
              </svg>
              LinkedIn
              <span
                className="font-serif text-[10px] opacity-0 group-hover:opacity-50 transition-opacity"
                style={{ color: '#8a7050' }}
              >
                →
              </span>
            </a>
            <a
              href="https://github.com/MarioMunPeq"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 font-serif transition-colors"
              style={{ fontSize: 'clamp(13px, 1.2vw, 16px)', color: '#4a3a2a' }}
            >
              <svg
                viewBox="0 0 16 16"
                className="w-4 h-4 opacity-40 group-hover:opacity-70 transition-opacity shrink-0"
                fill="currentColor"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              GitHub
              <span
                className="font-serif text-[10px] opacity-0 group-hover:opacity-50 transition-opacity"
                style={{ color: '#8a7050' }}
              >
                →
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Signature */}
      <Signature />
    </div>
  )
}

export default function About() {
  useSEOMeta({
    title: 'About — Cosmere Archive',
    description:
      "About the Cosmere Archive — a personal project by Mario Muñoz Pequeño, inspired by Brandon Sanderson's Cosmere universe.",
  })

  return (
    <ArchivalViewer
      left={<LeftPage />}
      right={<RightPage />}
      leftHeader="Cosmere Archive"
      rightHeader="Preface"
      leftFolio="i"
      rightFolio="ii"
    />
  )
}
