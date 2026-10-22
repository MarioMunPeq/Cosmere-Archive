/**
 * ShelfPlank — the board a row of spines stands on.
 *
 * The board is deliberately only as wide as the run it carries. A plank that
 * spans the whole wall is what made the old shelves read as empty panels with a
 * few books abandoned on them. The brass plate is fixed to the front edge, set
 * horizontally, and allowed to use its full text: a name cut short is worse
 * than a plate that is a little wider.
 */

interface Props {
  height: number
  /** Shadows fall on the plank when there is a shelf above. */
  shadowed: boolean
  /** Shelf index, for the debug attribute. */
  index: number
  /** Printed on the brass plate. Omitted on everything but the bottom board. */
  label?: string
  note?: string
}

export default function ShelfPlank({ height, shadowed, index, label, note }: Props) {
  return (
    <div
      aria-hidden={label ? undefined : true}
      data-plank={index}
      data-shadowed={shadowed}
      className="library-plank"
      style={{ height, marginTop: -1 }}
    >
      <div className="library-plank__board" />

      {label && (
        <span className="library-plate">
          <span className="library-plate__name">{label}</span>
          {note && <span className="library-plate__note">{note}</span>}
        </span>
      )}

      {shadowed && <div className="library-plank__shadow" />}
      <div className="library-plank__lip" style={{ height: Math.max(7, height * 0.42) }} />
      <div className="library-plank__drop" />
    </div>
  )
}
