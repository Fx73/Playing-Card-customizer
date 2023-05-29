import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DeckDescriptorDTO } from './../shared/DTO/deckDescriptorDTO';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../shared/header/header.component";
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { SaveService } from '../services/save.service';
import { UserComponent } from '../shared/user/user.component';
import { actionSheetController } from '@ionic/core';

@Component({
  selector: 'app-editorhome',
  templateUrl: './editorhome.page.html',
  styleUrls: ['./editorhome.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, UserComponent, HeaderComponent]
})
export class EditorHomePage {
  descriptors: DeckDescriptorDTO[] = Array<DeckDescriptorDTO>();

  constructor(private router: Router, private saveService: SaveService) {
  }

  ionViewDidEnter() {
    this.saveService.getAllDescriptors().then(value => this.descriptors = value)
  }


  newDeck() {
    this.router.navigateByUrl('/editor/new');
  }

  loadDeck(dto: DeckDescriptorDTO) {
    this.router.navigateByUrl('/editor/' + dto.id);
  }



  async contextOwn(event: any, dto: DeckDescriptorDTO) {
    event.preventDefault();
    event.stopPropagation();
    actionSheetController.create({
      header: dto.title,
      buttons: [
        { text: 'Share', icon: 'share-social', handler: () => this.shareDeck(dto) },
        { text: 'Delete', role: 'destructive', icon: 'trash', handler: () => this.deleteDeck(dto.id) },
        { text: 'Cancel', role: 'cancel' },
      ],
    }).then((as) => {
      as.present();
    });
  }

  shareDeck(dto: DeckDescriptorDTO) {

  }

  deleteDeck(id: string) {
    this.saveService.deleteDeck(id);
    this.descriptors.splice(this.descriptors.findIndex(descriptor => descriptor.id === id), 1);
  }


}
