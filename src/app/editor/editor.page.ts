import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { DeckDTO } from '../shared/DTO/deckDTO';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../shared/header/header.component";
import { IonicModule } from '@ionic/angular';
import { SaveService } from '../services/save.service';
import { UserComponent } from '../shared/user/user.component';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.page.html',
  styleUrls: ['./editor.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, UserComponent, HeaderComponent]
})
export class EditorPage implements OnInit {

  deck: DeckDTO = new DeckDTO()


  constructor(private route: ActivatedRoute, saveService: SaveService) {
    const id = this.route.snapshot.paramMap.get('id')!
    if (id == 'new') {
      this.deck = new DeckDTO()
    } else {
      saveService.getDeck(id).subscribe(value => this.deck = value!)
    }
  }

  ngOnInit(): void {
  }
}
