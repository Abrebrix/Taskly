import { app } from './page/app.js';

const pageFunc = document.querySelector('body')?.dataset.page;

switch (pageFunc) {
  case 'app': app();
    break;
}