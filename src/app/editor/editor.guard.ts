import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserComponent } from '../shared/user/user.component';

@Injectable({
  providedIn: 'root'
})
export class EditorGuard {

  constructor(private router: Router) { }

  async canActivate(): Promise<boolean> {
    if (UserComponent.user)
      return true
    try {
      const isLogged = await UserComponent.guardWaitForAuth();
      if (!isLogged) {
        this.router.navigate(['/home']);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in Editor Guard:', error);
      return false;
    }
  }

}
