import { ActivatedRoute, Router } from '@angular/router';
import { CardColor, DeckDTO, DeckFormat } from '../shared/DTO/deckDTO';
import { Component, OnInit, } from '@angular/core';

import { ColorPickerModule } from 'ngx-color-picker';
import { CommonModule } from '@angular/common';
import { DefaultCard } from './default-card';
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

  cardPreviews: {
    [color in CardColor]: { [number: string]: string };
  } = {
      [CardColor.Spade]: {},
      [CardColor.Heart]: {},
      [CardColor.Diamond]: {},
      [CardColor.Club]: {},
    }

  img!: string;


  constructor(private route: ActivatedRoute, saveService: SaveService) {
    const id = this.route.snapshot.paramMap.get('id')!
    if (id == 'new') {
      this.deck = new DeckDTO()
      this.deck.id = saveService.generateRandomId(8)
      this.refreshPreviews()
    } else {
      saveService.getDeck(id).subscribe(value => { this.deck = value!; this.refreshPreviews() })
    }
  }

  ngOnInit(): void {
  }


  refreshPreviews() {
    for (const color of Object.values(CardColor)) {
      for (const number of this.cardNumbers) {
        this.createFinalImage(color, number).then(img => this.cardPreviews[color][number] = img)
      }
    }
  }




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
    const image = this.cardPreviews[color][number];
    return image ? image : '';

  }

  getCardTrumpImage(number: string) {
    return this.deck.imagesTrump[number];
  }


  createFinalImage(color: CardColor, number: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject('Canvas context is null');
        return;
      }

      const backgroundImg = new Image();
      backgroundImg.src = 'assets/Standard/layout' + this.deck.format + '.png'

      const borderImg = new Image();
      borderImg.src = 'assets/Standard/border' + this.deck.format + '.png'

      const colorSymbolImg = new Image();
      colorSymbolImg.src = this.deck.iconImages[color] ? this.deck.iconImages[color] : 'assets/Standard/icon' + color + '.png'

      const centerImg = new Image();


      backgroundImg.onload = async () => {
        canvas.width = backgroundImg.width
        canvas.height = backgroundImg.height

        if (this.deck.images[color][number])
          centerImg.src = this.deck.images[color][number]
        else
          centerImg.src = await new DefaultCard(backgroundImg.width, backgroundImg.height).getDefaultPattern(color, number)

        await new Promise<void>((resolve) => {
          colorSymbolImg.onload = () => {
            resolve();
          };
          borderImg.onload = () => {
            resolve();
          };
          centerImg.onload = () => {
            resolve();
          };
        });

        //Fond
        ctx.drawImage(backgroundImg, 0, 0)
        if (this.deck.drawBorder) ctx.drawImage(borderImg, 0, 0)

        //TextProperty
        ctx.font = '160px Arial' // Définir la police et la taille du texte
        ctx.fillStyle = this.deck.colorMapping[color]()

        //D'un coté
        ctx.drawImage(colorSymbolImg, 40, 180, 2 * colorSymbolImg.width / 3, 2 * colorSymbolImg.height / 3)
        ctx.fillText(number, 44, 152)

        //De l'autre coté
        ctx.rotate(Math.PI);
        ctx.drawImage(colorSymbolImg, 40 - canvas.width, 180 - canvas.height, 2 * colorSymbolImg.width / 3, 2 * colorSymbolImg.height / 3);
        ctx.fillText(number, 44 - canvas.width, 152 - canvas.height)


        //Milieu
        ctx.rotate(-Math.PI);
        ctx.drawImage(centerImg, 0, 0);


        const finalImage = canvas.toDataURL('image/png');
        resolve(finalImage);
      };

      backgroundImg.onerror = () => {
        reject('Failed to load background image')
      };
      colorSymbolImg.onerror = () => {
        reject('Failed to load color symbol image')
      };
    });
  }


}
