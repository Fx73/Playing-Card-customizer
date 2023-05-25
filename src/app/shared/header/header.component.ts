import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, PopoverController } from '@ionic/angular';
import { NgClass, NgIf } from '@angular/common';

import { RouterModule } from '@angular/router';
import { UserComponent } from '../user/user.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, NgIf, NgClass],
})
export class HeaderComponent implements OnInit {

  @Input()
  title: string = "Welcome";

  constructor(public popoverController: PopoverController) { }

  ngOnInit() { }


  async presentPopover(e: Event) {
    let popover: HTMLIonPopoverElement;
    //TODO
    if (false) {
      popover = await this.popoverController.create({
        component: UserComponent,
        event: e,
      });
    } else {
      popover = await this.popoverController.create({
        component: NoUserPopoverComponent,
        event: e,
      });
    }

    await popover.present();

    await popover.onDidDismiss();

  }

}


@Component({
  template: `<ion-content class="ion-padding">Go to homepage to log in</ion-content>`,
  standalone: true,
  imports: [IonicModule],
})
class NoUserPopoverComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

}
