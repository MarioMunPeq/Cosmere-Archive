export interface BookArchiveEntry {
  bookId: string
  volumeNumber: string
  classification: string
  archiveDescription: string
}

export const BOOK_ARCHIVE_ENTRIES: BookArchiveEntry[] = [
  // ── Mistborn Era 1 ─────────────────────────────────────────
  {
    bookId: 'the_final_empire',
    volumeNumber: 'SCR-001',
    classification: 'PRIMARY ACCESSION · SECULAR RECORD',
    archiveDescription:
      "This volume documents the social and magical upheaval that marked the end of the Lord Ruler's thousand-year reign on Scadrial. The world, shaped by constant ashfall and volcanic winter, had been governed under a rigid caste system sustained by the manipulation of metal-born investiture. The narrative follows the formation of a revolutionary conspiracy among the skaa underclass and the rediscovery of Allomancy's full potential as a tool of insurrection. The account provides essential context for understanding Scadrial's political transformation and the cosmic forces that would later emerge from this conflict.",
  },
  {
    bookId: 'the_well_of_ascension',
    volumeNumber: 'SCR-002',
    classification: 'PRIMARY ACCESSION · SECULAR RECORD',
    archiveDescription:
      "In the immediate aftermath of the Lord Ruler's fall, this record examines the fragile transition of power in Luthadel and the chaos that followed the sudden vacuum of authority. Multiple military forces converge on the capital while the young monarch Elend Venture attempts to establish a constitutional government. The investigation into the Well of Ascension—an ancient repository of investiture beneath the city—reveals the deeper schism between Preservation and Ruin that underpins Scadrial's very existence. This volume is essential for scholars studying post-collapse societal reconstruction and the nature of Shardic influence on mortal affairs.",
  },
  {
    bookId: 'the_hero_of_ages',
    volumeNumber: 'SCR-003',
    classification: 'PRIMARY ACCESSION · SECULAR RECORD',
    archiveDescription:
      "This concluding record of the first Scadrian cycle details the world's descent toward environmental collapse as the forces of Ruin assert their influence over the physical realm. The ashfall intensifies, earthquakes fragment the landscape, and the very laws of preservation begin to unravel. The volume traces the search for the true meaning of the Hero of Ages prophecy across multiple scholarly traditions, preserved by the Keeper Sazed in his extensive collection of religious texts. The resolution of this crisis fundamentally reshaped Scadrial's geography and established the conditions for the subsequent industrial era.",
  },

  // ── Mistborn Era 2 ─────────────────────────────────────────
  {
    bookId: 'the_alloy_of_law',
    volumeNumber: 'SCR-004',
    classification: 'PRIMARY ACCESSION · SECULAR RECORD',
    archiveDescription:
      "Three centuries after the cataclysmic events of the first cycle, this record observes Scadrial's transformation into an industrial society. The Elendel Basin has developed into a center of technological innovation, with railways, electricity, and emerging urban culture reshaping the social order. The volume follows the return of a frontier lawkeeper to the city and his investigation into a criminal organization exploiting both old magical traditions and new technologies. This account documents the evolution of Metallic Arts in a changing world and the first signs of external interference in Scadrial's affairs.",
  },
  {
    bookId: 'shadows_of_self',
    volumeNumber: 'SCR-005',
    classification: 'PRIMARY ACCESSION · SECULAR RECORD',
    archiveDescription:
      "This volume records the destabilization of Elendel's political order as a figure from Scadrial's distant past reemerges in the industrial age. The investigation into a series of ritualistic murders reveals the extent to which Shardic influence continues to shape mortal destinies, even in an era of secular progress. The document examines the tension between technological advancement and the persistent influence of investiture-based phenomena, as well as the growing awareness among Scadrian scholars of a broader cosmological context beyond their world.",
  },
  {
    bookId: 'the_bands_of_mourning',
    volumeNumber: 'SCR-006',
    classification: 'PRIMARY ACCESSION · SECULAR RECORD',
    archiveDescription:
      "An expedition beyond the known borders of the Elendel Basin provides the framework for this record, which expands the geographical and historical understanding of Scadrial. The search for legendary metalminds—reputed to contain the combined powers of the Survivor—leads to discoveries about the Lord Ruler's technological innovations and the true extent of his preparation for future threats. This volume also documents the first substantial contact with artifacts and knowledge originating from outside the Scadrian system, marking a significant expansion in the Cosmere's interconnected history.",
  },
  {
    bookId: 'the_lost_metal',
    volumeNumber: 'SCR-007',
    classification: 'PRIMARY ACCESSION · SECULAR RECORD',
    archiveDescription:
      "The final volume of the second Scadrian cycle chronicles the direct confrontation between Scadrial and external Shardic forces that had been influencing the world from beyond its borders. The substance known as trellium and the involvement of agents from other planetary systems bring the broader Cosmere conflict directly to Elendel's streets. This record documents the maturation of Scadrial as a player in interplanetary politics and the difficult choices faced by those who must balance local loyalties against threats of cosmic scale.",
  },

  // ── Elantris ───────────────────────────────────────────────
  {
    bookId: 'elantris',
    volumeNumber: 'SEL-001',
    classification: 'PRIMARY ACCESSION · CIVILIZATION STUDY',
    archiveDescription:
      "This volume examines the collapse and restoration of Elantris, the once-legendary city of the Aonic people on Sel. The Shaod—a spontaneous transformative investiture event—had for millennia elevated citizens into god-like Elantrians, but a malfunction in the underlying magical system rendered victims into tormented, undead husks. The record follows three distinct perspectives: a deposed prince trapped within the fallen city, a foreign princess navigating unfamiliar political waters, and a religious zealot pursuing conversion through conquest. The document provides essential insight into the Dor, Sel's unique form of ambient investiture, and the relationship between geographic location and magical function.",
  },

  // ── Warbreaker ─────────────────────────────────────────────
  {
    bookId: 'warbreaker',
    volumeNumber: 'NAL-001',
    classification: 'PRIMARY ACCESSION · SECULAR RECORD',
    archiveDescription:
      'This record concerns the world of Nalthis and its unique system of BioChromatic investiture, wherein Breath—a resource that can be voluntarily transferred between individuals—serves as both currency and source of Awakening. The narrative follows the political tensions between the mountain kingdom of Idris and the lowland nation of Hallandren, where Returned gods govern mortal affairs. The volume documents the nature of the Lifeless, the ethical dimensions of Breath commerce, and the existence of a sentient, investiture-devouring weapon of considerable power. The events recorded here have implications for understanding the nature of divine investiture across the Cosmere.',
  },

  // ── The Stormlight Archive ─────────────────────────────────
  {
    bookId: 'the_way_of_kings',
    volumeNumber: 'ROS-001',
    classification: 'PRIMARY ACCESSION · HISTORICAL CHRONICLE',
    archiveDescription:
      "This volume initiates the chronicle of Roshar, a world defined by its violent highstorms and the adaptive biology of its flora and fauna. The record documents the resurgence of the Knights Radiant—orders of investiture-wielding warriors thought extinct for millennia—through the experiences of a slave turned battlefield commander, a scholar pursuing forbidden historical research, and a highprince haunted by visions. The account provides foundational knowledge of Roshar's unique spren ecology, the Surges, and the ancient enmity between humans and the singers known as Parshendi. This is the first in a series of volumes recording what appears to be the return of the Desolations.",
  },
  {
    bookId: 'words_of_radiance',
    volumeNumber: 'ROS-002',
    classification: 'PRIMARY ACCESSION · HISTORICAL CHRONICLE',
    archiveDescription:
      "This second volume of the Rosharan chronicle follows the consolidation of the nascent Radiant orders as the Everstorm approaches and the conflict with the Parshendi intensifies. The record examines the Second Ideal of the Radiants and the powers it grants, as well as the political machinations within the Alethi warcamp on the Shattered Plains. A young woman's investigation into the Ghostbloods and her own fractured identity reveals connections between the Lost Radiants, the Oathgates, and the true history of human settlement on Roshar. The volume concludes with a formal challenge to the seat of power itself.",
  },
  {
    bookId: 'oathbringer',
    volumeNumber: 'ROS-003',
    classification: 'PRIMARY ACCESSION · HISTORICAL CHRONICLE',
    archiveDescription:
      "This record documents the relocation of the Radiant coalition to Urithiru, the ancient tower-city of the Knights Radiant hidden in the mountains of Roshar. The volume examines the deepening conflict with the Fused—the immortal souls of ancient singers—and the psychological toll of command on those who lead the defense. Central to this record is the examination of a highprince's past sins and the nature of redemption. The account provides substantial insight into the Unmade, the influence of Odium on Rosharan history, and the geography of the Cognitive Realm as it manifests around Roshar.",
  },
  {
    bookId: 'rhythm_of_war',
    volumeNumber: 'ROS-004',
    classification: 'PRIMARY ACCESSION · SCHOLARLY ACCESSION',
    archiveDescription:
      "This volume departs from the battlefield chronicle to focus on the scientific and psychological dimensions of the Rosharan conflict. The occupation of Urithiru by Fused forces provides the framework for a detailed examination of investiture theory, including the discovery of anti-Stormlight and the vibrational nature of all Cosmere magic. The record follows a scholar's collaboration with an enemy researcher, documenting breakthroughs in the understanding of Light, tone, and rhythm. Concurrently, it examines the psychological trauma of prolonged warfare through the experience of a Radiant stripped of his powers. This volume represents a significant advancement in Cosmere scientific knowledge.",
  },
  {
    bookId: 'wind_and_truth',
    volumeNumber: 'ROS-005',
    classification: 'PRIMARY ACCESSION · HISTORICAL CHRONICLE',
    archiveDescription:
      "The concluding volume of the first Rosharan arc records the resolution of the contest between Dalinar Kholin and Odium, as well as the journey into the realm of the Heralds to understand the Oathpact's origins. This document provides the most comprehensive account yet of the Cosmere's ancient history, including the true nature of the Dawnshards, the origin of the spren, and the events that led to the current configuration of Shardic influence. The revelations contained herein fundamentally reshape the understanding of Roshar's place in the larger Cosmere and set the stage for conflicts yet to come.",
  },
  {
    bookId: 'dawnshard',
    volumeNumber: 'ROS-006',
    classification: 'PRIMARY ACCESSION · SUPPLEMENTARY CODEX',
    archiveDescription:
      "This supplementary record documents an expedition to the forbidden island of Akinah and the discovery of a Dawnshard—one of the primordial Commands that predate the Shards themselves. The volume follows a young trader's journey across Roshar's eastern seas and her encounter with the Sleepless, ancient guardians tasked with protecting knowledge of immense power. This accession expands the understanding of investiture's deepest origins and the cosmic hierarchy that governs the Cosmere. The events recorded here occur between the third and fourth volumes of the main Rosharan chronicle.",
  },

  // ── White Sand ─────────────────────────────────────────────
  {
    bookId: 'white_sand_vol_1',
    volumeNumber: 'TAL-001',
    classification: 'PRIMARY ACCESSION · CULTURAL SURVEY',
    archiveDescription:
      "This volume initiates the study of Taldain, a binary planet whose Dayside exists as an unrelenting desert and whose Darkside remains perpetually shrouded in darkness beneath a starless sky. The record documents the sand masters of the Diem, individuals capable of manipulating sand through investiture, and the political upheaval that threatens their extinction. The account is supplemented by observations from an off-world scholar investigating the unique properties of Taldain's investiture system and its relationship to the Dor. This accession provides crucial data on how planetary physics shapes magical expression.",
  },
  {
    bookId: 'white_sand_vol_2',
    volumeNumber: 'TAL-002',
    classification: 'PRIMARY ACCESSION · CULTURAL SURVEY',
    archiveDescription:
      "This second Taldain volume continues the documentation of Lossand's political struggles as surviving sand masters attempt to rebuild their order. The record expands to include the Deep Desert and the mysterious forces that dwell within it, as well as the arrival of agents from the Darkside whose objectives remain unclear. The off-world scholar's investigations deepen, revealing connections between Taldain's investiture and the fundamental principles that govern the Cosmere. The volume documents the tension between preservation of tradition and adaptation to changing circumstances.",
  },
  {
    bookId: 'white_sand_vol_3',
    volumeNumber: 'TAL-003',
    classification: 'PRIMARY ACCESSION · CULTURAL SURVEY',
    archiveDescription:
      "The concluding Taldain volume records the resolution of the conflict between Dayside and Darkside, and the transformation of the sand master order. The record examines the true nature of the Sand Lord and the origins of sand mastery, revealing connections between Taldain's investiture and the broader Cosmere. The off-world scholar's research yields fundamental insights into the nature of the Dor and its manifestation across different planetary environments. This accession completes the foundational survey of Taldain and its place in the Cosmere.",
  },

  // ── Arcanum Unbounded ──────────────────────────────────────
  {
    bookId: 'arcanum_unbounded',
    volumeNumber: 'COS-001',
    classification: 'COMPREHENSIVE ACCESSION · ANTHOLOGY',
    archiveDescription:
      'This collection assembles narratives from multiple planetary systems within the Cosmere, each introduced by scholarly essays analyzing the unique magical and physical properties of the respective worlds. The volume includes records from Scadrial, Sel, Nalthis, Roshar, Threnody, and the Drominad system, providing a comparative study of investiture manifestations across different planetary conditions. The accompanying essays represent the most systematic attempt to categorize and understand the underlying unity of Cosmere magic. This accession serves as a reference work for scholars studying cross-world phenomena.',
  },

  // ── Secret Projects ────────────────────────────────────────
  {
    bookId: 'tress_of_the_emerald_sea',
    volumeNumber: 'SP-001',
    classification: 'EXCEPTIONAL ACCESSION · FIELD REPORT',
    archiveDescription:
      "This unusual accession documents a journey across the spore seas of Lumar, a world where oceanic investiture manifests in twelve distinct types of hazardous spores. The record is framed by the commentary of a narrator whose identity and nature are themselves subjects of scholarly interest. The volume follows a young woman's transformation from an ordinary cupwasher to a captain and explorer, navigating both physical dangers and the complexities of a world where the oceans themselves are alive with latent power. This accession is classified as exceptional due to the narrative's unique framing and the light it sheds on the broader Cosmere's more obscure regions.",
  },
  {
    bookId: 'yumi_and_the_nightmare_painter',
    volumeNumber: 'SP-002',
    classification: 'EXCEPTIONAL ACCESSION · FIELD REPORT',
    archiveDescription:
      'This record concerns the twin worlds of Komashi, presented through a framing narrative of uncertain provenance. The volume documents a unique investiture phenomenon wherein one individual summons spirits to construct stone towers through ritual, while another binds nightmares—entities of concentrated human fear—through the medium of paint. The temporary merging of these two individuals across worlds provides unprecedented insight into the relationship between investiture, perception, and the boundaries that separate planetary systems. The scholarly value of this accession lies in its documentation of investiture systems that diverge significantly from previously catalogued patterns.',
  },
  {
    bookId: 'the_sunlit_man',
    volumeNumber: 'SP-003',
    classification: 'EXCEPTIONAL ACCESSION · FIELD REPORT',
    archiveDescription:
      'This accession records the experiences of a fugitive from the Rosharan system on the world of Canticle, a planet whose extreme orbital proximity to its sun forces civilization into perpetual motion across a global railway. The document provides valuable data on investiture mechanics across planetary boundaries, particularly the behavior of a Nahel bond and a Dawnshard Command in an unfamiliar investiture environment. The record also offers rare insight into the organizational structures that pursue individuals across the Cosmere and the consequences of the events recorded in the Rosharan chronicles.',
  },
]

export function getBookArchiveEntry(bookId: string): BookArchiveEntry | undefined {
  return BOOK_ARCHIVE_ENTRIES.find((e) => e.bookId === bookId)
}
