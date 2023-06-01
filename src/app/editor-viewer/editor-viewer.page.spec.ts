import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorViewerPage } from './editor-viewer.page';

describe('EditorViewerPage', () => {
  let component: EditorViewerPage;
  let fixture: ComponentFixture<EditorViewerPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EditorViewerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
