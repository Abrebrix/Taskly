import {hasNotes, getNotes, setNotes } from '../shared/state.js';

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
    editHeightNoteForm(true);
  });
}


function hideWorkspace() {
  const cancleNoteBtn = document.querySelector('[data-action="cancle-note"]');
  cancleNoteBtn.addEventListener('click', () => {
    const workspace = document.querySelector('[data-note="form"]');

    workspace.classList.add('note__form--hidden');
    editHeightNoteForm(false);
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
  const itemWrapperText = document.createElement('div');
  const itemWrapperBtn = document.createElement('div');
  const noteName = document.createElement('span');
  const noteText = document.createElement('span');
  const noteBtnDel = document.createElement('button');
  const noteBtnEdit = document.createElement('button');
  const imgEdit = document.createElement('img');
  const imgDel = document.createElement('img');

  imgEdit.src = '../../img/pencil-icon.svg';
  imgDel.src = '../../img/cross-icon.svg';

  note.classList.add('aside__note-item');
  note.classList.add('note-list__item');
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


function showNotes() {
  const noteList = document.querySelector('[data-note="list"]');
  clearDomNotes();

  if (hasNotes()) {
    const currentNote = getNotes();
    for (let i = 0; i < currentNote.length; i++) {
      noteList.append(renderNote(currentNote[i]));
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

      const currentNote = getNotes();
      currentNote.unshift(note);
      setNotes(currentNote);

      showNoteSaveFlag();
      clearInput();
      showNotes();
    } else {
      showNoteSaveFlag();
    }
  })
}


function delNote() {
  const noteList = document.querySelector('[data-note="list"]');

  noteList.addEventListener('click', (e) => {
    if (e.target.closest('[data-note="btn-del"]')) {
      const note = e.target.closest('.note-list__item');
      const noteId = Number(note.dataset.id);

      let currentNotes = getNotes();
      currentNotes = currentNotes.filter(n => n.id !== noteId);
      setNotes(currentNotes);

      showNotes();
    }
  });
}


export function app() {
  showWorkspace();
  hideWorkspace();
  saveNote();
  showNotes();
  delNote();
}

// Удалить notes и заменить на getNotes