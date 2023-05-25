import { Component } from '@angular/core';
import { CreateEditorComponent } from './loggin/loggin.component';
import { HeaderComponent } from "../shared/header/header.component";
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { UserComponent } from '../shared/user/user.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, UserComponent, HeaderComponent, RouterModule]
})
export class HomePage {
  constructor() { }
}
