import { Auth, FacebookAuthProvider, GoogleAuthProvider, createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  auth: Auth = getAuth();

  register(email: string, password: string): void {
    createUserWithEmailAndPassword(this.auth, email, password)
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorCode);
      });
  }

  login(email: string, password: string): void {
    signInWithEmailAndPassword(this.auth, email, password)
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorCode);
      });
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider)
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorCode);
      });
  }


  loginWithFacebook() {
    const provider = new FacebookAuthProvider();
    signInWithPopup(this.auth, provider)
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorCode);
      });
  }

  passwordRecovery(email: string): void {
    sendPasswordResetEmail(this.auth, email)
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorCode);
      });
  }
}
