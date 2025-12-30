// src/global.d.ts
import "framer-motion"
import type {
  CSSProperties,
  MouseEventHandler,
  KeyboardEventHandler,
  FocusEventHandler,
  RefObject,
} from "react"

declare module "*.css" {
  const content: { [className: string]: string }
  export default content
}

declare module "framer-motion" {
  interface MotionProps {
    // Common HTML attributes
    className?: string
    style?: CSSProperties | any
    id?: string
    title?: string
    name?: string
    type?: string
    href?: string
    target?: string
    rel?: string
    disabled?: boolean
    tabIndex?: number
    placeholder?: string
    value?: any
    onChange?: (e: any) => void

    // Mouse events
    onClick?: MouseEventHandler<any>
    onMouseDown?: MouseEventHandler<any>
    onMouseUp?: MouseEventHandler<any>
    onMouseMove?: MouseEventHandler<any>
    onMouseEnter?: MouseEventHandler<any>
    onMouseLeave?: MouseEventHandler<any>
    onMouseOver?: MouseEventHandler<any>
    onMouseOut?: MouseEventHandler<any>

    // Keyboard events
    onKeyDown?: KeyboardEventHandler<any>
    onKeyUp?: KeyboardEventHandler<any>
    onKeyPress?: KeyboardEventHandler<any>

    // Focus events
    onFocus?: FocusEventHandler<any>
    onBlur?: FocusEventHandler<any>

    // Relax refs: allow null and callback refs
    ref?: RefObject<any> | ((instance: any) => void)
  }
}
