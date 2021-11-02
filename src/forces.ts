/**
 * Define all the physical forces at play inside the editor
 * The forces are currently unused
 */

import { Force } from 'd3';
import { Model, Node, RemoteMethod } from './types';
import { List } from 'immutable';

/**
 * All methods are attracted to the model that defines them
 */
// export function forceParentModelAttraction(nodes: Set<Node>, strength: number = 1): Force<Node, any> {
//   return (alpha: number) => {
//     nodes.forEach(node => {
//       // For each model...
//       nodes.inputs.forEach(input => {
//         // Each method of the model should be attracted to it
//         method.vx! += (model.x! - method.x!) * alpha * strength;
//         method.vy! += (model.y! - method.y!) * alpha * strength;
//       });
//     });
//   };
//
// };