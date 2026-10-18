/**
 * ShelfPlank — the board a row of spines stands on.
 *
 * M3 · block 3. Split out of CosmereLibrary because the plank is what makes the
 * books sit *on* something: a lit top edge, a shadow cast by the row above, and
 * a front lip that occludes the bottom few pixels of each spine so they look
 * inserted rather than pasted.
 */

interface Props {
  height: number
  /** Shadows fall on the plank when there is a shelf above. */
  shadowed: boolean
  /** Shelf index, for the debug attribute. */
  index: number
}

export default function ShelfPlank({ height, shadowed, index }: Props) {
  return (
    <div
      aria-hidden
      data-plank={index}
      data-shadowed={shadowed}
      className="relative w-full shrink-0"
      style={{ height, marginTop: -1 }}
    >
      {/* The board. */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #4a3524 0%, #2e2015 34%, #1c120b 100%)',
          boxShadow: 'inset 0 1px 0 rgb(255 228 186 / .22)',
        }}
      />
      {/* Shadow cast by the row above, which is what gives the cabinet depth. */}
      {shadowed && (
        <div
          className="absolute inset-x-0 bottom-full h-8"
          style={{
            background: 'linear-gradient(0deg, rgb(0 0 0 / .72), transparent)',
          }}
        />
      )}
      {/* Front lip: occludes the foot of each spine. */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: Math.max(6, height * 0.4),
          background: 'linear-gradient(180deg, #5c442d 0%, #332417 46%, #1a1109 100%)',
          boxShadow: 'inset 0 1px 0 rgb(255 228 186 / .16)',
        }}
      />
      {/* The underside falling into the dark of the next bay. */}
      <div
        className="absolute inset-x-0 top-full h-5"
        style={{ background: 'linear-gradient(180deg, rgb(0 0 0 / .55), transparent)' }}
      />
    </div>
  )
}
