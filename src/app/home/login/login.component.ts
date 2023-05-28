import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { LoginService } from '../../services/login.service';
import { NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', '../home.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule, RouterModule, NgIf],
})
export class LoginComponent implements OnInit {
  @Input()
  isSmall = false;

  registerForm: FormGroup;
  loginForm: FormGroup;
  passwordRecoveryForm: FormGroup;


  constructor(private fb: FormBuilder, private loginService: LoginService) {
    this.registerForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
    });
    this.loginForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
    });
    this.passwordRecoveryForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
    });
  }
  ngOnInit() {
  }

  register(email: string, password: string): void {
    this.loginService.register(email, password)
  }

  login(email: string, password: string): void {
    this.loginService.login(email, password)
  }

  loginWithGoogle() {
    this.loginService.loginWithGoogle();
  }


  loginWithFacebook() {
    this.loginService.loginWithFacebook();
  }

  passwordRecovery(email: string): void {
    this.passwordRecovery(email);
  }


}
