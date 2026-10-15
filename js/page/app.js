import { notes, hasNotes } from '../shared/state.js';

let saveFlagTimer = null;

function showNoteSaveFlag() {
  const noteSaveFlag = document.querySelector('[data-note-save="flag"]');
  const isNotEmpty = noteNotEmpty();

  // Отменяем предыдущий таймер, если он есть
  if (saveFlagTimer) {
    clearTimeout(saveFlagTimer);
    saveFlagTimer = null;
  }

  // 1. Показать флаг
  noteSaveFlag.classList.remove('note__flag--hidden');
  noteSaveFlag.classList.toggle('note__flag--true', isNotEmpty);
  noteSaveFlag.classList.toggle('note__flag--false', !isNotEmpty);
  noteSaveFlag.textContent = isNotEmpty ? 'Сохранено' : 'Не сохранено';

  // 2. Через 2.5 сек — плавно скрыть
  saveFlagTimer = setTimeout(() => {
    noteSaveFlag.classList.add('note__flag--hidden');

    // Через 0.5 сек (после transition) — очистить
    setTimeout(() => {
      noteSaveFlag.textContent = '';
      noteSaveFlag.classList.remove('note__flag--true', 'note__flag--false');
    }, 500);

    saveFlagTimer = null;
  }, 2000);
}


function showWorkspace() {
  const addNoteBtn = document.querySelector('[data-action="add-note"]');

  addNoteBtn.addEventListener('click', () => {
    const noteForm = document.querySelector('[data-note="form"]');

    noteForm.classList.remove('note__form--hidden');
  });
}


function hideWorkspace() {
  const cancleNoteBtn = document.querySelector('[data-action="cancle-note"]');
  cancleNoteBtn.addEventListener('click', () => {
    const workspace = document.querySelector('[data-note="form"]');

    workspace.classList.add('note__form--hidden')
  })
}


function clearDomNotes() {
  const noteList = document.querySelector('[data-note="list"]');
  const noteFlag = document.querySelector('[data-note="flag"]');

  noteList.innerHTML = '';
  noteFlag.textContent = '';
}


function renderNote(noteData) {
  const note = document.createElement('li');
  const itemWrapper = document.createElement('div');
  const noteName = document.createElement('span');
  const noteText = document.createElement('span');
  const noteBtn = document.createElement('button'); // на потом когда добавишь удаление заметок

  note.classList.add('aside__note-item');
  itemWrapper.classList.add('aside__note-item-wrapper');

  note.dataset.id = noteData.id;
  noteName.textContent = noteData.name;
  noteText.textContent = noteData.text;

  noteName.dataset.note = 'name';
  noteText.dataset.note = 'text';
  noteBtn.dataset.note = 'btn';

  itemWrapper.append(noteName, noteText);
  note.append(itemWrapper, noteBtn);

  return note;
}


function showNotes() {
  const noteList = document.querySelector('[data-note="list"]');
  clearDomNotes();
  if (hasNotes()) {
    for (let i = 0; i < notes.length; i++) {
      noteList.append(renderNote(notes[i]));
    }
  } else {
    const noteListFlag = document.querySelector('[data-note="flag"]');
    noteListFlag.textContent = 'Нет заметок';
  }
}


function noteNotEmpty() {
  const noteName = document.querySelector('[data-note="input-name"]');
  const noteText = document.querySelector('[data-note="textarea"]');

  return noteName.value.trim() !== '' && noteText.value.trim() !== '';
}


function clearInput() {
  const noteName = document.querySelector('[data-note="input-name"]');
  const noteText = document.querySelector('[data-note="textarea"]');

  noteName.value = '';
  noteText.value = '';
}


function saveNote() {
  const saveNoteBtn = document.querySelector('[data-action="save-note"]');
  const noteName = document.querySelector('[data-note="input-name"]');
  const noteText = document.querySelector('[data-note="textarea"]');

  saveNoteBtn.addEventListener('click', () => {
    if (noteNotEmpty()) {
      const note = {
        id: Date.now(),
        name: noteName.value,
        text: noteText.value,
      };

      notes.push(note);
      localStorage.setItem('notes', JSON.stringify(notes));

      showNoteSaveFlag();
      clearInput();
      showNotes();
    } else {
      showNoteSaveFlag();
    }
  })
}


export function app() {
  showWorkspace();
  hideWorkspace();
  saveNote();
  showNotes();
}