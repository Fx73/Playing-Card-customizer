import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorHomePage } from './editorhome.page';

describe('EditorHomePage', () => {
  let component: EditorHomePage;
  let fixture: ComponentFixture<EditorHomePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EditorHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
