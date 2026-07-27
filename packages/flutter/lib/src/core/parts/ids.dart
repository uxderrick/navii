/// Part ID pools — port of `packages/core/src/parts/index.ts` (IDs only).
library;

const List<String> bodyIds = [
  'orb', 'tall', 'squat', 'pear', 'pebble',
  'dumpling', 'taro', 'wisp',
];

const List<String> eyeIds = [
  'round', 'wide', 'squint', 'wink', 'sleepy', 'star',
  'heart', 'oval', 'dot', 'cross',
];

const List<String> mouthIds = [
  'smile', 'grin', 'open', 'flat', 'smirk', 'awe',
  'tongue', 'tooth', 'wave', 'dot',
];

const List<String> antennaIds = ['none', 'classic', 'curl', 'double', 'spike'];

const List<String> accessoryIds = [
  'none', 'blush', 'freckles', 'sparkle',
  'glasses', 'eyepatch', 'mole',
];

const List<String> backgroundIds = ['none', 'solid', 'ring'];

/// `'none'` weighted ~2× so plain-headed avatars stay common.
const List<String> topperIds = [
  'none', 'none', 'ears', 'roundEars', 'horn', 'horns', 'tuft', 'cap', 'leaf',
  'headband', 'halo', 'crown', 'antlers',
];

/// `'none'` weighted heavy — most avatars stay plain-chested (not used by base select).
const List<String> outfitIds = [
  'none', 'none', 'none', 'collar', 'scarf', 'bowtie', 'sunflower', 'necklace', 'tie',
];
