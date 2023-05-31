import { BrowseService } from '../services/browse.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DeckDescriptorDTO } from '../shared/DTO/deckDescriptorDTO';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../shared/header/header.component";
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserComponent } from '../shared/user/user.component';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.page.html',
  styleUrls: ['./browse.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, UserComponent, HeaderComponent]
})
export class BrowsePage {
  descriptors: DeckDescriptorDTO[] = Array<DeckDescriptorDTO>();
  searchQuery: string = ''


  constructor(private router: Router, private browseService: BrowseService) {
    this.browseService.getAllDescriptors(undefined).then(value => this.descriptors = value)
  }

  ionViewDidEnter() {
  }



  loadDeck(dto: DeckDescriptorDTO) {
    this.router.navigateByUrl('/editor/' + dto.id);
  }

  onSearch(event: any) {
    this.searchQuery = event.target.value.toLowerCase();
    this.browseService.getAllDescriptorsWithSearch(undefined, this.searchQuery).then(value => this.descriptors = value)
  }

  onIonInfinite() {
    if (this.searchQuery != '')
      this.browseService.getAllDescriptors(this.descriptors.pop()).then(value => this.descriptors = value)
    else
      this.browseService.getAllDescriptorsWithSearch(this.descriptors.pop(), this.searchQuery).then(value => this.descriptors = value)

  }
}
