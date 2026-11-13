// main function
import { type Note } from "../shared/type.js";
import { notes } from "../shared/state.js";

let editingNoteId: string | null = null;
let saveFlagTimer: ReturnType<typeof setTimeout> | null = null;

export function app() {
  renderNoteList();
  setupFormControls();
  saveNote();
  delNote();
  editNote();
  searchNotes();
}

// скрыть, показать форму создания заметки
function setFormVisibility(visibility: boolean): void {
  const noteForm = document.querySelector('[data-note="form"]');
  if (visibility) {
    noteForm?.classList.remove('note__form--hidden');
  } else {
    noteForm?.classList.add('note__form--hidden');
  }
}

// очищает поля для ввода заметки
function clearInput() {
  const nameInput = document.querySelector<HTMLInputElement>('[data-note="input-name"]');
  const textInput = document.querySelector<HTMLInputElement>('[data-note="textarea"]');
  if (nameInput) nameInput.value = '';
  if (textInput) textInput.value = '';
}

// срабатывает при нажатии кнопки <<Создать заметку>>
// открывает/скрывает форму
function setupFormControls(): void {
  const addNoteBtn = document.querySelector<HTMLButtonElement>('[data-action="add-note"]');
  const cancelNoteBtn = document.querySelector<HTMLButtonElement>('[data-action="cancle-note"]');
  addNoteBtn?.addEventListener('click', () => {
    editingNoteId = null;
    clearInput();
    setFormVisibility(true);
  });
  cancelNoteBtn?.addEventListener('click', () => {
    editingNoteId = null;
    clearInput();
    getSaveNoteFlag(false);
    setFormVisibility(false);
  });
}

// проверяет можно ли сохранить и вызывает
// функцию сохроняющюю заметку в storage
function saveNote(): void {
  const saveNoteBtn = document.querySelector('[data-action="save-note"]');
  const noteList = document.querySelector('[data-note="list"]');

  saveNoteBtn?.addEventListener('click', () => {
    const noteName = document.querySelector<HTMLInputElement>('[data-note="input-name"]');
    const noteText = document.querySelector<HTMLTextAreaElement>('[data-note="textarea"]');
    if (!noteName?.value.trim() || !noteText?.value.trim()) {
      getSaveNoteFlag(false);
      return;
    }

    if (editingNoteId) {
      const noteIndex = notes.findIndex(item => item.id === editingNoteId);
      if (noteIndex === -1) return;
      const previousNote = notes[noteIndex];
      if (!previousNote) return;
      const updatedNote: Note = {
        id: previousNote.id,
        name: noteName.value.trim(),
        text: noteText.value.trim()
      };
      notes.splice(noteIndex, 1);
      notes.unshift(updatedNote);
      localStorage.setItem('notes', JSON.stringify(notes));
      refreshNoteList();
      getSaveNoteFlag(true);
      editingNoteId = null;
      clearInput();
    } else {
      const newNote = createNote();
      addStagedNote(newNote);
      noteList?.prepend(renderNote(newNote));
      getSaveNoteFlag(true);
      const searchInput = document.querySelector<HTMLInputElement>('.search__input');
      if (searchInput?.value) filterNotes(searchInput.value);
      clearInput();
    }
  });
}

function getSaveNoteFlag(flag: boolean): void {
  const noteSaveFlag = document.querySelector<HTMLElement>('[data-note-save="flag"]');
  if (!noteSaveFlag) return;

  if (saveFlagTimer) clearTimeout(saveFlagTimer);
  saveFlagTimer = null;

  noteSaveFlag.classList.remove('note__flag--hidden', 'note__flag--true', 'note__flag--false');
  noteSaveFlag.classList.add(flag ? 'note__flag--true' : 'note__flag--false');
  noteSaveFlag.textContent = flag ? 'Сохранено' : 'Не сохранено';

  saveFlagTimer = setTimeout(() => {
    noteSaveFlag.classList.add('note__flag--hidden');
    saveFlagTimer = null;
  }, 2500);
}

// создает заметку
function createNote(): Note {
  const noteName = document.querySelector<HTMLInputElement>('[data-note="input-name"]');
  const noteText = document.querySelector<HTMLTextAreaElement>('[data-note="textarea"]');

  const newNote: Note = {
    name: noteName?.value as string,
    text: noteText?.value as string,
    id: crypto.randomUUID()
  }
  return newNote;
}

