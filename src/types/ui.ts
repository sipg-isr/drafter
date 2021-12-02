import { Coordinates } from './util';
import { AccessPoint, Stage } from './base';

/**
 * Represents an active drag.
 * @interface
 * @property {Coordinates} offset -
 *   the original offset between the cursor beginning and the coordinates in the SVG grid
 * @property {Coordinates} cursor -
 *   the current absolute location of the cursor
 * @property {Stage | AccessPoint} element -
 *  The element being dragged. The only two kinds of things that can be dragged are:
 *    - stages, which can be dragged around the editor
 *    - AccessPoints, which can be dragged to connect them to other AccessPoint's
 */
export interface Drag {
  offset: Coordinates;
  cursor: Coordinates;
  element: Stage | AccessPoint;
}

/**
 * The different possible dialogs that can be displayed to the user
 * Each one represents a different modal that will be displayed
 */
export enum DialogOption {
  Save, Load, Export, Clear, Debug
}