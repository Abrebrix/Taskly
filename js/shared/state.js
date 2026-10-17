let notesStorage = localStorage.getItem('notes');
// обратилсь в local storage за notes

export let notes = notesStorage ? JSON.parse(notesStorage) : [];
// экспортируем еесли в storage что-то было - массив если не было - пустой список

export function hasNotes() {
  return notes.length > 0;
}

export function getNotes() {
  return notes;
}

export function setNotes(newNotes) {
  notes = newNotes;
  localStorage.setItem('notes', JSON.stringify(notes));
}