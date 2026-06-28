export { default as Navii } from './Navii.svelte';
export { default as NaviiGroup } from './NaviiGroup.svelte';

export {
  createAvatar,
  selectAvatar,
  renderAvatar,
  renderGroup,
  renderGroupTiles,
  seed,
  seedFromEmail,
  normalizeEmail,
} from '@usenavii/core';

export type {
  AvatarSpec,
  AvatarOptions,
  GroupOptions,
  GroupTiles,
  MoodId,
  Palette,
  SeedFields,
  SeedOptions,
} from '@usenavii/core';
