import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoginService } from 'src/app/services/login.service';
import { NgIf } from '@angular/common';
import { UserComponent } from 'src/app/shared/user/user.component';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss', '../home.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, NgIf],
})
export class AccountComponent {
  get user(): User | null {
    return UserComponent.user
  }
  set user(value: User | null) {
    UserComponent.user = value
  }

  name: string = '';
  email: string = '';
  password: string = '';
  password2: string = '';

  constructor(private loginService: LoginService) {
    if (UserComponent.user) {
      this.name = UserComponent.user.displayName ?? ''
      this.email = UserComponent.user.email ?? ''
    }
  }

  emailVerified(): boolean {
    return UserComponent.user!.emailVerified
  }

  saveProfile() {
    this.loginService.updateProfile(this.email, this.name)
  }
  savePassword() {
    if (this.password === this.password2)
      this.loginService.updatePassword(this.password)
  }
  resendEmail() {
    this.loginService.resendEmail()
  }
  logOut() {
    this.loginService.logOut()
  }

}
