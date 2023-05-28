import { AccountComponent } from "./account/account.component";
import { Component } from '@angular/core';
import { HeaderComponent } from "../shared/header/header.component";
import { IonicModule } from '@ionic/angular';
import { LoginComponent } from './login/login.component';
import { NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserComponent } from '../shared/user/user.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, UserComponent, HeaderComponent, RouterModule, LoginComponent, NgIf, AccountComponent]
})
export class HomePage {
  constructor() {
  }

  isUserLoggedIn() {
    return UserComponent.user !== null
  }
}
