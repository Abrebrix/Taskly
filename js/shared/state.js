let notesStorage = localStorage.getItem('notes') ;
// обратилсь в local storage за notes

export let notes = notesStorage ? JSON.parse(notesStorage) : [];
// экспортируем еесли в storage что-то было - массивб если не было - пустой список

export function hasNotes() {
  return notes.length > 0;
}

