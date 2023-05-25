import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateEditorComponent } from './loggin.component';
import { IonicModule } from '@ionic/angular';

describe('CreateCustomComponent', () => {
  let component: CreateEditorComponent;
  let fixture: ComponentFixture<CreateEditorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CreateEditorComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
