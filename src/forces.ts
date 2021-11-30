/**
 * Define all the physical forces at play inside the editor
 * The forces are currently unused
 */

import { Force } from 'd3';
import { Asset, Node, RemoteMethod } from './types';
import { List } from 'immutable';

/**
 * All methods are attracted to the asset that defines them
 */
// export function forceParentAssetAttraction(nodes: Set<Node>, strength: number = 1): Force<Node, any> {
//   return (alpha: number) => {
//     nodes.forEach(node => {
//       // For each asset...
//       nodes.inputs.forEach(input => {
//         // Each method of the asset should be attracted to it
//         method.vx! += (asset.x! - method.x!) * alpha * strength;
//         method.vy! += (asset.y! - method.y!) * alpha * strength;
//       });
//     });
//   };
//
// };