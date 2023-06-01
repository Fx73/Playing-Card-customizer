import { EditorGuard } from './editor/editor.guard';
import { EditorViewerPage } from './editor-viewer/editor-viewer.page';
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
    canActivate: [EditorGuard]
  },
  {
    path: 'editor/:id',
    loadComponent: () => import('./editor/editor.page').then(m => m.EditorPage),
    canActivate: [EditorGuard]
  },
  {
    path: 'browse',
    loadComponent: () => import('./browse/browse.page').then((m) => m.BrowsePage),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./editor-viewer/editor-viewer.page').then((m) => m.EditorViewerPage),
  },
];
