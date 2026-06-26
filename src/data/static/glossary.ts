import type { GlossaryEntry } from '@/types/glossary'

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    id: 'adonalsium',
    term: 'Adonalsium',
    definition:
      'The primordial being of creation that existed before the Cosmere. It was shattered by a group of mortals into sixteen Shards, each representing a fundamental aspect of reality. The Shattering of Adonalsium is the defining event from which all Cosmere history flows.',
    category: 'shard',
    relatedTerms: ['shattering', 'shard', 'vessel', 'dawnshard'],
  },
  {
    id: 'honor',
    term: 'Honor',
    definition:
      "The Shard of Honor, Adhesion, and Oaths, originally held by Tanavast. It was splintered by Odium during the events on Roshar, though its influence persists in the Stormfather and the Nahel bond. Honor's intent compels those who hold it toward keeping promises and upholding oaths.",
    category: 'shard',
    planet: 'roshar',
    relatedTerms: ['cultivation', 'odium', 'surgebinding', 'knights_radiant', 'stormfather'],
  },
  {
    id: 'cultivation',
    term: 'Cultivation',
    definition:
      'The Shard of Cultivation, Growth, and Change, held by Koravellium Avast on Roshar. She has been subtly guiding events on Roshar, including the transformation of Taravangian and Dalinar, to oppose Odium and prepare for a future threat.',
    category: 'shard',
    planet: 'roshar',
    relatedTerms: ['honor', 'odium', 'old_magic', 'taravangian'],
  },
  {
    id: 'odium',
    term: 'Odium',
    definition:
      'The Shard of Hatred and Passion, originally held by Rayse and later taken by Taravangian. Odium is the primary antagonistic force in the Cosmere, having splintered multiple other Shards including Devotion, Dominion, and Honor.',
    category: 'shard',
    planet: 'roshar',
    relatedTerms: ['honor', 'cultivation', 'voidbinding', 'taravangian', 'shattering'],
  },
  {
    id: 'preservation',
    term: 'Preservation',
    definition:
      "The Shard of Preservation and Stability, originally held by Leras. Its intent opposes Ruin. Preservation created the world of Scadrial alongside Ruin and trapped Ruin's power in the Well of Ascension. Leras died during the events of the Catacendre.",
    category: 'shard',
    planet: 'scadrial',
    relatedTerms: ['ruin', 'harmony', 'allomancy', 'catacendre'],
  },
  {
    id: 'ruin',
    term: 'Ruin',
    definition:
      "The Shard of Ruin and Decay, originally held by Ati. Its intent compels it toward destruction and entropy. After the Lord Ruler's death, Ruin was freed from his prison in the Well of Ascension and nearly destroyed Scadrial before being stopped by Vin and Sazed.",
    category: 'shard',
    planet: 'scadrial',
    relatedTerms: ['preservation', 'harmony', 'hemalurgy', 'catacendre'],
  },
  {
    id: 'harmony',
    term: 'Harmony',
    definition:
      'The combined Shard of both Preservation and Ruin, held by Sazed after the Catacendre. Harmony represents the balance between preservation and destruction. On Scadrial, Harmony guides civilization through the harmonial orders and interacts with the world through the metallic arts.',
    category: 'shard',
    planet: 'scadrial',
    relatedTerms: ['preservation', 'ruin', 'sazed', 'catacendre'],
  },
  {
    id: 'devotion',
    term: 'Devotion',
    definition:
      'The Shard of Devotion and Love, originally held by Aona on Sel. Devotion was splintered by Odium alongside Dominion, and their power was dumped into the Cognitive Realm of Sel, creating the Dor — a chaotic well of investiture.',
    category: 'shard',
    planet: 'sel',
    relatedTerms: ['dominion', 'aondor', 'dakhor', 'selish_magic'],
  },
  {
    id: 'dominion',
    term: 'Dominion',
    definition:
      "The Shard of Dominion and Control, originally held by Skai on Sel. Dominion was splintered by Odium alongside Devotion. Its power combines with Devotion's to form the Dor, the source of all Selish investiture-based magic systems.",
    category: 'shard',
    planet: 'sel',
    relatedTerms: ['devotion', 'aondor', 'dakhor', 'selish_magic'],
  },
  {
    id: 'endowment',
    term: 'Endowment',
    definition:
      "The Shard of Endowment and Giving, held by Edgli on Nalthis. Endowment's nature is to give of itself, which manifests as BioChromatic Breath. When a person dies, their Breath is returned to Endowment, perpetuating the cycle.",
    category: 'shard',
    planet: 'nalthis',
    relatedTerms: ['awakening', 'breath', 'vasher'],
  },
  {
    id: 'autonomy',
    term: 'Autonomy',
    definition:
      'The Shard of Autonomy and Independence, held by Bavadin. Autonomy operates through multiple avatars across several planets including Taldain and First of the Sun. Its intent drives it to avoid dependency on others.',
    category: 'shard',
    relatedTerms: ['sand_mastery', 'aviar'],
  },
  {
    id: 'ambition',
    term: 'Ambition',
    definition:
      'The Shard of Ambition and Drive, originally held by Uli Da. Ambition was hunted and mortally wounded by Odium in the space between stars, with remnants falling on Threnody. The resulting investiture created the deadly shades that haunt the forests of Threnody.',
    category: 'shard',
    planet: 'threnody',
    relatedTerms: ['odium', 'shades', 'threnody'],
  },
  {
    id: 'virtuosity',
    term: 'Virtuosity',
    definition:
      'The Shard of Virtuosity and Artistry. Virtuosity splintered itself intentionally, with the remnants settling on the planet Komashi. This created the Hion lines and the magic systems of Yoki-Hijo and Nightmare Painting.',
    category: 'shard',
    planet: 'komashi',
    relatedTerms: ['yoki_hijo', 'nightmare_painting', 'hion_lines'],
  },
  {
    id: 'mercy',
    term: 'Mercy',
    definition:
      "The Shard of Mercy and Compassion. Little is known about Mercy's vessel or current location, but its investiture is believed to be connected to the spore seas of the planet Lumar.",
    category: 'shard',
    planet: 'lumar',
    relatedTerms: ['spore_magic', 'lumar'],
  },
  {
    id: 'surgebinding',
    term: 'Surgebinding',
    definition:
      'The investiture-based magic system of Roshar, used by the Knights Radiant. Surgebinders draw Stormlight from infused gemstones or highstorms to power ten Surges (fundamental forces). Each of the ten orders has access to two Surges. Surgebinding requires a Nahel bond between a human and a spren.',
    category: 'magic',
    planet: 'roshar',
    relatedTerms: ['honor', 'knights_radiant', 'stormlight', 'spren', 'voidbinding'],
  },
  {
    id: 'old_magic',
    term: 'Old Magic',
    definition:
      'The primordial magic of Roshar, tied to the Nightwatcher and Cultivation. Unlike Surgebinding, the Old Magic predates the arrival of Honor and the Heralds. Those who seek the Nightwatcher receive a boon and a curse.',
    category: 'magic',
    planet: 'roshar',
    relatedTerms: ['cultivation', 'nightwatcher', 'surgebinding'],
  },
  {
    id: 'voidbinding',
    term: 'Voidbinding',
    definition:
      'The investiture-based magic system of Roshar associated with Odium. Voidbinding involves the use of Voidlight and the Unmade. It is practiced by the singers and the Fused.',
    category: 'magic',
    planet: 'roshar',
    relatedTerms: ['odium', 'surgebinding', 'everstorm'],
  },
  {
    id: 'allomancy',
    term: 'Allomancy',
    definition:
      'A Scadrian investiture-based magic system fueled by the Shard Preservation. Allomancers ingest and burn specific metals to gain supernatural abilities. The sixteen metals each grant a unique power. Mistborn can burn all metals; Mistings can burn only one.',
    category: 'magic',
    planet: 'scadrial',
    relatedTerms: ['preservation', 'feruchemy', 'hemalurgy', 'mistborn'],
  },
  {
    id: 'feruchemy',
    term: 'Feruchemy',
    definition:
      'A Scadrian investiture-based magic system fueled by the Shard Ruin. Feruchemists store attributes (strength, speed, memories) in metal minds and later tap them. Unlike Allomancy, nothing is created — attributes are only stored and retrieved.',
    category: 'magic',
    planet: 'scadrial',
    relatedTerms: ['ruin', 'allomancy', 'hemalurgy', 'sazed'],
  },
  {
    id: 'hemalurgy',
    term: 'Hemalurgy',
    definition:
      'A Scadrian investiture-based magic system fueled by both Ruin and Preservation. Hemalurgy uses metal spikes driven through the body to steal investiture from one person and grant it to another. It is the most dangerous metallic art.',
    category: 'magic',
    planet: 'scadrial',
    relatedTerms: ['ruin', 'allomancy', 'feruchemy', 'marsh'],
  },
  {
    id: 'aondor',
    term: 'AonDor',
    definition:
      'A Selish magic system based on the shape of Arelon. AonDor requires drawing Aons — glyphs that represent geographic features of Arelon. The Elantrians of Elantris are the primary practitioners. The Shaod transforms those with Elantrian ancestry into Elantrians.',
    category: 'magic',
    planet: 'sel',
    relatedTerms: ['devotion', 'dominion', 'dakhor', 'forgery', 'raoden'],
  },
  {
    id: 'dakhor',
    term: 'Dakhor',
    definition:
      'A Selish magic system used by the Fjordell Empire. Dakhor involves bone-rearranging rituals that grant physical and supernatural abilities. It is powered by the combined investiture of Devotion and Dominion.',
    category: 'magic',
    planet: 'sel',
    relatedTerms: ['devotion', 'dominion', 'aondor', 'hrathen'],
  },
  {
    id: 'forgery',
    term: 'Forgery',
    definition:
      'A Selish magic system from the nation of MaiPon on Sel. Forgery allows practitioners to rewrite the history of objects or people by creating convincing forgeries of their past. The more plausible the forgery, the more powerful the effect.',
    category: 'magic',
    planet: 'sel',
    relatedTerms: ['devotion', 'dominion', 'aondor', 'shai'],
  },
  {
    id: 'awakening',
    term: 'Awakening',
    definition:
      'The investiture-based magic system of Nalthis, fueled by BioChromatic Breath. Awakeners invest Breath into objects to animate them according to Commands. The more Breaths used, the more complex the animation. The Eighth Heightening grants the ability to Awaken with visual Commands.',
    category: 'magic',
    planet: 'nalthis',
    relatedTerms: ['endowment', 'breath', 'vasher', 'nightblood'],
  },
  {
    id: 'sand_mastery',
    term: 'Sand Mastery',
    definition:
      'The investiture-based magic system of Taldain, fueled by Autonomy. Sand Masters manipulate white sand, causing it to turn black when investiture is expended. Mastery requires ribbon-like control over sand streams. The Diem trains and governs Sand Masters.',
    category: 'magic',
    planet: 'taldain',
    relatedTerms: ['autonomy', 'khriss', 'kenton'],
  },
  {
    id: 'shades',
    term: 'Shades',
    definition:
      'The investiture-based phenomenon of Threnody, created from the remnants of the splintered Shard Ambition. Shades are incorporeal entities that emerge from the forests of Threnody at night. They are drawn to blood and movement, dissolving any living thing they touch.',
    category: 'magic',
    planet: 'threnody',
    relatedTerms: ['ambition', 'silence'],
  },
  {
    id: 'aviar',
    term: 'Aviar Bond',
    definition:
      'The investiture-based magic system of First of the Sun. Certain birds on the Pantheon islands bond with parasitic worms that connect them to the Cognitive Realm, granting them (and their human partners) abilities like enhanced sight or mental shielding.',
    category: 'magic',
    planet: 'first_of_the_sun',
    relatedTerms: ['autonomy', 'first_of_the_sun'],
  },
  {
    id: 'yoki_hijo',
    term: 'Yoki-Hijo',
    definition:
      'The investiture-based magic system of Komashi, fueled by Virtuosity. Yoki-Hijo are individuals who can produce Hion threads — lines of energy that power technology on Komashi. They are revered in society but live under strict control.',
    category: 'magic',
    planet: 'komashi',
    relatedTerms: ['virtuosity', 'nightmare_painting', 'hion_lines'],
  },
  {
    id: 'nightmare_painting',
    term: 'Nightmare Painting',
    definition:
      'A forbidden magic system of Komashi, fueled by Virtuosity. Nightmare Painters can paint creations that come to life but eventually turn monstrous. The art involves painting from imagination, with stronger emotions producing more vivid but dangerous results.',
    category: 'magic',
    planet: 'komashi',
    relatedTerms: ['virtuosity', 'yoki_hijo', 'nightmare_painter'],
  },
  {
    id: 'spore_magic',
    term: 'Spore Magic',
    definition:
      'The investiture-based magic system of Lumar, connected to the Shard Mercy. The spore seas of Lumar contain magical spores that react violently when in contact with water. Each color of spore has different properties and dangers.',
    category: 'magic',
    planet: 'lumar',
    relatedTerms: ['mercy', 'lumar', 'tress'],
  },
  {
    id: 'investiture',
    term: 'Investiture',
    definition:
      'The fundamental energy of the Cosmere, equivalent to magic. All magic systems in the Cosmere are manifestations of investiture. Investiture can exist in various forms: solid (gemstones, metal), liquid (Perpendicularities), and gaseous (Stormlight, Breath). Various laws govern its behavior across all Shards.',
    category: 'concept',
    relatedTerms: ['shard', 'perpendicularity', 'realmatic_theory', 'spiritual_realm'],
  },
  {
    id: 'realmatic_theory',
    term: 'Realmatic Theory',
    definition:
      'The Cosmere-wide framework describing the three interconnected Realms: Physical, Cognitive, and Spiritual. All investiture interacts across these Realms. Realmatic Theory explains how Shards influence the universe and how magic functions at a fundamental level.',
    category: 'concept',
    relatedTerms: ['cognitive_realm', 'spiritual_realm', 'physical_realm', 'investiture'],
  },
  {
    id: 'shard',
    term: 'Shard (of Adonalsium)',
    definition:
      'One of sixteen fragments of Adonalsium, each representing a fundamental divine attribute. Shards are held by Vessels — mortals who take up the power and are gradually influenced by its Intent. Shards can be Splintered, Splintered into smaller pieces, or combined.',
    category: 'concept',
    relatedTerms: ['adonalsium', 'vessel', 'splinter', 'shattering'],
  },
  {
    id: 'vessel',
    term: 'Vessel',
    definition:
      "A sentient being who holds and controls a Shard of Adonalsium. The Vessel retains their personality initially but is gradually changed by the Shard's Intent over time. Notable Vessels include Tanavast (Honor), Leras (Preservation), Ati (Ruin), and Sazed (Harmony).",
    category: 'concept',
    relatedTerms: ['shard', 'adonalsium', 'shattering'],
  },
  {
    id: 'shattering',
    term: 'Shattering of Adonalsium',
    definition:
      'The cataclysmic event in which Adonalsium was broken into sixteen Shards by a group of mortals. The Shattering is the origin point of the Cosmere as it is known. The motivations and exact method of the Shattering remain mysterious.',
    category: 'event',
    relatedTerms: ['adonalsium', 'shard', 'dawnshard', 'hoid'],
  },
  {
    id: 'dawnshard',
    term: 'Dawnshard',
    definition:
      'Primordial Commands that predate the Shattering of Adonalsium. Dawnshards were used in the Shattering itself. There are four Dawnshards, each representing a fundamental Command. Holding a Dawnshard changes the wielder in profound ways.',
    category: 'concept',
    relatedTerms: ['adonalsium', 'shattering', 'realmatic_theory'],
  },
  {
    id: 'perpendicularity',
    term: 'Perpendicularity',
    definition:
      'A location where the Physical, Cognitive, and Spiritual Realms converge, allowing travel between them. Perpendicularities form where Shards invest heavily in a location. Examples include the Well of Ascension on Scadrial and the Horneater Peaks on Roshar.',
    category: 'concept',
    relatedTerms: ['cognitive_realm', 'spiritual_realm', 'physical_realm'],
  },
  {
    id: 'cognitive_realm',
    term: 'Cognitive Realm',
    definition:
      'The Realm of thought, perception, and ideas. On Roshar it is known as Shadesmar. Objects in the Physical Realm have cognitive counterparts here. Travelers in the Cognitive Realm can move vast distances quickly because distance is perceived rather than measured.',
    category: 'concept',
    relatedTerms: ['perpendicularity', 'spiritual_realm', 'physical_realm', 'realmatic_theory', 'shadesmar'],
  },
  {
    id: 'spiritual_realm',
    term: 'Spiritual Realm',
    definition:
      'The Realm of souls, Connection, and identity. The Spiritual Realm contains the essence of all things — past, present, and future — as a single timeless whole. Shards primarily reside in the Spiritual Realm, and it is the source of investiture.',
    category: 'concept',
    relatedTerms: ['cognitive_realm', 'physical_realm', 'realmatic_theory', 'investiture'],
  },
  {
    id: 'physical_realm',
    term: 'Physical Realm',
    definition:
      'The Realm of matter, energy, and physical laws. This is the realm that most beings experience as normal reality. Planets, stars, and everyday objects exist in the Physical Realm.',
    category: 'concept',
    relatedTerms: ['cognitive_realm', 'spiritual_realm', 'realmatic_theory'],
  },
  {
    id: 'knights_radiant',
    term: 'Knights Radiant',
    definition:
      'An order of Surgebinders on Roshar who bind spren through the Nahel bond. There are ten orders, each corresponding to two Surges and a specific type of spren. The Radiants were founded to protect humanity from the Desolations. They abandoned their oaths during the Recreance.',
    category: 'group',
    planet: 'roshar',
    relatedTerms: ['surgebinding', 'spren', 'heralds', 'recreance', 'oathpact'],
  },
  {
    id: 'heralds',
    term: 'Heralds of the Almighty',
    definition:
      'Ten immortals who made the Oathpact with Honor to lead humanity against the Desolations. Each Herald is associated with a specific order of the Knights Radiant. They endured torture on Braize between Desolations. After Aharietiam, only Taln remained faithful.',
    category: 'group',
    planet: 'roshar',
    relatedTerms: ['oathpact', 'knights_radiant', 'desolations', 'aharietiam', 'taln'],
  },
  {
    id: 'ghostbloods',
    term: 'Ghostbloods',
    definition:
      'A secret organization operating across the Cosmere, founded by Kelsier. The Ghostbloods seek to understand and control investiture and Realmatic travel. They operate on multiple planets and recruit through a network of agents.',
    category: 'group',
    relatedTerms: ['kelsier', 'seventeenth_shard', 'ghostbloods'],
  },
  {
    id: 'seventeenth_shard',
    term: 'The Seventeenth Shard',
    definition:
      'A secret organization dedicated to understanding the Cosmere and the nature of Adonalsium. The Seventeenth Shard seeks to maintain balance among the Shards and prevent another Shattering or conflict between them.',
    category: 'group',
    relatedTerms: ['shard', 'adonalsium', 'ghostbloods', 'hoid'],
  },
  {
    id: 'kandra',
    term: 'Kandra',
    definition:
      'A race of mistwraiths granted sapience by the First Generation. The kandra inhabit human bones to mimic human form. They are among the longest-lived beings on Scadrial and serve as speakers between Harmony and humanity.',
    category: 'group',
    planet: 'scadrial',
    relatedTerms: ['harmony', 'tenSoon', 'hemalurgy'],
  },
  {
    id: 'sleepless',
    term: 'Sleepless',
    definition:
      'Ancient hive-mind beings composed of multiple cremlings that can mimic humans. The Sleepless guard secrets of the Cosmere, including the Dawnshard on First of the Sun. They are nearly immortal and extremely secretive.',
    category: 'group',
    relatedTerms: ['dawnshard', 'first_of_the_sun'],
  },
  {
    id: 'oathpact',
    term: 'The Oathpact',
    definition:
      'A binding agreement between Honor and the ten Heralds, designed to seal the Desolations. The Heralds would return to Braize between Desolations, enduring torture so that the rest of humanity could rebuild. If one Herald broke, the Desolation would begin again.',
    category: 'concept',
    planet: 'roshar',
    relatedTerms: ['heralds', 'knights_radiant', 'desolations', 'aharietiam'],
  },
  {
    id: 'desolations',
    term: 'Desolations',
    definition:
      'Periodic wars between humanity and the Voidbringers (the singers and the Fused) on Roshar. Each Desolation was a catastrophic event that nearly destroyed human civilization. The Heralds would return to lead humanity through each cycle.',
    category: 'event',
    planet: 'roshar',
    relatedTerms: ['heralds', 'oathpact', 'knights_radiant', 'aharietiam'],
  },
  {
    id: 'aharietiam',
    term: 'Aharietiam',
    definition:
      'The Last Desolation, after which nine Heralds abandoned the Oathpact and left Taln alone on Braize. Humanity believed the Desolations were over, leading to the Recreance and the abandonment of the Knights Radiant.',
    category: 'event',
    planet: 'roshar',
    relatedTerms: ['heralds', 'desolations', 'recreance', 'taln'],
  },
  {
    id: 'recreance',
    term: 'The Recreance',
    definition:
      'The mass abandonment of the Knights Radiant after the Aharietiam. The Radiants broke their oaths and abandoned their shardblades and plate, believing they had caused the Desolations by summoning spren into the Physical Realm. This led to the loss of Surgebinding knowledge.',
    category: 'event',
    planet: 'roshar',
    relatedTerms: ['knights_radiant', 'aharietiam', 'spren'],
  },
  {
    id: 'catacendre',
    term: 'The Catacendre',
    definition:
      'The apocalyptic event on Scadrial when Ruin nearly destroyed the world. Vin and Elend died stopping Ruin, and Sazed took up both Preservation and Ruin to become Harmony. Sazed then remade the world into the Elendel Basin.',
    category: 'event',
    planet: 'scadrial',
    relatedTerms: ['ruin', 'preservation', 'harmony', 'sazed', 'vin', 'elend'],
  },
  {
    id: 'everstorm',
    term: 'The Everstorm',
    definition:
      'A sentient, magical storm on Roshar created by Odium using the Listeners. Unlike the highstorms that carry Stormlight, the Everstorm carries Voidlight and restores the minds of the singers. It circles Roshar opposite to the highstorms.',
    category: 'event',
    planet: 'roshar',
    relatedTerms: ['odium', 'voidbinding', 'stormlight', 'venli'],
  },
  {
    id: 'spren',
    term: 'Spren',
    definition:
      'Sentient investiture-based entities from the Cognitive Realm (Shadesmar) on Roshar. Spren are concepts given life by human perception. Some spren bond with humans to form the Nahel bond, granting Surgebinding abilities. Common spren include windspren, honorspren, and cryptics.',
    category: 'phenomenon',
    planet: 'roshar',
    relatedTerms: ['cognitive_realm', 'surgebinding', 'knights_radiant', 'shadesmar'],
  },
  {
    id: 'breath',
    term: 'BioChromatic Breath',
    definition:
      "The investiture manifestation of Endowment on Nalthis. Breath is a piece of Endowment's power that every Nalthian receives at birth. It can be given away freely, granting Heightenings at certain thresholds. Breath is used to fuel Awakening.",
    category: 'phenomenon',
    planet: 'nalthis',
    relatedTerms: ['endowment', 'awakening', 'vasher', 'nightblood'],
  },
  {
    id: 'stormlight',
    term: 'Stormlight',
    definition:
      'Gaseous investiture from the Shard Honor that infuses stormlight-holding gemstones during highstorms on Roshar. Stormlight is the primary fuel for Surgebinding. It glows with a blue-white light and is consumed when used, requiring recharging during new storms.',
    category: 'phenomenon',
    planet: 'roshar',
    relatedTerms: ['honor', 'surgebinding', 'everstorm', 'knights_radiant'],
  },
  {
    id: 'hion_lines',
    term: 'Hion Lines',
    definition:
      'Threads of investiture energy that power the technology of Komashi. Hion lines are anchored by individuals with the Yoki-Hijo talent. They provide light, heat, and power to the floating cities of Komashi.',
    category: 'phenomenon',
    planet: 'komashi',
    relatedTerms: ['virtuosity', 'yoki_hijo', 'nightmare_painting'],
  },
  {
    id: 'shaod',
    term: 'The Shaod',
    definition:
      'A transformational process on Sel that turns people with Elantrian ancestry into Elantrians. The Shaod stopped working after the Reod, trapping new Elantrians in a decaying half-state. It was restored when Raoden rebuilt the AonDor connection map.',
    category: 'event',
    planet: 'sel',
    relatedTerms: ['aondor', 'raoden', 'elantris'],
  },
]
