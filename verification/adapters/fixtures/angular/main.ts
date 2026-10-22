import { Component, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { Navii, NaviiGroup } from '@usenavii/angular';

@Component({
  selector: 'consumer-root',
  standalone: true,
  imports: [Navii, NaviiGroup],
  template: `<main>
    <section id="avatar"><navii-avatar [seed]="seed()" alt="Person" /></section>
    <section id="decorative"><navii-avatar seed="decoration" /></section>
    <section id="image"><navii-avatar [seed]="seed()" [size]="size()" as="img" alt="Photo" /></section>
    <section id="group"><navii-group [seeds]="seeds()" [max]="2" alt="Team" /></section>
    <section id="group-image"><navii-group [seeds]="['a', 'b']" as="img" alt="Team image" /></section>
    <section id="empty"><navii-group [seeds]="empty()" /></section>
    <section id="repeat-a"><navii-group [seeds]="['same', 'same']" /></section>
    <section id="repeat-b"><navii-group [seeds]="['same', 'same']" /></section>
    <button (click)="update()">Update inputs</button>
  </main>`,
})
class Consumer {
  readonly seed = signal('before');
  readonly size = signal(80);
  readonly seeds = signal(['a', 'b', 'c', 'd']);
  readonly empty = signal<string[]>([]);
  update() { this.seed.set('after'); this.size.set(120); this.seeds.set(['new']); this.empty.set(['added']); }
}

bootstrapApplication(Consumer).catch(error => { console.error(error); });
