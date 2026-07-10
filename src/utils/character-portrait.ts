export function getCharacterPortrait(name: string): string {
  const firstWord = name.split(' ')[0] ?? name
  const clean = firstWord.replace(/['']/g, '').replace(/[^a-zA-Z0-9]/g, '')
  const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase()
  return `${import.meta.env.BASE_URL}images/characters/${capitalized}.webp`
}
