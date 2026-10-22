import { createComponent, createSignal } from 'solid-js';
import { render, Dynamic } from 'solid-js/web';
import { Navii, NaviiGroup } from '@usenavii/solid';

render(() => {
  const [seed, setSeed] = createSignal('before');
  const [size, setSize] = createSignal(80);
  const [seeds, setSeeds] = createSignal(['a', 'b', 'c', 'd']);
  const [empty, setEmpty] = createSignal([]);
  const wrap = (id, component, props) => createComponent(Dynamic, {
    component: 'section', id,
    get children() { return createComponent(component, props); },
  });
  return createComponent(Dynamic, {
    component: 'main',
    get children() {
      return [
        wrap('avatar', Navii, { get seed() { return seed(); }, alt: 'Person' }),
        wrap('decorative', Navii, { seed: 'decoration' }),
        wrap('image', Navii, { get seed() { return seed(); }, get size() { return size(); }, as: 'img', alt: 'Photo' }),
        wrap('group', NaviiGroup, { get seeds() { return seeds(); }, max: 2, alt: 'Team' }),
        wrap('group-image', NaviiGroup, { seeds: ['a', 'b'], as: 'img', alt: 'Team image' }),
        wrap('empty', NaviiGroup, { get seeds() { return empty(); } }),
        wrap('repeat-a', NaviiGroup, { seeds: ['same', 'same'] }),
        wrap('repeat-b', NaviiGroup, { seeds: ['same', 'same'] }),
        createComponent(Dynamic, {
          component: 'button', children: 'Update inputs',
          onClick() { setSeed('after'); setSize(120); setSeeds(['new']); setEmpty(['added']); },
        }),
      ];
    },
  });
}, document.getElementById('app'));
