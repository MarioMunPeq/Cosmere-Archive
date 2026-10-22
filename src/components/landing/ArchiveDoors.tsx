/** The archive as a working table: a chart in the centre, source objects around it. */
import { Link } from 'react-router-dom'
import { BOOKS, SAGAS, ALL_CHARACTERS, PLANETS } from '@/data/static'
import { TIMELINE_EVENTS, ERAS } from '@/data/static/timeline'
import { DIAGRAM_NOTES } from '@/data/static/diagram-notes'
import { buildEntityCatalog } from '@/components/shadesmar/entity-catalog'
import { CLUSTERS } from '@/components/shadesmar/types'
import { CORE_DESTINATIONS, HISTORICAL_DESTINATIONS } from '@/navigation'
import { HONORBLADES } from '@/data/static/aharietiam'

export const ARCHIVE_COUNTS = {
  volumes: BOOKS.length,
  series: SAGAS.length,
  records: ALL_CHARACTERS.length,
  worlds: PLANETS.length,
  souls: buildEntityCatalog().length,
  realms: CLUSTERS.length,
  events: TIMELINE_EVENTS.length,
  eras: ERAS.length,
} as const

const destination = (id: string, fallback: string) => CORE_DESTINATIONS.find((item) => item.id === id)?.to ?? fallback
const historical = (id: string, fallback: string) =>
  HISTORICAL_DESTINATIONS.find((item) => item.id === id)?.to ?? fallback
const cover = (name: string) => `${import.meta.env.BASE_URL}images/covers/${name}.webp`
const portrait = (name: string) => `${import.meta.env.BASE_URL}characters/${name}.webp`

