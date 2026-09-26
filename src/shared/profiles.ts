// Schermata "Chi gioca?": scelta o creazione del giocatore. Niente password:
// sono bambini, il profilo serve solo a separare i progressi.

import { getStore, lastProfileId, type Profile } from './storage';

export const COLORS = ['#9b6bff', '#ff6f69', '#3ec5a3', '#5fa8ff', '#ffc93c', '#ff8fa3', '#ffa94d', '#6fd08c'];

export function avatar(p: Pick<Profile, 'name' | 'color'>, size = 64): string {
  const letter = (p.name.trim()[0] ?? '?').toUpperCase();
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">
    <circle cx="32" cy="32" r="30" fill="${p.color}"/>
    <text x="32" y="44" text-anchor="middle" font-size="34" font-weight="800" fill="#fff" font-family="Baloo 2, sans-serif">${escape(letter)}</text></svg>`;
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** Mostra i giocatori in `box` e risolve quando ne viene scelto (o creato) uno. */
export function chooseProfile(box: HTMLElement): Promise<Profile> {
  return new Promise((resolve) => {
    const choose = (p: Profile) => {
      lastProfileId.set(p.id);
      resolve(p);
    };

    async function list() {
      const profiles = await getStore().listProfiles();
      if (profiles.length === 0) return form();
      const last = lastProfileId.get();
      profiles.sort((a, b) => Number(b.id === last) - Number(a.id === last));
      box.innerHTML = `<div class="profiles">${profiles.map((p) =>
        `<button class="profile" data-id="${p.id}">${avatar(p)}<span>${escape(p.name)}</span></button>`).join('')}
        <button class="profile new" data-new>${avatar({ name: '+', color: '#d9d2ec' })}<span>Nuovo</span></button></div>`;
      box.querySelectorAll<HTMLElement>('.profile').forEach((b) => {
        b.onclick = () => (b.dataset.new !== undefined ? form() : choose(profiles.find((p) => p.id === b.dataset.id)!));
      });
    }

    function form() {
      let color = COLORS[Math.floor(Math.random() * COLORS.length)];
      box.innerHTML = `<form class="new-profile">
        <div class="preview"></div>
        <input name="name" maxlength="16" placeholder="Come ti chiami?" autocomplete="off" required />
        <div class="colors">${COLORS.map((c) => `<button type="button" style="background:${c}" data-c="${c}" aria-label="colore"></button>`).join('')}</div>
        <button class="big-btn" type="submit">Pronto!</button></form>`;
      const f = box.querySelector('form')!;
      const input = f.querySelector('input')!;
      const paint = () => {
        f.querySelector('.preview')!.innerHTML = avatar({ name: input.value || '?', color }, 80);
        f.querySelectorAll<HTMLElement>('.colors button').forEach((b) => b.classList.toggle('on', b.dataset.c === color));
      };
      input.oninput = paint;
      f.querySelectorAll<HTMLElement>('.colors button').forEach((b) => (b.onclick = () => { color = b.dataset.c!; paint(); }));
      f.onsubmit = async (e) => {
        e.preventDefault();
        const name = input.value.trim();
        if (!name) return;
        const p: Profile = { id: crypto.randomUUID(), name, color };
        await getStore().saveProfile(p);
        choose(p);
      };
      paint();
      input.focus();
    }

    list();
  });
}
