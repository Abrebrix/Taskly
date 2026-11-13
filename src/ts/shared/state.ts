import { type Note } from "./type.js";
export { notes, noteStatus, setNoteStatus };

let saveData = localStorage.getItem('notes');
let notes: Note[] = saveData ? JSON.parse(saveData) : []
let noteStatus = false;

function setNoteStatus(status: boolean) {
  noteStatus = status;
}