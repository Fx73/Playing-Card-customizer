import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'editor',
    loadComponent: () => import('./editorHome/editorhome.page').then((m) => m.EditorHomePage),
  },
  {
    path: 'editor/:id',
    loadComponent: () => import('./editor/editor.page').then(m => m.EditorPage)
  },
];