// добавляет заметку в storage
function addStagedNote(note: Note): void {
  notes.unshift(note);
  localStorage.setItem('notes', JSON.stringify(notes));
}

// генерирует ui заметку
function renderNote(noteData: Note) {
  const note = document.createElement('li');
  const itemWrapperText = document.createElement('div');
  const itemWrapperBtn = document.createElement('div');
  const noteName = document.createElement('span');
  const noteText = document.createElement('span');
  const noteBtnDel = document.createElement('button');
  const noteBtnEdit = document.createElement('button');
  const imgEdit = document.createElement('img');
  const imgDel = document.createElement('img');

  imgEdit.src = '../../../img/pencil-icon.svg';
  imgDel.src = '../../../img/cross-icon.svg';

  note.classList.add('aside__note-item', 'note-list__item');
  itemWrapperText.classList.add('note-list__item-wrapper--text');
  itemWrapperBtn.classList.add('note-list__item-wrapper--btn');
  noteName.classList.add('note-list__item-name');
  noteText.classList.add('note-list__item-text');
  noteBtnDel.classList.add('note-list__item-btn--del');
  noteBtnEdit.classList.add('note-list__item-btn--edit');

  note.dataset.id = noteData.id;
  noteName.textContent = noteData.name;
  noteText.textContent = noteData.text;

  noteName.dataset.note = 'name';
  noteText.dataset.note = 'text';
  noteBtnDel.dataset.note = 'btn-del';
  noteBtnEdit.dataset.note = 'btn-edit';

  noteBtnEdit.append(imgEdit);
  noteBtnDel.append(imgDel);
  itemWrapperBtn.append(noteBtnEdit, noteBtnDel);
  itemWrapperText.append(noteName, noteText);
  note.append(itemWrapperText, itemWrapperBtn);

  return note;
}

// рендерит ui список заметок
function renderNoteList(): void {
  const noteList = document.querySelector('[data-note="list"]');
  for (const note of notes) {
    noteList?.append(renderNote(note));
  }
}

function refreshNoteList(): void {
  const noteList = document.querySelector('[data-note="list"]');
  if (!noteList) return;
  noteList.replaceChildren(...notes.map(renderNote));
  const searchInput = document.querySelector<HTMLInputElement>('.search__input');
  if (searchInput?.value) filterNotes(searchInput.value);
}

// Редактирует заметку, выбранную в списке.
function editNote(): void {
  const noteList = document.querySelector('[data-note="list"]');
  noteList?.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-note="btn-edit"]')) return;
    const noteElement = target.closest<HTMLElement>('.note-list__item');
    const note = notes.find(item => item.id === noteElement?.dataset.id);
    if (!note) return;

    editingNoteId = note.id;
    const nameInput = document.querySelector<HTMLInputElement>('[data-note="input-name"]');
    const textInput = document.querySelector<HTMLTextAreaElement>('[data-note="textarea"]');
    if (nameInput) nameInput.value = note.name;
    if (textInput) textInput.value = note.text;
    setFormVisibility(true);
  });
}

// Подключает поиск по заголовку и содержимому заметки.
function searchNotes(): void {
  const searchInput = document.querySelector<HTMLInputElement>('.search__input');
  searchInput?.addEventListener('input', () => filterNotes(searchInput.value));
}

function filterNotes(query: string): void {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  document.querySelectorAll<HTMLElement>('.note-list__item').forEach((element) => {
    const text = `${element.querySelector('[data-note="name"]')?.textContent ?? ''} ${element.querySelector('[data-note="text"]')?.textContent ?? ''}`.toLocaleLowerCase();
    element.hidden = !text.includes(normalizedQuery);
  });
}

// удаляет заметку
function delNote() {
  const noteList = document.querySelector('[data-note="list"]');

  noteList?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    const deleteBtn = target.closest('[data-note="btn-del"]');
    if (!deleteBtn) return;

    const noteElement = target.closest<HTMLElement>('.note-list__item');
    if (!noteElement) return;

    const noteId = noteElement.dataset.id;
    if (!noteId) return;

    const index = notes.findIndex(n => n.id === noteId);
    notes.splice(index, 1);

    localStorage.setItem('notes', JSON.stringify(notes));
    target.closest('.note-list__item')?.remove();
  });
}
