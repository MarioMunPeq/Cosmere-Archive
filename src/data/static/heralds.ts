import type { Herald } from '@/types/herald'

export const HERALDS: Herald[] = [
  {
    id: 'jezrien',
    name: 'Jezrien',
    title: 'Herald of Kings',
    order: 'Windrunners',
    surges: ['Adhesion', 'Gravitation'],
    sprenType: 'honorspren',
    sprenName: 'Sylphrena',
    description:
      'The patron of the Windrunners. His Honorblade was stolen by Szeth, who used it to murder Gavilar Kholin. Jezrien was later killed by Moash with a dagger infused with anti-light.',
    characterId: 'jezrien',
    color: '#60a5fa',
  },
  {
    id: 'nale',
    name: 'Nale (Nalan)',
    title: 'Herald of Justice',
    order: 'Skybreakers',
    surges: ['Gravitation', 'Division'],
    sprenType: 'highspren',
    sprenName: 'Nin (his spren)',
    description:
      'The patron of the Skybreakers and the only Herald to actively lead his order. He hunted surgebinders for millennia, believing it would prevent another Desolation.',
    characterId: 'nale',
    color: '#f87171',
  },
  {
    id: 'chanarach',
    name: 'Chanarach',
    title: 'Herald of Flames',
    order: 'Dustbringers',
    surges: ['Division', 'Abrasion'],
    sprenType: 'ashspren',
    description:
      'The patron of the Dustbringers. One of the more mysterious Heralds. It is theorized she may be the mother of a notable cosmere figure.',
    characterId: 'chanarach',
    color: '#fb923c',
  },
  {
    id: 'vedel',
    name: 'Vedel',
    title: 'Herald of Healers',
    order: 'Edgedancers',
    surges: ['Abrasion', 'Progression'],
    sprenType: 'cultivationspren',
    sprenName: 'Wyndle',
    description:
      'The patron of the Edgedancers. Associated with healing and growth. Little is known of her current whereabouts.',
    characterId: 'vedel',
    color: '#34d399',
  },
  {
    id: 'pailiah',
    name: 'Pailiah',
    title: 'Herald of the Learned',
    order: 'Truthwatchers',
    surges: ['Progression', 'Illumination'],
    sprenType: 'mistspren',
    sprenName: 'Glys',
    description:
      'The patron of the Truthwatchers. Known as a seeker of knowledge and truth, hidden away for millennia in the depths of the Palanaeum.',
    characterId: 'pailiah',
    color: '#2dd4bf',
  },
  {
    id: 'shalash',
    name: 'Shalash (Ash)',
    title: 'Herald of Beauty',
    order: 'Lightweavers',
    surges: ['Illumination', 'Transformation'],
    sprenType: 'cryptic',
    sprenName: 'Pattern',
    description:
      'The patron of the Lightweavers. Known for destroying artwork depicting herself across Roshar. Daughter of Jezrien.',
    characterId: 'asha',
    color: '#a78bfa',
  },
  {
    id: 'battar',
    name: 'Battar',
    title: 'Herald of Wisdom',
    order: 'Elsecallers',
    surges: ['Transformation', 'Transportation'],
    sprenType: 'inkspren',
    sprenName: 'Ivory',
    description:
      'The patron of the Elsecallers. Associated with wisdom and counsel. Her current status and location are unknown.',
    characterId: 'battar',
    color: '#f472b6',
  },
  {
    id: 'kalak',
    name: 'Kalak',
    title: 'Herald of the Willshapers',
    order: 'Willshapers',
    surges: ['Transportation', 'Cohesion'],
    sprenType: 'lightspren',
    sprenName: 'Reachers',
    description:
      'The patron of the Willshapers. One of the few Heralds seen in modern times on Roshar, meeting with Jasnah Kholin.',
    characterId: 'kalak',
    color: '#fbbf24',
  },
  {
    id: 'talenel',
    name: 'Talenel (Taln)',
    title: 'Herald of War',
    order: 'Stonewards',
    surges: ['Cohesion', 'Tension'],
    sprenType: 'peakspren',
    description:
      'The patron of the Stonewards. Endured millennia of torture on Braize without breaking. When he finally broke, the True Desolation began. The only Herald who never abandoned the Oathpact willingly.',
    characterId: 'taln',
    color: '#f97316',
  },
  {
    id: 'ishar',
    name: 'Ishar',
    title: 'Herald of the Bondsmiths',
    order: 'Bondsmiths',
    surges: ['Tension', 'Adhesion'],
    sprenType: 'the Sibling / Stormfather / Nightwatcher',
    description:
      'The patron of the Bondsmiths and the founder of the Heralds. Extremely dangerous in his madness, able to manipulate Connection and steal investiture.',
    characterId: 'ishar',
    color: '#eab308',
  },
]

export const HERALD_BY_ID: Map<string, Herald> = new Map(HERALDS.map((h) => [h.id, h]))
