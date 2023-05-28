import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, PopoverController } from '@ionic/angular';

import { RouterModule } from '@angular/router';
import { UserComponent } from '../user/user.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, UserComponent]
})
export class HeaderComponent implements OnInit {

  @Input()
  title: string = "Welcome";

  constructor(public popoverController: PopoverController) { }

  ngOnInit() { }





}