export default function ArchiveDoors() {
  return (
    <section
      aria-labelledby="archive-title"
      className="relative mx-auto flex h-full min-h-full w-full flex-col overflow-hidden"
    >
      <header className="relative z-20 flex shrink-0 items-center justify-between border-b border-[#c7a875]/20 bg-[linear-gradient(180deg,rgba(48,33,22,.94),rgba(34,23,16,.88))] px-5 py-3 shadow-[inset_0_1px_0_rgba(255,232,186,.06),0_5px_18px_rgba(0,0,0,.12)] sm:px-10 lg:px-[clamp(40px,6vw,112px)]">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d1b17a]/25 to-transparent"
        />
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#d4c49d]/55 bg-[radial-gradient(circle_at_35%_25%,#e5d8b4,#b6a47c_74%,#766447)] shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_3px_8px_rgba(0,0,0,.32)] sm:h-10 sm:w-10">
            <span aria-hidden className="absolute inset-[3px] rounded-full border border-[#55462f]/40" />
            <img
              src={`${import.meta.env.BASE_URL}images/brand/cosmere-mark.png`}
              alt=""
              className="relative h-[27px] w-[27px] object-contain sm:h-[30px] sm:w-[30px]"
            />
          </span>
          <span
            aria-hidden
            className="h-8 w-px shrink-0 bg-gradient-to-b from-transparent via-[#c2a779]/45 to-transparent"
          />
          <div className="min-w-0">
            <p className="font-[var(--font-mono)] text-[7px] tracking-[.2em] text-[#c2a779] sm:text-[8px]">
              FIELD INDEX <span className="px-1 text-[#8d7552]">·</span> VOL. I
            </p>
            <h1
              id="archive-title"
              className="mt-0.5 truncate font-[var(--font-display)] text-[18px] leading-none tracking-[.015em] text-[#f0e4ce] sm:text-[25px]"
            >
              Cosmere Archive
            </h1>
          </div>
        </div>
        <Link
          to={historical('about', '/about')}
          className="ml-3 inline-flex min-h-10 shrink-0 items-center gap-2 border-l border-[#c7a875]/25 pl-3 font-[var(--font-mono)] text-[8px] tracking-[.12em] text-[#c9b58d] transition-colors hover:text-[#f2dfba] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#e5c582] sm:pl-5 sm:text-[9px]"
        >
          <span className="sm:hidden">ARCHIVIST</span>
          <span className="hidden sm:inline">THE ARCHIVIST</span>
          <span aria-hidden className="text-[11px] text-[#a98d5e]">
            ↗
          </span>
        </Link>
      </header>

      <div className="relative mx-auto mt-3 min-h-[930px] w-full flex-1 px-3 pb-24 sm:px-8 md:mt-0 md:min-h-0 md:px-5 md:pb-4 lg:px-8">
        <TableSurface />
        <div className="relative z-10 mx-auto grid h-full w-full grid-cols-2 gap-x-2 gap-y-7 pt-4 sm:gap-x-8 sm:gap-y-10 md:pt-0">
          <Link
            to={destination('library', '/library')}
            aria-label={`Library: ${ARCHIVE_COUNTS.volumes} volumes in ${ARCHIVE_COUNTS.series} series`}
            className="group relative col-span-2 mx-auto mt-3 block w-full max-w-[440px] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#e5c582] lg:absolute lg:left-[2%] lg:top-[7%] lg:mt-0 lg:w-[clamp(210px,17vw,290px)] lg:max-w-none"
          >
            <LibraryArtifact />
          </Link>

          <Link
            to={destination('records', '/characters')}
            aria-label={`Records: ${ARCHIVE_COUNTS.records} biographies from ${ARCHIVE_COUNTS.worlds} worlds`}
            className="group relative col-span-2 mx-auto block w-full max-w-[340px] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#e5c582] lg:absolute lg:right-[3%] lg:top-[6%] lg:w-[clamp(260px,22vw,350px)] lg:max-w-none"
          >
            <RecordsArtifact />
          </Link>

          <Link
            to={destination('diagram', '/taravangian')}
            aria-label={`Taravangian Diagram. ${DIAGRAM_NOTES.length} leaves: six deductions and three tallies.`}
            className="group relative col-span-2 mx-auto block w-full max-w-[520px] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#e5c582] lg:absolute lg:left-1/2 lg:top-1/2 lg:w-[clamp(430px,42vw,650px)] lg:max-w-none lg:-translate-x-1/2 lg:-translate-y-1/2"
          >
            <DiagramArtifact />
          </Link>

          <Link
            to={destination('shadesmar', '/shadesmar')}
            aria-label={`Shadesmar: ${ARCHIVE_COUNTS.souls} souls across ${ARCHIVE_COUNTS.realms} realms`}
            className="group relative col-span-2 mx-auto block w-full max-w-[430px] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#e5c582] lg:absolute lg:right-[4%] lg:bottom-[5%] lg:w-[clamp(240px,20vw,330px)] lg:max-w-none"
          >
            <ShadesmarArtifact />
          </Link>

          <Link
            to={historical('aharietiam', '/aharietiam')}
            aria-label={`Aharietiam: ${HONORBLADES.length} Honorblades`}
            className="group relative col-span-2 mx-auto block w-full max-w-[330px] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#e5c582] lg:absolute lg:left-[4%] lg:bottom-[4%] lg:w-[clamp(220px,17vw,280px)] lg:max-w-none"
          >
            <AharietiamArtifact />
          </Link>
        </div>
      </div>
    </section>
  )
}

function TableSurface() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#604128_0%,#4a2f1d_42%,#28180f_82%,#160d08_100%)]" />
      <div
        className="absolute inset-0 opacity-[.12]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(2deg,transparent 0px,rgba(211,162,103,.16) 1px,transparent 3px,transparent 29px),repeating-linear-gradient(91deg,rgba(18,10,6,.3) 0px,transparent 4px,transparent 122px)',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-[#d4b078]/20" />
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-black/25" />
      <div className="absolute inset-x-5 bottom-5 h-px bg-gradient-to-r from-transparent via-[#c6a36d]/20 to-transparent" />
    </div>
  )
}

