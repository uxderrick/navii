import type { AvatarOptions, GroupOptions, StyleHint } from '@usenavii/core';

interface PresentationProps {
  as?: 'svg' | 'img';
  class?: string;
  style?: string;
  styleHint?: StyleHint;
  sanitize?: boolean;
  alt?: string;
}

export interface NaviiProps extends Omit<AvatarOptions, 'style'>, PresentationProps {
  seed: string;
}

export interface NaviiGroupProps extends Omit<GroupOptions, 'style'>, PresentationProps {
  seeds: string[];
}
