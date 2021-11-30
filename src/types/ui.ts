import { Coordinates } from './util';
import { AccessPoint, Stage } from './base';

/**
 * Represents an active drag.
 */
export interface Drag {
  /** the original offset between the cursor beginning and the coordinates in the SVG grid */
  offset: Coordinates;
  /** the current location of the cursor */
  cursor: Coordinates;
  /** the element being dragged */
  element: Stage | AccessPoint;
}

/**
 * The different possible dialogs that can be displayed to the user
 */
export enum DialogOption {
  Save, Load, Export, Clear, Debug
}