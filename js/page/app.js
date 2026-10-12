import { localNoteList } from '../shared/state.js';

function showWorkspace() {
  const addNoteBtn = document.querySelector('[data-action="add-note"]');

  addNoteBtn.addEventListener('click', () => {
    const workspace = document.querySelector('[data-workspace]');

    workspace.classList.remove('main-workspace--hidden');
  });
}

export function app() {
  showWorkspace();
}