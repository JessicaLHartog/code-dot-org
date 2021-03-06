/** @file Type definitions (React and otherwise) specific to Gamelab */

import _ from 'lodash';
import React from 'react';

/**
 * @typedef {Object} Vector2
 * @property {number} x
 * @property {number} y
 */
const Vector2 = React.PropTypes.shape({
  x: React.PropTypes.number.isRequired,
  y: React.PropTypes.number.isRequired
});

/*
 * MIGRATION NOTES - 30 June 2016 bbuchanan
 *  The old shape of animations is an array of animation metadata.
 *    [
 *      {animation},
 *      {animation}
 *    ]
 *
 *  The new shape is an object with animation and cache components
 *    {
 *     orderedKeys: [ AnimationKey, AnimationKey ],
 *     propsByKey: {
 *       AnimationKey: {AnimationProps},
 *       AnimationKey: {AnimationProps}
 *     }
 *   }
 *
 *  AnimationProps should include the actual spritesheet (as blob and dataURI),
 *  dimensions and frame dimensions, frameDelay, looping, name, last save time, version IDs,
 *  URL to fetch the animation from the API, etc.
 *
 *  We serialize a smaller set of information {SerializedAnimationProps}.
 *
 *  We migrate if the old style gets loaded. See setInitialAnimationList() in
 *  animationListModule.js for how this works.
 */

/**
 * @typedef {string} AnimationKey
 * A string that uniquely identifies an animation within the project, usually
 * a UUID.
 */
export const AnimationKey = React.PropTypes.string;

/**
 * A subset of AnimationProps that gets saved with the project JSON.
 * @typedef {Object} SerializedAnimationProps
 * @property {string} name
 * @property {?string} sourceUrl
 * @property {Vector2} frameSize
 * @property {number} frameCount
 * @property {bool} looping
 * @property {number} frameDelay
 * @property {string} [version] - S3 version key
 */
const serializedAnimationPropsShape = {
  name: React.PropTypes.string.isRequired,
  sourceUrl: React.PropTypes.string,
  frameSize: Vector2.isRequired,
  frameCount: React.PropTypes.number.isRequired,
  looping: React.PropTypes.bool.isRequired,
  frameDelay: React.PropTypes.number.isRequired,
  version: React.PropTypes.string
};

/**
 * @typedef {Object} AnimationProps
 * @property {string} name
 * @property {string} sourceUrl - If provided, points to an external spritesheet.
 *           (From the animation library or some other outside source)
 *           Otherwise this is a custom spritesheet stored via the animations API
 *           and we look it up by key.
 * @property {Vector2} frameSize
 * @property {number} frameCount
 * @property {bool} looping
 * @property {number} frameDelay
 * @property {string} [version] - S3 version key
 *
 * @property {boolean} loadedFromSource - False at first, true after load successful.
 * @property {Vector2} sourceSize
 * @property {boolean} saved - True if the current blob represents the last thing
 *           we uploaded to the animations API, false if we have a pending change
 *           to save.
 * @property {Blob} blob - The spritesheet as a data blob (can be uploaded
 *           directly to the animations API via PUT).
 * @property {string} dataURI - The spritesheet as a dataURI (can be set as src
 *           on an image).
 */
const animationPropsShape = _.assign({}, serializedAnimationPropsShape, {
  loadedFromSource: React.PropTypes.bool,
  sourceSize: Vector2,
  saved: React.PropTypes.bool,
  blob: React.PropTypes.object,
  dataURI: React.PropTypes.string,
  hasNewVersionThisSession: React.PropTypes.bool
});
export const AnimationProps = React.PropTypes.shape(animationPropsShape);

/**
 * @param {AnimationProps} animation
 * @return {SerializedAnimationProps}
 */
function getSerializedAnimationProps(animation) {
  // Only serialize out properties we need to reconstruct the animation when
  // we load back in - dropping the cached spritesheet, invalidation flags, etc.
  return _.pick(animation, [
    'name',
    'sourceUrl',
    'frameSize',
    'frameCount',
    'looping',
    'frameDelay',
    'version'
  ]);
}

