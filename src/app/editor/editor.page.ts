import { ActivatedRoute, Router } from '@angular/router';
import { CardColor, DeckDTO, DeckFormat } from '../shared/DTO/deckDTO';
import { Component, OnInit } from '@angular/core';

import { ColorPickerModule } from 'ngx-color-picker';
import { CommonModule } from '@angular/common';
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
  imports: [IonicModule, CommonModule, FormsModule, UserComponent, HeaderComponent, ColorPickerModule,]
})
export class EditorPage implements OnInit {
  deckFormats = Object.values(DeckFormat)
  cardColors: CardColor[] = Object.values(CardColor)
  cardNumbers: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
  trumpNumbers: string[] = Array.from({ length: 21 }, (_, i) => (i + 1).toString());

  deck: DeckDTO = new DeckDTO()


  constructor(private route: ActivatedRoute, saveService: SaveService) {
    const id = this.route.snapshot.paramMap.get('id')!
    if (id == 'new') {
      this.deck = new DeckDTO()
      this.deck.id = saveService.generateRandomId(8)
    } else {
      saveService.getDeck(id).subscribe(value => this.deck = value!)
    }
  }

  ngOnInit(): void {
  }
  DefaultDeck: { [color in CardColor]: { [number: string]: string }; } = {
    [CardColor.Spade]: {},
    [CardColor.Heart]: {},
    [CardColor.Diamond]: {},
    [CardColor.Club]: {},
  };


  pickImage(color: CardColor, number: string) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg,';
    input.onchange = (e) => {
      const target: HTMLInputElement = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const reader = new FileReader();
        reader.readAsDataURL(target.files[0]);
        reader.onload = (event) => {
          const base64Image = reader.result as string;
          if (number === 'icon')
            this.deck.iconImages[color] = base64Image;
          else
            this.deck.images[color][number] = base64Image;
        };
      }
    };
    input.click();
  }

  pickTrumpImage(number: string) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg,';
    input.onchange = (e) => {
      const target: HTMLInputElement = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const reader = new FileReader();
        reader.readAsDataURL(target.files[0]);
        reader.onload = (event) => {
          const base64Image = reader.result as string;
          this.deck.imagesTrump[number] = base64Image;
        };
      }
    };
    input.click();
  }


  getCardImage(color: CardColor, number: string): string {
    if (number === 'icon')
      return this.deck.iconImages[color];
    else
      return this.deck.images[color][number];
  }

  getCardTrumpImage(number: string) {
    return this.deck.imagesTrump[number];
  }


}
