import { ActivatedRoute, Router } from '@angular/router';
import { CardColor, DeckDTO, DeckFormat } from '../shared/DTO/deckDTO';
import { Component, OnInit, } from '@angular/core';

import { ColorPickerModule } from 'ngx-color-picker';
import { CommonModule } from '@angular/common';
import { DeckDescriptorDTO } from '../shared/DTO/deckDescriptorDTO';
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
  readonly deckFormats = Object.values(DeckFormat)
  readonly cardColors: CardColor[] = Object.values(CardColor)
  readonly cardNumbers: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
  readonly trumpNumbers: string[] = Array.from({ length: 21 }, (_, i) => (i + 1).toString());
  readonly getFontFileName = (color: CardColor): string => `font${color.toLowerCase()}`;
  readonly input: HTMLInputElement;

  deck: DeckDTO = new DeckDTO('')
  deckDescriptor: DeckDescriptorDTO = new DeckDescriptorDTO('')

  cardPreviews: {
    [color in CardColor]: { [number: string]: string };
  } = {
      [CardColor.Spade]: {},
      [CardColor.Heart]: {},
      [CardColor.Diamond]: {},
      [CardColor.Club]: {},
    }



  constructor(private route: ActivatedRoute, private router: Router, private saveService: SaveService) {
    const id = this.route.snapshot.paramMap.get('id')!
    if (id == 'new') {
      this.deck = new DeckDTO(saveService.generateRandomId(8))
      this.deckDescriptor = new DeckDescriptorDTO(this.deck.id)
      window.history.replaceState({}, 'Deck Editor', 'editor/' + this.deck.id);

      for (const color of Object.values(CardColor))
        this.resetIconImage(color)

      this.saveService.addDescriptor(this.deckDescriptor)
      this.saveService.addDeck(this.deck)
      for (const color of Object.values(CardColor)) {
        this.refreshPreviewsOfColour(color)
      }
    } else {
      saveService.getDescriptorById(id).then(value => this.deckDescriptor = value!)
      saveService.getDeckById(id).then(value => {
        if (value) {
          this.deck = value
          for (const color of Object.values(CardColor)) {
            this.refreshPreviewsOfColour(color)
          }
        } else {
          this.router.navigate(['/editor']);
        }
      })
    }

    this.input = document.createElement('input')
    this.input.type = 'file';
    this.input.accept = 'image/png, image/jpeg';
  }

  ngOnInit(): void {
  }

  //#region Refresh
  refreshDescriptor() {
    this.saveService.updateDescriptor(this.deckDescriptor)
  }

  refreshAllPreviews() {
    this.saveService.updateDeck(this.deck)
    for (const color of Object.values(CardColor)) {
      this.refreshPreviewsOfColour(color)
    }
  }
  refreshPreviewsOfColour(color: CardColor) {
    for (const number of this.cardNumbers)
      this.refreshPreview(color, number)

    if (this.deck.format === DeckFormat.Tarot)
      this.refreshPreview(color, 'Kn')

  }
  refreshPreview(color: CardColor, number: string) {
    this.createFinalImage(color, number).then(img => this.cardPreviews[color][number] = img)
  }

  resetIconImage(color: CardColor) {
    this.deck.iconImages[color] = 'assets/Standard/icon' + color + '.png'
  }
  //#endregion

  //#region Pick Image
  private pickImageFromInput(imgName: string, callback: (imageUrl: string) => void) {
    if (this.input.files && this.input.files[0]) {
      const file = this.input.files[0];
      this.saveService.storeFile(imgName, file, this.deck.id).then((imageUrl) => {
        if (imageUrl)
          callback(imageUrl)
        else
          alert('Upload Error');
      });
    }
  }

  pickDeckImage() {
    this.input.onchange = (_) => {
      this.pickImageFromInput('deckIcon', (imgUrl) => {
        this.deckDescriptor.icon = imgUrl;
        this.saveService.updateDescriptor(this.deckDescriptor)
      });
    };
    this.input.click();
  }

  pickIconImage(color: CardColor) {
    this.input.onchange = (_) => {
      this.pickImageFromInput('icon' + color, (imgUrl) => {
        this.deck.iconImages[color] = imgUrl;
        this.saveService.updateDeck(this.deck)
        this.refreshPreviewsOfColour(color);
      });
    };
    this.input.click();
  }

  pickImage(color: CardColor, number: string) {
    this.input.onchange = (_) => {
      this.pickImageFromInput('card' + color + number, (imgUrl) => {
        this.deck.images[color][number] = imgUrl;
        this.saveService.updateDeck(this.deck)
        this.refreshPreview(color, number);
      });
    };
    this.input.click();
  }

  pickTrumpImage(number: string) {
    this.input.onchange = (_) => {
      this.pickImageFromInput('card' + 'Trump' + number, (imgUrl) => {
        this.deck.imagesTrump[number] = imgUrl;
        this.saveService.updateDeck(this.deck)
      });
    };
    this.input.click();
  }
  //#endregion

  //#region Font
  uploadFont(color: CardColor) {
    const input: HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.accept = '.ttf, .otf';
    input.onchange = (_) => {
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        this.saveService.storeFile(this.getFontFileName(color), file, this.deck.id).then(url => {
          if (url) {
            this.deck.iconFont[color].name = file.name.split('.').slice(0, -1).join('.')
            this.deck.iconFont[color].path = url
          }
        }
        )
      }
    };
    input.click();
  }

  generateFontCSS(color: CardColor) {
    if (!this.deck.iconFont[color].path) return
    const font = this.deck.iconFont[color];
    const css = `
          @font-face {
            font-family: "${font.name}";
            src: url("${font.path}") format('truetype');
          }
        `;
    const styleElement = document.createElement('style');
    styleElement.innerHTML = css;
    document.head.appendChild(styleElement);
  }
  //#endregion

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
      colorSymbolImg.src = this.deck.iconImages[color]

      const centerImg = new Image();
      if (this.deck.images[color][number]) {
        centerImg.src = this.deck.images[color][number]
        centerImg.crossOrigin = "anonymous"
      } else {

      }

      backgroundImg.onload = async () => {
        canvas.width = backgroundImg.width
        canvas.height = backgroundImg.height


        await new Promise<void>((resolve) => {
          borderImg.onload = () => {
            resolve();
          };
          colorSymbolImg.onload = () => {
            resolve();
          };
        });
        await new Promise<void>((resolve) => {
          if (!centerImg.src) {
            new DefaultCard(backgroundImg.width, backgroundImg.height).getDefaultPattern(color, number).then(val => centerImg.src = val)
          }
          centerImg.onload = () => {
            resolve();
          };
        });

        //Properties
        this.generateFontCSS(color)
        ctx.font = '160px ' + this.deck.iconFont[color].name
        ctx.fillStyle = this.deck.colorMapping[color]()
        ctx.textAlign = 'center'
        const iconWidth = 2 * colorSymbolImg.width / 3
        const iconHeigth = 2 * colorSymbolImg.height / 3
        const xIconPlacement = 84 - iconWidth / 2
        const yIconPlacement = 226 + (this.deck.format === DeckFormat.Tarot ? 20 : 0) - iconHeigth / 2
        const xTextPlacement = 84
        const yTextPlacement = 152

        //Fond
        ctx.drawImage(backgroundImg, 0, 0)
        if (this.deck.drawBorder) ctx.drawImage(borderImg, 0, 0)

        //D'un coté
        ctx.drawImage(colorSymbolImg, xIconPlacement, yIconPlacement, iconWidth, iconHeigth)
        if (number.length === 1)
          ctx.fillText(number, xTextPlacement, yTextPlacement)
        else {
          if (number === '10') {
            ctx.fillText(number[0], xTextPlacement - 32, yTextPlacement)
            ctx.fillText(number[1], xTextPlacement + 32, yTextPlacement)
          }
          else // number == 'Kn'
          {
            ctx.fillText(number[0], xTextPlacement, yTextPlacement)
            ctx.fillText(number[1], xTextPlacement + 86, yTextPlacement)
          }
        }


        //De l'autre coté
        ctx.rotate(Math.PI);
        ctx.drawImage(colorSymbolImg, xIconPlacement - backgroundImg.width, yIconPlacement - backgroundImg.height, iconWidth, iconHeigth);
        if (number.length === 1)
          ctx.fillText(number, xTextPlacement - canvas.width, yTextPlacement - canvas.height)
        else {
          if (number === '10') {
            ctx.fillText(number[0], xTextPlacement - canvas.width - 32, yTextPlacement - canvas.height)
            ctx.fillText(number[1], xTextPlacement - canvas.width + 32, yTextPlacement - canvas.height)
          }
          else // number == 'Kn'
          {
            ctx.fillText(number[0], xTextPlacement - canvas.width, yTextPlacement - canvas.height)
            ctx.fillText(number[1], xTextPlacement - canvas.width + 86, yTextPlacement - canvas.height)
          }
        }

        //Milieu
        ctx.rotate(-Math.PI);
        ctx.drawImage(centerImg, canvas.width / 2 - centerImg.width / 2, canvas.height / 2 - centerImg.height / 2);


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