/**
 * @typedef {Object} AnimationList
 * @property {AnimationKey[]} orderedKeys - Animation keys in project order
 * @property {Object.<AnimationKey, AnimationProps>} propsByKey
 */
export const AnimationList = React.PropTypes.shape({
  orderedKeys: React.PropTypes.arrayOf(AnimationKey).isRequired,
  propsByKey: React.PropTypes.objectOf(AnimationProps).isRequired
});

/**
 * @typedef {Object} SerializedAnimationList
 * @property {AnimationKey[]} orderedKeys - Animations in project order
 * @property {Object.<AnimationKey, SerializedAnimationProps>} propsByKey
 */

/**
 * Converts the full AnimationList to the serializable subset of itself.
 * Two transformations happen when we serialize animations out.
 * 1. We only save a subset of animation attributes - see getSerializedAnimation
 * 2. We stop saving animation data for any animations not in the project
 *    animation list - we should clean this up on delete, but in case things
 *    get in an inconsistent state we clean it up here.
 * @param {AnimationList} animationList
 * @return {SerializedAnimationList}
 */
export function getSerializedAnimationList(animationList) {
  return {
    orderedKeys: animationList.orderedKeys,
    propsByKey: _.pick(
        _.mapValues(animationList.propsByKey, getSerializedAnimationProps),
        animationList.orderedKeys)
  };
}

/**
 * @param {!SerializedAnimationList} serializedAnimationList
 * @throws {Error} if the list is not in a valid format.
 */
export function throwIfSerializedAnimationListIsInvalid(serializedAnimationList) {
  if (typeof serializedAnimationList !== 'object' || serializedAnimationList === null) {
    throw new Error(`serializedAnimationList is not an object`);
  }

  const {orderedKeys, propsByKey} = serializedAnimationList;
  if (!Array.isArray(orderedKeys)) {
    throw new Error(`orderedKeys is not an array`);
  }
  if (typeof propsByKey !== 'object' || propsByKey === null) {
    throw new Error(`propsByKey is not an object`);
  }

  // Check shape of propsByKey objects
  for (const animationKey in propsByKey) {
    ['name', 'frameSize', 'frameCount', 'looping', 'frameDelay'].forEach(requiredPropName => {
      if (!propsByKey[animationKey].hasOwnProperty(requiredPropName)) {
        throw new Error(`Required prop '${requiredPropName}' is missing from animation with key '${animationKey}'.`);
      }
    });
  }

  // Check for duplicates in the orderedKeys array
  let knownKeys = {};
  orderedKeys.forEach(key => {
    if (knownKeys.hasOwnProperty(key)) {
      throw new Error(`Key "${key}" appears more than once in orderedKeys`);
    }
    knownKeys[key] = true;
  });

  // The ordered keys set and the keys from propsByKey should match (but can
  // be in a different order)
  let orderedKeysNotInProps = orderedKeys.slice();
  let propsNotInOrderedKeys = Object.keys(propsByKey);
  for (let i = propsNotInOrderedKeys.length - 1; i >= 0; i--) {
    let j = orderedKeysNotInProps.indexOf(propsNotInOrderedKeys[i]);
    if (j !== -1) {
      propsNotInOrderedKeys.splice(i, 1);
      orderedKeysNotInProps.splice(j, 1);
    }
  }
  if (orderedKeysNotInProps.length > 0) {
    throw new Error('Animation List has ' +
        (orderedKeysNotInProps.length === 1 ? 'key' : 'keys') + ' ' +
        orderedKeysNotInProps.map(k => `"${k}"`).join(', ') +
        ' but not associated props');
  }
  if (propsNotInOrderedKeys.length > 0) {
    throw new Error('Animation List has a props for ' +
        propsNotInOrderedKeys.map(k => `"${k}"`).join(', ') +
        ' but ' +
        (propsNotInOrderedKeys.length === 1 ? "that key isn't" : "those keys aren't") +
        ' in the orderedKeys list');
  }

  // Catch duplicate names (not a fatal problem, but not great either)
  let knownNames = {};
  for (let key in propsByKey) {
    let name = propsByKey[key].name;
    if (knownNames.hasOwnProperty(name)) {
      throw new Error(`Name "${name}" appears more than once in propsByKey`);
    }
    knownNames[name] = true;
  }
}
