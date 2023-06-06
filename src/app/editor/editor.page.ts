import { ActivatedRoute, Router } from '@angular/router';
import { AfterContentInit, AfterViewInit, Component, OnInit } from '@angular/core';
import { BaseDeckValues, CardColor, DeckDTO, DeckFormat } from '../shared/DTO/deckDTO';
import { ClassicMesures, DefaultCard, TarotMesures } from './default-card';

import { AppComponent } from '../app.component';
import { ArchiverService } from './../services/archiver.service';
import { ColorPickerModule } from 'ngx-color-picker';
import { CommonModule } from '@angular/common';
import { DeckDescriptorDTO } from '../shared/DTO/deckDescriptorDTO';
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
export class EditorPage implements AfterContentInit {
  readonly deckFormats = Object.values(DeckFormat)
  readonly cardColors: CardColor[] = Object.values(CardColor)
  readonly cardNumbers: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
  readonly trumpNumbers: string[] = Array.from({ length: 21 }, (_, i) => (i + 1).toString()).concat('E');
  readonly mesures = { Classic: new ClassicMesures(), Tarot: new TarotMesures() }

  readonly colorMapping = {
    [CardColor.Spade]: () => this.deck.blackCardColor,
    [CardColor.Heart]: () => this.deck.redCardColor,
    [CardColor.Diamond]: () => this.deck.redCardColor,
    [CardColor.Club]: () => this.deck.blackCardColor,
  };
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
  cardTrumpPreviews: { [number: string]: string } = {}
  cardBackPreview: string = ""

  constructor(private route: ActivatedRoute, private router: Router, private saveService: SaveService, private archiverService: ArchiverService) {
    this.input = document.createElement('input')
    this.input.type = 'file';
    this.input.accept = 'image/png, image/jpeg';
  }

  ngAfterContentInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!
    if (id == 'new') {
      this.newDeck()
      window.history.replaceState({}, 'Deck Editor', 'editor/' + this.deck.id);
    } else {
      this.loadDeck(id)
    }
  }

  newDeck() {
    this.deck = new DeckDTO(this.saveService.generateRandomId(12))
    this.deckDescriptor = new DeckDescriptorDTO(this.deck.id)
    if (UserComponent.user!.displayName)
      this.deckDescriptor.creator = UserComponent.user!.displayName

    this.saveService.addDescriptor(this.deckDescriptor)
    this.saveService.addDeck(this.deck)
    this.refreshAllPreviews()
  }

  loadDeck(id: string) {
    this.saveService.getDescriptorById(id).then(value => {
      this.deckDescriptor = value!
      if (this.deckDescriptor.creator !== UserComponent.user!.displayName && UserComponent.user!.displayName)
        this.deckDescriptor.creator = UserComponent.user!.displayName
    })
    this.saveService.getDeckById(id).then(value => {
      if (value) {
        this.deck = value
        this.refreshAllPreviews()
      } else {
        this.router.navigate(['/editor']);
      }
    })
  }

  saveDeck() {
    this.saveService.updateDeck(this.deck)
    if (this.deck.isPublic)
      this.deck.isPublic = false;
  }

  makePublic(isPublic: boolean) {
    if (!isPublic)
      this.saveService.removeFromPublic(this.deckDescriptor.id)
    else {
      AppComponent.presentOkToast("Be aware that the public version will stay as it is now. Any update will not be shown unless turned to public again.")
      this.archiverService.createDeckArchive(this.cardBackPreview, this.cardPreviews, this.cardTrumpPreviews).then(blob => {
        this.saveService.addDescriptorToPublic(this.deckDescriptor, blob)
      })
    }


  }

  exportDeck() {
    this.archiverService.createDeckArchive(this.cardBackPreview, this.cardPreviews, this.cardTrumpPreviews).then(blob => {
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = this.deckDescriptor.title
      link.click()
      link.remove()
    })
  }

  exportDeckPDF() {
    this.archiverService.createDeckPdf(this.cardBackPreview, this.cardPreviews, this.cardTrumpPreviews).then(blob => {
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = this.deckDescriptor.title
      link.click()
      link.remove()
    })
  }

  //#region Refresh
  refreshDescriptor() {
    this.saveService.updateDescriptor(this.deckDescriptor)
    if (this.deck.isPublic)
      this.saveService.updateDescriptorPublic(this.deckDescriptor)
  }

  refreshAllPreviews() {
    for (const color of Object.values(CardColor))
      this.refreshPreviewsOfColour(color)

    if (this.deck.format === DeckFormat.Tarot)
      this.refreshPreviewsOfColourTrump()

    this.createBackCard().then(img => this.cardBackPreview = img)
  }

  refreshPreviewsOfColour(color: CardColor) {
    for (const number of this.cardNumbers)
      this.refreshPreview(color, number)

    if (this.deck.format === DeckFormat.Tarot)
      this.refreshPreview(color, 'Kn')
  }

  refreshPreviewsOfColourTrump() {
    for (const number of this.trumpNumbers)
      this.refreshPreviewTrump(number)
  }

  refreshPreview(color: CardColor, number: string) {
    this.createFinalImage(color, number).then(img => this.cardPreviews[color][number] = img)
  }

  refreshPreviewTrump(number: string) {
    this.createFinalTrumpImage(number).then(img => this.cardTrumpPreviews[number] = img)
  }

  resetIconImage(color: CardColor) {
    this.deck.iconImages[color] = BaseDeckValues.colorIcon(color)
  }
  resetIconImageTrump() {
    this.deck.iconImagesTrump = BaseDeckValues.trumpIcon
  }
  resetIconFont(color: CardColor) {
    this.deck.iconFont[color].name = BaseDeckValues.colorFont
    this.deck.iconFont[color].path = ''
  }
  resetIconFontTrump() {
    this.deck.iconFontTrump.name = BaseDeckValues.trumpFont
    this.deck.iconFontTrump.path = ''
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
        this.createBackCard().then(img => this.cardBackPreview = img)
        this.saveService.updateDescriptor(this.deckDescriptor)
        this.input.value = '';
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
        this.input.value = '';
      });
    };
    this.input.click();
  }
  pickIconImageTrump() {
    this.input.onchange = (_) => {
      this.pickImageFromInput('iconTrump', (imgUrl) => {
        this.deck.iconImagesTrump = imgUrl;
        this.saveService.updateDeck(this.deck)
        this.refreshPreviewsOfColourTrump();
        this.input.value = '';
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
        this.input.value = '';
      });
    };
    this.input.click();
  }

  pickTrumpImage(number: string) {
    this.input.onchange = (_) => {
      this.pickImageFromInput('card' + 'Trump' + number, (imgUrl) => {
        this.deck.imagesTrump[number] = imgUrl;
        this.saveService.updateDeck(this.deck)
        this.input.value = '';
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
        this.saveService.storeFile(`font${color.toLowerCase()}`, file, this.deck.id).then(url => {
          if (url) {
            this.deck.iconFont[color].name = file.name.split('.').slice(0, -1).join('.')
            this.deck.iconFont[color].path = url
            this.saveService.updateDeck(this.deck)
          }
        }
        )
      }
    };
    input.click();
  }
  uploadFontTrump() {
    const input: HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.accept = '.ttf, .otf';
    input.onchange = (_) => {
      if (input.files && input.files.length > 0) {
        const file = input.files[0];
        this.saveService.storeFile('fontTrump', file, this.deck.id).then(url => {
          if (url) {
            this.deck.iconFontTrump.name = file.name.split('.').slice(0, -1).join('.')
            this.deck.iconFontTrump.path = url
            this.saveService.updateDeck(this.deck)
          }
        }
        )
      }
    };
    input.click();
  }

  generateFontCSS(color: CardColor | null) {
    let font
    if (color) {
      if (!this.deck.iconFont[color].path) return
      font = this.deck.iconFont[color];
    } else {
      if (!this.deck.iconFontTrump.path) return
      font = this.deck.iconFontTrump;
    }
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
      const borderImg = new Image();
      const colorSymbolImg = new Image();
      const centerImg = new Image();

      backgroundImg.onload = async () => {
        canvas.width = backgroundImg.width
        canvas.height = backgroundImg.height

        await Promise.all([
          new Promise<void>((resolve) => {
            borderImg.onload = () => {
              resolve();
            };
            borderImg.src = 'assets/Standard/border' + this.deck.format + '.png';
          }),
          new Promise<void>((resolve) => {
            colorSymbolImg.onload = () => {
              resolve();
            };
            colorSymbolImg.crossOrigin = "anonymous";
            colorSymbolImg.src = this.deck.iconImages[color];
          }),
          new Promise<void>((resolve) => {
            centerImg.onload = () => {
              resolve();
            };
            if (this.deck.images[color][number]) {
              centerImg.src = this.deck.images[color][number];
              centerImg.crossOrigin = "anonymous"
            } else {
              resolve();
            }
          })
        ]);


        //Properties
        this.generateFontCSS(color)
        ctx.font = '160px ' + this.deck.iconFont[color].name
        ctx.fillStyle = this.colorMapping[color]()
        ctx.textAlign = 'center'
        const iconWidth = 2 * colorSymbolImg.width / 3
        const iconHeigth = 2 * colorSymbolImg.height / 3
        const xIconPlacement = 120 - iconWidth / 2
        const yIconPlacement = 260 - iconHeigth / 2 + (this.deck.format === DeckFormat.Tarot ? 20 : 0)
        const xTextPlacement = 120
        const yTextPlacement = 180 + (this.deck.format === DeckFormat.Tarot ? 20 : 0)

        //Fond
        ctx.drawImage(backgroundImg, 0, 0)
        if (this.deck.drawBorder[color]) ctx.drawImage(borderImg, 0, 0)


        //Milieu
        if (this.deck.images[color][number])
          ctx.drawImage(centerImg, canvas.width / 2 - centerImg.width / 2, canvas.height / 2 - centerImg.height / 2);
        else
          new DefaultCard(backgroundImg.width, backgroundImg.height).drawDefaultPattern(number, colorSymbolImg, ctx)


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
        ctx.rotate(-Math.PI);

        // Appliquer le masque
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(backgroundImg, 0, 0);

        const finalImage = canvas.toDataURL('image/png');
        resolve(finalImage);
      };

      backgroundImg.src = 'assets/Standard/layout' + this.deck.format + '.png'
    });
  }


  createFinalTrumpImage(number: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject('Canvas context is null');
        return;
      }

      const backgroundImg = new Image();
      const borderImg = new Image();
      const borderTrumpImg = new Image();
      const borderTrump2Img = new Image();
      const colorSymbolImg = new Image();
      const centerImg = new Image();

      backgroundImg.onload = async () => {
        canvas.width = backgroundImg.width
        canvas.height = backgroundImg.height

        await Promise.all([
          new Promise<void>((resolve) => {
            borderImg.onload = () => {
              resolve();
            };
            borderImg.src = 'assets/Standard/borderTarot.png';
          }),
          new Promise<void>((resolve) => {
            borderTrumpImg.onload = () => {
              resolve();
            };
            borderTrumpImg.src = 'assets/Standard/borderTarotTrump.png';
          }),
          new Promise<void>((resolve) => {
            borderTrump2Img.onload = () => {
              resolve();
            };
            borderTrump2Img.src = 'assets/Standard/borderTarotTrump2.png';
          }),
          new Promise<void>((resolve) => {
            colorSymbolImg.onload = () => {
              resolve();
            };
            colorSymbolImg.crossOrigin = 'anonymous';
            colorSymbolImg.src = this.deck.iconImagesTrump;
          }),
          new Promise<void>((resolve) => {
            centerImg.onload = () => {
              resolve();
            };
            if (this.deck.imagesTrump[number]) {
              centerImg.crossOrigin = 'anonymous';
              centerImg.src = this.deck.imagesTrump[number];
            } else {
              new DefaultCard(backgroundImg.width, backgroundImg.height).getDefaultPatternTrump(number).then(val => {
                centerImg.src = val;
                resolve();
              });
            }
          })
        ]);


        //Properties
        const xIconPlacement = 514 - colorSymbolImg.width / 2
        const yIconPlacement = 172 - colorSymbolImg.height / 2
        const xTextPlacement = 186
        const yTextPlacement = 224

        //Fond
        ctx.drawImage(backgroundImg, 0, 0)

        //Milieu
        if (this.deck.imagesTrump[number])
          ctx.drawImage(centerImg, canvas.width / 2 - centerImg.width / 2, canvas.height / 2 - centerImg.height / 2);
        else
          new DefaultCard(backgroundImg.width, backgroundImg.height).drawDefaultPatternTrump(number, ctx)

        this.generateFontCSS(null)
        ctx.font = '160px ' + this.deck.iconFontTrump.name
        ctx.textAlign = 'center'

        //Border
        if (this.deck.drawBorderTrump) ctx.drawImage(borderImg, 0, 0)

        if (number !== 'E') {
          if (this.deck.drawBorderTrumpNumber) ctx.drawImage(borderTrumpImg, 0, 0)
          if (this.deck.drawBorderTrumpNumber2) ctx.drawImage(borderTrump2Img, 0, 0)

          //D'un coté
          ctx.drawImage(colorSymbolImg, xIconPlacement, yIconPlacement)
          ctx.fillText(number, xTextPlacement, yTextPlacement)

          //De l'autre coté
          ctx.rotate(Math.PI);
          ctx.drawImage(colorSymbolImg, xIconPlacement - backgroundImg.width, yIconPlacement - backgroundImg.height);
          ctx.fillText(number, xTextPlacement - canvas.width, yTextPlacement - canvas.height)
          ctx.rotate(-Math.PI);

          // Appliquer le masque
          ctx.globalCompositeOperation = 'destination-in';
          ctx.drawImage(backgroundImg, 0, 0);
        }



        const finalImage = canvas.toDataURL('image/png');
        resolve(finalImage);
      };
      backgroundImg.src = 'assets/Standard/layoutTarot.png'
    });
  }


  createBackCard(): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject('Canvas context is null');
        return;
      }

      const backgroundImg = new Image();
      backgroundImg.src = 'assets/Standard/layout' + this.deck.format + '.png'

      const centerImg = new Image();

      backgroundImg.onload = async () => {
        canvas.width = backgroundImg.width
        canvas.height = backgroundImg.height

        await new Promise<void>((resolve) => {
          centerImg.onload = () => {
            resolve();
          };
          centerImg.src = this.deckDescriptor.icon
          centerImg.crossOrigin = "anonymous"
        });

        //Milieu
        ctx.drawImage(backgroundImg, 0, 0)
        ctx.drawImage(centerImg, canvas.width / 2 - centerImg.width / 2, canvas.height / 2 - centerImg.height / 2);

        // Appliquer le masque
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(backgroundImg, 0, 0);

        const finalImage = canvas.toDataURL('image/png');
        resolve(finalImage);
      };

    });

  }
}
