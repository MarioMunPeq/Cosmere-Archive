import { memo } from 'react'
import CharacterAvatar from '@/components/ui/CharacterAvatar'
import type { Character } from '@/types'
import type { Planet } from '@/types/planet'

interface Attr {
  label: string
  getValue: (c: Character) => string
}

interface Props {
  character: Character
  planet: Planet | null | undefined
  attrs: Attr[]
  className?: string
}

const CompareCharacterPanel = memo(function CompareCharacterPanel({ character, planet, attrs, className = '' }: Props) {
  return (
    <div className={`p-6 ${className}`}>
      <div className="flex items-center gap-3">
        <CharacterAvatar character={character} color={planet?.color} size={48} />
        <div>
          <div className="text-lg font-semibold text-gray-100">{character.name}</div>
          <div className="text-xs text-gray-500">{character.id}</div>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-gray-400">{character.description}</p>
      <table className="mt-4 w-full text-sm">
        <tbody>
          {attrs.map((attr) => (
            <tr key={attr.label} className="border-t border-gray-800">
              <td className="py-2 pr-4 text-gray-500">{attr.label}</td>
              <td className="py-2 text-right text-gray-200">{attr.getValue(character)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})

export default CompareCharacterPanel
