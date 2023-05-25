import { Auth, getAuth } from 'firebase/auth';
import { Component, OnInit } from '@angular/core';
import { IonicModule, PopoverController } from '@ionic/angular';

import { AppComponent } from 'src/app/app.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class UserComponent implements OnInit {
  private static instance: UserComponent;
  name: string = "";
  email: string = "";



  constructor(private router: Router, private popoverController: PopoverController) {
    UserComponent.instance = this;
  }

  ngOnInit() {
    let auth = getAuth();
    this.name = auth.currentUser?.displayName ?? '';
    this.email = auth.currentUser?.email ?? '';
  }

  logout() {
    this.popoverController.dismiss().then(() => {
      this.router.navigateByUrl('home')
    }
    );
  }




}


