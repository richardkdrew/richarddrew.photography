/**
 * Image Viewer Type Definitions
 * TypeScript interfaces and types for the image viewer component
 */

/**
 * Image Viewer State
 * Tracks viewer activation, current image, and navigation context
 */
export interface ViewerState {
  /** Whether viewer is currently active (visible) */
  active: boolean

  /** Index of currently displayed image (0-based) */
  currentIndex: number

  /** Total number of images in gallery */
  totalImages: number

  /** Whether viewer is enabled (based on gallery column count) */
  enabled: boolean
}

/**
 * Image Data
 * Contains all information needed to display an image in viewer
 */
export interface ImageData {
  /** Unique identifier for the image */
  id: string

  /** Primary image source URL */
  src: string

  /** Responsive srcset for different viewport sizes */
  srcset: string

  /** WebP srcset for different viewport sizes */
  webpSrcset?: string

  /** Alt text for accessibility */
  alt: string

  /** Image width in pixels (for aspect ratio) */
  width: number

  /** Image height in pixels (for aspect ratio) */
  height: number

  /** Position in gallery (0-based index) */
  index: number

  /** Reference to the original picture element from gallery */
  pictureElement?: HTMLPictureElement
}

/**
 * Navigation Event Detail
 * Payload for viewer navigation events
 */
export interface NavigationEventDetail {
  /** Direction of navigation */
  direction: 'next' | 'prev'

  /** Index before navigation */
  fromIndex: number

  /** Index after navigation */
  toIndex: number

  /** Trigger source (keyboard, button, swipe) */
  trigger: 'keyboard' | 'button' | 'swipe'
}
