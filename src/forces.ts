/**
 * Define all the physical forces at play inside the editor
 */

import { Force } from 'd3';
import { Model, RemoteMethod, EditorNode, MethodLink } from './types';
import { List } from 'immutable';

/**
 * All methods are strongly attracted to the model that defines them
 */
export function forceParentModelAttraction(models: List<Model>, strength: number = 1): Force<EditorNode, MethodLink> {
  const force = (alpha: number) => {
    models.forEach(model => {
      // For each model...
      model.methods.forEach(method => {
        // Each method of the model should be attracted to it
        method.vx! += (model.x! - method.x!) * alpha * strength;
        method.vy! += (model.y! - method.y!) * alpha * strength;
      });
    });
  };

  return force;
};
