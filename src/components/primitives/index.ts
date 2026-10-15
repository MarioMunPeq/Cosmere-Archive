/**
 * primitives/ — the 14 building blocks every screen is made of.
 *
 * M2 · Block 1. Nothing in here knows about the Cosmere: no character, no
 * planet, no book. That is the point. Each component owns one decision that
 * would otherwise be re-taken at every call site — focus rings, touch target
 * minimums, `aria-current`, roving tabindex — and makes it impossible to get
 * that decision wrong twice.
 *
 * Rule for adding to this folder: if a component would need to know what it is
 * displaying, it does not belong here.
 */

export { default as Button } from './Button'
export type { ButtonVariant, ButtonSize, ButtonTone } from './Button'

export { default as Link } from './Link'
export type { LinkTone, LinkToneMode } from './Link'

export { default as Chip, ToggleChip } from './Chip'
export type { ChipTone, ChipSize } from './Chip'

export { default as Field } from './Field'

export { default as Dialog } from './Dialog'

export { default as Tabs, TabPanel } from './Tabs'
export type { TabItem } from './Tabs'

export { default as Tooltip } from './Tooltip'

export { ToastProvider, useToast } from './Toast'
export type { ToastTone } from './Toast'

export { default as SkeletonBlock, SkeletonText, SkeletonGrid, SkeletonPage } from './Skeleton'

export { default as EmptyState } from './EmptyState'

export { default as SegmentedControl } from './SegmentedControl'
export type { Segment } from './SegmentedControl'

export { default as ScrollArea } from './ScrollArea'

export { default as VisuallyHidden } from './VisuallyHidden'

export { default as Icon, RESULT_GLYPHS, ICON_VIEWBOX } from './Icon'
