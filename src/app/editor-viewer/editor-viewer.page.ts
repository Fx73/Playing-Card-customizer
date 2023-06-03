import { ActivatedRoute, Router } from '@angular/router';
import { CardColor, DeckFormat } from '../shared/DTO/deckDTO';
import { ClassicMesures, TarotMesures } from '../editor/default-card';

import { ArchiverService } from '../services/archiver.service';
import { BrowseService } from '../services/browse.service';
import { ColorPickerModule } from 'ngx-color-picker';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DeckDescriptorDTO } from '../shared/DTO/deckDescriptorDTO';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../shared/header/header.component";
import { IonicModule } from '@ionic/angular';
import { UserComponent } from '../shared/user/user.component';

@Component({
  selector: 'app-editor',
  templateUrl: './editor-viewer.page.html',
  styleUrls: ['./editor-viewer.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, UserComponent, HeaderComponent, ColorPickerModule,]
})
export class EditorViewerPage {
  [x: string]: any;
  readonly cardColors: CardColor[] = Object.values(CardColor)
  readonly cardNumbers: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
  readonly trumpNumbers: string[] = Array.from({ length: 21 }, (_, i) => (i + 1).toString()).concat('E');

  deckDescriptor: DeckDescriptorDTO = new DeckDescriptorDTO('')

  deckFormat: DeckFormat = DeckFormat.Classic

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



  constructor(private route: ActivatedRoute, private router: Router, private browseService: BrowseService, private archiverService: ArchiverService) {
    const id = this.route.snapshot.paramMap.get('id')!
    this.browseService.getDescriptorById(id).then(d => {
      if (d) {
        this.cardBackPreview = d.icon
        this.deckDescriptor = d
      }
      else
        this.router.navigate(['/home']);
    })

    this.browseService.getZipFileById(id).then(zip => {
      if (zip) {
        archiverService.extractCardPreviewsFromArchive(zip).then(p => {
          this.cardPreviews = p.cardPreviews
          if (Object.keys(p.trumpPreviews).length > 0) {
            this.cardTrumpPreviews = p.trumpPreviews
            this.deckFormat = DeckFormat.Tarot
            this.cardBackPreview = p.backCard
          }
        })
      }
      else
        this.router.navigate(['/home']);
    })

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


}