function LibraryArtifact() {
  return (
    <div className="relative h-[268px] transition duration-500 group-hover:-translate-y-2 sm:h-[310px] md:h-[330px]">
      <div className="absolute bottom-2 left-[4%] right-[3%] h-[42px] -skew-x-6 bg-[#24150d] shadow-[0_19px_17px_rgba(0,0,0,.4)]" />
      <div className="absolute bottom-7 left-[4%] h-[58px] w-[92%] -rotate-[4deg] rounded-[2px] bg-[linear-gradient(180deg,#bd9355,#7b572f_45%,#3c2717_52%,#8c6235)] shadow-[0_10px_14px_rgba(0,0,0,.4)]" />
      <BookSpine
        title="THE WAY OF KINGS"
        variant="kings"
        className="left-[7%] top-[42px] h-[194px] w-[42px] -rotate-[7deg] sm:h-[222px] sm:w-[48px] md:left-[9%] md:h-[238px] md:w-[53px]"
      />
      <BookVolume
        name="words_of_radiance"
        className="left-[27%] top-[13px] z-[2] h-[228px] w-[144px] -rotate-[1deg] sm:h-[258px] sm:w-[164px] md:left-[32%] md:h-[274px] md:w-[177px]"
      />
      <BookSpine
        title="OATHBRINGER"
        className="left-[69%] top-[36px] z-[1] h-[202px] w-[44px] rotate-[6deg] sm:h-[231px] sm:w-[51px] md:left-[68%] md:h-[238px] md:w-[54px]"
      />
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap font-[var(--font-mono)] text-[9px] tracking-[.19em] text-[#d2b17c]">
        THE LIBRARY <i className="px-2 not-italic text-[#8e714a]">·</i> {ARCHIVE_COUNTS.volumes} VOLUMES
      </span>
    </div>
  )
}

function BookVolume({ name, className }: { name: string; className: string }) {
  return (
    <div
      className={`absolute overflow-hidden rounded-[2px] border border-[#d3b97f]/50 bg-[#382719] shadow-[5px_10px_18px_rgba(0,0,0,.48)] transition-transform duration-500 group-hover:rotate-0 ${className}`}
    >
      <img src={cover(name)} alt="" className="h-full w-full object-cover" />
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[11px] bg-[linear-gradient(90deg,rgba(22,13,8,.65),rgba(255,229,174,.14),transparent)]"
      />
    </div>
  )
}

function BookSpine({
  title,
  className,
  variant = 'plain',
}: {
  title: string
  className: string
  variant?: 'plain' | 'kings'
}) {
  if (variant === 'kings') {
    return (
      <div
        className={`absolute overflow-hidden rounded-[5px] border border-[#c6a566]/80 bg-[linear-gradient(90deg,#101a20_0%,#27404a_9%,#172a31_19%,#36535a_48%,#1b333a_77%,#0d1d23_94%,#081216)] shadow-[inset_2px_0_3px_rgba(232,205,147,.22),inset_-3px_0_5px_rgba(0,0,0,.65),5px_13px_19px_rgba(0,0,0,.55)] transition-transform duration-500 group-hover:rotate-0 ${className}`}
      >
        <span
          aria-hidden
          className="absolute inset-[5px] rounded-[2px] border border-[#d5b774]/35 shadow-[inset_0_0_10px_rgba(0,0,0,.25)]"
        />
        <span
          aria-hidden
          className="absolute inset-x-[7px] top-[9px] h-[4px] border-y border-[#d6b877]/70 bg-[#8f7342]/30"
        />
        <span
          aria-hidden
          className="absolute left-1/2 top-[19%] h-[14px] w-[14px] -translate-x-1/2 rotate-45 border border-[#d7bd83]/75 bg-[radial-gradient(circle,#d7bd83_0%,#947344_18%,transparent_24%)] shadow-[0_0_5px_rgba(224,198,135,.18)]"
        />
        <span aria-hidden className="absolute left-1/2 top-[20%] h-[24px] w-px -translate-x-1/2 bg-[#c6aa6d]/50" />
        <span
          aria-hidden
          className="absolute left-1/2 top-[37%] h-[4px] w-[4px] -translate-x-1/2 rounded-full bg-[#d6bc81]/85 shadow-[0_0_4px_rgba(226,201,144,.55)]"
        />
        <span className="absolute inset-0 flex items-center justify-center px-1 font-[var(--font-display)] text-[9px] font-medium tracking-[.12em] text-[#ead7a9] [writing-mode:vertical-rl] [text-shadow:0_1px_1px_#081216,0_0_5px_rgba(226,203,154,.22)]">
          {title}
        </span>
        <span
          aria-hidden
          className="absolute inset-x-[7px] bottom-[9px] h-[4px] border-y border-[#d6b877]/70 bg-[#8f7342]/30"
        />
        <span
          aria-hidden
          className="absolute bottom-[18%] left-1/2 h-[14px] w-[14px] -translate-x-1/2 rotate-45 border border-[#d7bd83]/65"
        />
        <span aria-hidden className="absolute inset-y-0 left-[3px] w-px bg-white/10" />
      </div>
    )
  }
  return (
    <div
      className={`absolute overflow-hidden rounded-[3px] border border-[#dabd7c]/55 bg-[linear-gradient(90deg,#182b34,#31505a_24%,#19333b_52%,#10262f_82%,#071920)] shadow-[5px_12px_16px_rgba(0,0,0,.5)] transition-transform duration-500 group-hover:rotate-0 ${className}`}
    >
      <span aria-hidden className="absolute inset-x-1 top-2 h-1 border-y border-[#d3b778]/55" />
      <span className="absolute inset-0 flex items-center justify-center px-1 font-[var(--font-display)] text-[9px] tracking-[.08em] text-[#e3cc97] [writing-mode:vertical-rl]">
        {title}
      </span>
      <span aria-hidden className="absolute inset-x-1 bottom-2 h-1 border-y border-[#d3b778]/55" />
    </div>
  )
}

function RecordsArtifact() {
  return (
    <div className="relative h-[280px] rotate-[1deg] transition-transform duration-500 group-hover:rotate-0 md:h-[300px]">
      <div
        aria-hidden
        className="absolute inset-x-3 bottom-4 top-9 rounded-[4px] border border-[#a2764a] bg-[linear-gradient(90deg,#2c1a12_0%,#684326_5%,#794e2d_9%,#4b2d1b_18%,#6b452a_50%,#482918_82%,#765031_94%,#2b190f_100%)] shadow-[0_24px_32px_rgba(0,0,0,.58)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-4 top-7 h-4 skew-x-[-5deg] border border-[#aa8050]/75 bg-[linear-gradient(180deg,#a77b4a,#4d301b)] shadow-[0_4px_5px_rgba(0,0,0,.42)]"
      />
      <div
        aria-hidden
        className="absolute left-[5px] top-12 h-[calc(100%-78px)] w-3 rounded-l-sm border-y border-l border-[#a2794b]/70 bg-[linear-gradient(90deg,#24150e,#76502e)] shadow-[inset_2px_0_3px_rgba(0,0,0,.5)]"
      />
      <div
        aria-hidden
        className="absolute right-[5px] top-12 h-[calc(100%-78px)] w-3 rounded-r-sm border-y border-r border-[#a2794b]/70 bg-[linear-gradient(90deg,#76502e,#24150e)] shadow-[inset_-2px_0_3px_rgba(0,0,0,.5)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-5 bottom-[83px] top-[48px] rounded-t-[2px] border border-[#c39a64]/50 bg-[linear-gradient(180deg,#100b08,#24170f_60%,#120c08)] shadow-[inset_0_8px_15px_rgba(0,0,0,.9),0_1px_0_rgba(225,188,123,.15)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-6 bottom-[86px] top-[51px] overflow-hidden opacity-35"
        style={{
          backgroundImage:
            'repeating-linear-gradient(2deg,transparent 0px,rgba(208,166,105,.25) 1px,transparent 2px,transparent 19px)',
        }}
      />
      <div className="absolute inset-x-7 bottom-[87px] top-[44px]">
        <IndexCard name="Jasnah" label="KHOLIN" position="1%" rotation="-7deg" />
        <IndexCard name="Dalinar" label="BLACKTHORN" position="34%" rotation="2deg" />
        <IndexCard name="Kaladin" label="BRIDGEMAN" position="67%" rotation="7deg" />
      </div>
      <div className="absolute inset-x-2 bottom-3 flex h-[84px] items-center justify-center rounded-[3px] border border-[#be9258] bg-[linear-gradient(180deg,#96643a_0%,#714626_10%,#59371f_53%,#382216_100%)] shadow-[inset_0_2px_2px_rgba(255,218,159,.28),inset_0_-5px_8px_rgba(0,0,0,.3),0_12px_17px_rgba(0,0,0,.56)]">
        <span aria-hidden className="absolute inset-x-2 top-[5px] h-px bg-[#f0d49a]/50" />
        <span aria-hidden className="absolute inset-x-2 bottom-[5px] h-px bg-black/35" />
        <span
          aria-hidden
          className="absolute left-3 top-3 h-1.5 w-1.5 rounded-full border border-[#d5b57a] bg-[#57402a] shadow-[0_0_2px_#f1d391]"
        />
        <span
          aria-hidden
          className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full border border-[#d5b57a] bg-[#57402a] shadow-[0_0_2px_#f1d391]"
        />
        <div className="relative flex min-w-[72%] items-center justify-between border border-[#e1c78e]/80 bg-[linear-gradient(180deg,#e5d09d,#bc9c63_48%,#987544)] px-3 py-2 shadow-[inset_0_1px_rgba(255,248,216,.75),inset_0_-2px_3px_rgba(66,43,21,.2),0_3px_5px_rgba(0,0,0,.45)]">
          <span aria-hidden className="absolute inset-[3px] border border-[#735730]/40" />
          <span className="relative font-[var(--font-mono)] text-[8px] tracking-[.16em] text-[#4a321d]">
            PERSONS · ROSHAR
          </span>
          <span className="relative font-[var(--font-display)] text-[15px] text-[#382719]">Records</span>
        </div>
        <span
          aria-hidden
          className="absolute bottom-[-8px] left-1/2 h-[14px] w-[42px] -translate-x-1/2 rounded-b-[7px] border border-[#a88451] bg-[linear-gradient(180deg,#8a6338,#4b301b)] shadow-[0_4px_6px_rgba(0,0,0,.55)]"
        />
        <span
          aria-hidden
          className="absolute bottom-[-4px] left-1/2 h-[4px] w-[24px] -translate-x-1/2 rounded-full bg-[#c5a36b] shadow-[inset_0_1px_2px_rgba(255,233,174,.55)]"
        />
        <span className="absolute bottom-2 right-3 font-[var(--font-hand)] text-[7px] italic text-[#bba17b]/60">
          {ARCHIVE_COUNTS.records} entries
        </span>
      </div>
      <span
        aria-hidden
        className="absolute right-[8%] top-[25px] z-20 h-[14px] w-[57px] rotate-[8deg] border border-[#a48557]/65 bg-[linear-gradient(180deg,#e0cc9d,#b49a6d)] shadow-[0_2px_3px_rgba(0,0,0,.3)]"
      />
    </div>
  )
}

function IndexCard({
  name,
  label,
  position,
  rotation,
}: {
  name: string
  label: string
  position: string
  rotation: string
}) {
  return (
    <div
      className="absolute top-0 h-full w-[32%] border border-[#b39c71] bg-[linear-gradient(145deg,#eee4c8,#d5c69f)] px-1.5 pt-2 shadow-[0_4px_8px_rgba(0,0,0,.45)] sm:px-2 sm:pt-2.5"
      style={{ left: position, transform: `rotate(${rotation})` }}
    >
      <span
        aria-hidden
        className="absolute -top-2 left-2 border border-[#a99162] bg-[#d8c69a] px-1.5 font-[var(--font-mono)] text-[7px] text-[#624a2c]"
      >
        {label[0]}
      </span>
      <div className="flex h-full flex-col items-center">
        <p className="mb-1 w-full truncate border-b border-[#a58d62]/55 pb-1 text-center font-[var(--font-mono)] text-[6px] tracking-[.12em] text-[#745936]">
          {label}
        </p>
        <img
          src={portrait(name)}
          alt=""
          className="h-[65%] w-full border border-[#9b8156]/70 object-cover object-top grayscale-[20%]"
        />
        <p className="mt-1 font-[var(--font-display)] text-[9px] leading-none text-[#4e3c27] sm:text-[10px]">{name}</p>
      </div>
    </div>
  )
}

function DiagramArtifact() {
  return (
    <div className="relative rotate-[-1.2deg] overflow-visible bg-[linear-gradient(147deg,#e8d8b6,#cbb58a)] p-3 text-[#3b2c1b] shadow-[0_24px_42px_rgba(0,0,0,.52)] transition-transform duration-500 group-hover:rotate-0 sm:p-5">
      <div
        aria-hidden
        className="absolute -top-[7px] left-[16%] h-[15px] w-[55px] rotate-[-4deg] border border-[#987c52]/45 bg-[#c6ad7c]/75 shadow-sm"
      />
      <div className="absolute inset-[5px] border border-[#8b7049]/35" />
      <div className="relative flex items-start justify-between gap-3 px-1 pb-1">
        <div>
          <p className="font-[var(--font-mono)] text-[7px] tracking-[.19em] text-[#8b5038]">
            BOOK OF THE 2ND CEILING ROTATION
          </p>
          <h2 className="mt-1 font-[var(--font-display)] text-[21px] leading-none sm:text-[25px]">The Diagram</h2>
        </div>
        <p className="rotate-[3deg] pt-1 text-right font-[var(--font-hand)] text-[13px] italic leading-[1.05] text-[#8b3d2e] sm:text-[15px]">
          Pattern 1<br />→ Pattern 15
        </p>
      </div>
      <DiagramLeaf />
    </div>
  )
}

function DiagramLeaf() {
  return (
    <div className="relative mt-1 aspect-[520/380] overflow-hidden" aria-hidden="true">
      <svg viewBox="0 0 520 380" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <g stroke="#8b7858" strokeWidth=".55" opacity=".43">
          <path d="M0 25H520M0 55H520M0 85H520M0 115H520M0 145H520M0 175H520M0 205H520M0 235H520M0 265H520M0 295H520M0 325H520M0 355H520" />
        </g>
        <g fill="#7b3026" fontFamily="var(--font-hand)" fontStyle="italic">
          <text x="20" y="39" fontSize="19" transform="rotate(-2 20 39)">
            You must become king. Of Everything.
          </text>
          <text x="412" y="28" fontSize="13" transform="rotate(4 412 28)">
            Pattern 15
          </text>
          <text x="18" y="82" fontFamily="monospace" fontSize="12" letterSpacing=".2">
            1173090605 1173090801 1173090901 1173091001
          </text>
          <text x="18" y="101" fontFamily="monospace" fontSize="12" letterSpacing=".2">
            1173091004 1173100105 1173100205 1173100401 1173100603 1173100804
          </text>
          <text x="20" y="151" fontSize="18" transform="rotate(-1 20 151)">
            One is almost certainly a traitor to the others.
          </text>
          <text x="20" y="207" fontSize="17" transform="rotate(-1.5 20 207)">
            There is one you will watch. Though all of them have
          </text>
          <text x="20" y="230" fontSize="17" transform="rotate(-1.5 20 230)">
            some relevance to precognition
          </text>
          <text x="252" y="291" fontSize="19" transform="rotate(5 252 291)">
            I = 8
          </text>
          <text x="417" y="365" fontSize="12" transform="rotate(-4 417 365)">
            Pattern 1
          </text>
        </g>
        <g fill="none" stroke="#2c241f" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 270C55 237 83 293 119 261S160 294 196 267 237 291 267 263M397 250L434 225 478 258 442 299 397 250ZM400 249L472 260M434 225L442 299" />
          <path
            d="M51 317C88 287 79 255 118 251S153 276 175 250M296 322c29-23 59-4 87-27M341 177c26-18 45-10 64-24"
            strokeWidth=".85"
          />
        </g>
        <g fill="none" stroke="#983a2b" strokeWidth="1.45" strokeLinecap="round">
          <path d="M14 179C56 160 93 176 129 158M242 244c39-22 76-18 111 0M303 48l-25 26m2-29 28 27M31 239C61 221 93 226 118 247M364 330c35-26 77-24 112-6M466 163c15-12 29-9 40 1" />
          <path d="M18 243l92-7m-88 12 92-14M368 181l94 6m-91-1 88 12" />
        </g>
        <g fill="#32271f">
          <circle cx="115" cy="76" r="3" />
          <circle cx="284" cy="89" r="3.5" />
          <circle cx="438" cy="254" r="3" />
          <circle cx="195" cy="269" r="2.7" />
          <circle cx="366" cy="303" r="3" />
        </g>
        <g fill="none" stroke="#a43c2a" strokeWidth="1.6">
          <ellipse cx="280" cy="290" rx="35" ry="15" transform="rotate(6 280 290)" />
          <ellipse cx="447" cy="27" rx="42" ry="13" transform="rotate(5 447 27)" />
          <path d="M286 359l104-5m-98 10 98-10M151 249c24 10 47 9 67-1M296 243c32 8 61 6 83-8" />
        </g>
        <g fill="none" stroke="#8b3026" strokeWidth="1.4" strokeLinecap="round">
          <path d="M166 177C142 159 111 164 91 177m75 4c-25-11-45-5-61 14M405 184c21-23 42-19 61-7M173 235c25 14 48 13 66-4M365 205c13 18 35 28 58 26" />
          <path d="M166 177l-9-8m9 8-11 2M463 177l-3 10m3-10-10 5M220 232l10-1m-10 1 4-8" />
        </g>
      </svg>
    </div>
  )
}

function ShadesmarArtifact() {
  return (
    <div className="relative flex min-h-[180px] items-center gap-4 px-1 py-3 text-[#e2e7d4] transition-transform duration-500 group-hover:-translate-y-1 md:min-h-[205px] md:flex-col md:justify-center md:gap-1">
      <div className="relative h-[116px] w-[116px] shrink-0 rounded-full border border-[#c1d4b3]/45 bg-[radial-gradient(circle_at_33%_28%,#f3edc8_0%,#afc4a3_9%,#5c8581_29%,#315760_57%,#101f2a_80%,#080e15_100%)] shadow-[inset_-18px_-20px_30px_rgba(0,0,0,.55),0_0_30px_rgba(157,204,183,.26)] transition duration-700 group-hover:shadow-[inset_-18px_-20px_30px_rgba(0,0,0,.5),0_0_45px_rgba(157,204,183,.43)] md:h-[140px] md:w-[140px]">
        <span
          aria-hidden
          className="absolute -left-[7%] top-[53%] h-px w-[114%] rotate-[-26deg] bg-[#d1dfbb]/80 shadow-[0_0_9px_2px_rgba(204,235,205,.42)]"
        />
        <span
          aria-hidden
          className="absolute left-[23%] top-[27%] h-[3px] w-[3px] rounded-full bg-white shadow-[0_0_10px_3px_rgba(219,245,210,.8)]"
        />
        <span aria-hidden className="absolute left-[68%] top-[69%] h-[2px] w-[2px] rounded-full bg-[#e4eed9]" />
      </div>
      <div className="min-w-0 md:text-center">
        <p className="font-[var(--font-mono)] text-[8px] tracking-[.18em] text-[#9db4a5]">THE COGNITIVE REALM</p>
        <h2 className="mt-1 font-[var(--font-display)] text-[27px] leading-none">Shadesmar</h2>
        <p className="mt-1 font-[var(--font-display)] text-[12px] italic text-[#b9c7ba]">The sea between worlds.</p>
        <p className="mt-2 font-[var(--font-mono)] text-[8px] tracking-[.12em] text-[#9db4a5]">
          {ARCHIVE_COUNTS.souls} SOULS <span className="px-1 text-[#658479]">·</span> {ARCHIVE_COUNTS.realms} REALMS
        </p>
      </div>
    </div>
  )
}

function AharietiamArtifact() {
  return (
    <div className="relative flex min-h-[280px] flex-col items-center justify-center transition-transform duration-500 group-hover:-translate-y-1 md:min-h-[300px]">
      <div
        aria-hidden="true"
        className="h-[202px] w-[202px] bg-contain bg-center bg-no-repeat drop-shadow-[0_8px_13px_rgba(0,0,0,.42)] transition duration-500 group-hover:drop-shadow-[0_0_21px_rgba(215,232,231,.34)] md:h-[218px] md:w-[218px]"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/decorations/oathbringer-blade-reference.png)`,
          maskImage: `url(${import.meta.env.BASE_URL}images/decorations/oathbringer-blade-reference.png)`,
          WebkitMaskImage: `url(${import.meta.env.BASE_URL}images/decorations/oathbringer-blade-reference.png)`,
          maskMode: 'luminance',
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
        }}
      />
      <div className="relative -mt-1 text-center text-[#dfd2b5]">
        <p className="font-[var(--font-mono)] text-[8px] tracking-[.18em] text-[#bda478]">THE OATHPACT · ROSHAR</p>
        <h2 className="mt-1 font-[var(--font-display)] text-[24px] leading-none">Aharietiam</h2>
        <p className="mt-1 font-[var(--font-display)] text-[11px] italic text-[#b8a98c]">Ten blades left behind.</p>
        <p className="mt-2 font-[var(--font-mono)] text-[8px] tracking-[.12em] text-[#a48d68]">
          {HONORBLADES.length} HONORBLADE RELICS
        </p>
      </div>
    </div>
  )
}
