import * as JSZip from 'jszip';

import { ClassicMesures, DefaultMesures, TarotMesures } from '../editor/default-card';
import { PDFDocument, PDFPage, StandardFonts, rgb, scale } from 'pdf-lib'

import { CardColor } from "../shared/DTO/deckDTO";
import { Injectable } from "@angular/core";
import { downloadZip } from 'client-zip';

@Injectable({
  providedIn: 'root'
})
export class ArchiverService {


  //#region Zip

  public async createDeckArchive(backCard: string, cardPreviews: { [color in CardColor]: { [number: string]: string } }, cardTrumpPreviews: { [number: string]: string }): Promise<Blob> {
    const array = []

    for (const color of Object.values(CardColor))
      for (const [number, preview] of Object.entries(cardPreviews[color])) {
        const imageBlob = this.dataURItoBlob(preview.replace(/^data:image\/\w+;base64,/, ''));
        const imageFile = new File([imageBlob], `${color}/${number}.png`, { type: 'image/png' });

        array.push(imageFile)
      }
    for (const [number, preview] of Object.entries(cardTrumpPreviews)) {
      const imageBlob = this.dataURItoBlob(preview.replace(/^data:image\/\w+;base64,/, ''));
      const imageFile = new File([imageBlob], `Trump/${number}.png`, { type: 'image/png' });

      array.push(imageFile)
    }

    const imageBlob = this.dataURItoBlob(backCard.replace(/^data:image\/\w+;base64,/, ''));
    const imageFile = new File([imageBlob], `backCard.png`, { type: 'image/png' });
    array.push(imageFile)

    const blob = await downloadZip(array).blob()

    return blob
  }


  dataURItoBlob(dataURI: string) {
    const byteString = atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });
    return blob;
  }


  async extractCardPreviewsFromArchive(archiveBlob: Blob): Promise<{ backCard: string, cardPreviews: { [color in CardColor]: { [number: string]: string } }, trumpPreviews: { [number: string]: string } }> {
    const deck: { backCard: string, cardPreviews: { [color in CardColor]: { [number: string]: string } }, trumpPreviews: { [number: string]: string } } =
    {
      cardPreviews: {
        [CardColor.Spade]: {},
        [CardColor.Heart]: {},
        [CardColor.Diamond]: {},
        [CardColor.Club]: {},
      }, backCard: ""
      , trumpPreviews: {}
    }


    const zip = new JSZip();

    try {
      const zipData = await zip.loadAsync(archiveBlob);
      const fileNames = Object.keys(zipData.files);

      for (const fileName of fileNames) {
        if (fileName === "backCard.png") {
          const fileData = await zipData.file(fileName)?.async('base64');
          deck.backCard = `data:image/png;base64,${fileData}`
        } else {
          const filePathSegments = fileName.split('/');
          const color = filePathSegments[0];
          const number = filePathSegments[1].split('.')[0];
          const fileData = await zipData.file(fileName)?.async('base64');

          if (color === 'Trump') {
            deck.trumpPreviews[number] = `data:image/png;base64,${fileData}`;
          } else {
            if (color && number && fileData) {
              deck.cardPreviews[color as CardColor][number] = `data:image/png;base64,${fileData}`;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error extracting card previews from archive:', error);
    }

    return deck;
  }

  //#endregion


  //#region Pdf

  async createDeckPdf(backCard: string, cardPreviews: { [color in CardColor]: { [number: string]: string } }, cardTrumpPreviews: { [number: string]: string }): Promise<Blob> {
    const pdfDoc = await PDFDocument.create();

    const imageBytes = await fetch(backCard).then((response) => response.arrayBuffer());
    const backimage = await pdfDoc.embedPng(imageBytes);

    const { width, height } = backimage;

    const mesures: DefaultMesures = (width === new ClassicMesures().FullWidth ? new ClassicMesures() : new TarotMesures())


    let page: PDFPage

    for (const color of Object.values(CardColor)) {
      for (const [number, preview] of Object.entries(cardPreviews[color])) {
        const imageBytes = await fetch(preview).then((response) => response.arrayBuffer());
        const image = await pdfDoc.embedPng(imageBytes);

        page = pdfDoc.addPage([width, height]);
        page.drawImage(image);
        page.setBleedBox(mesures.cropX, mesures.cropY, mesures.Width, mesures.Height)

        page = pdfDoc.addPage([width, height]);
        page.drawImage(backimage);
        page.setBleedBox(mesures.cropX, mesures.cropY, mesures.Width, mesures.Height)

      }
    }

    for (const [number, preview] of Object.entries(cardTrumpPreviews)) {
      const imageBytes = await fetch(preview).then((response) => response.arrayBuffer());
      const image = await pdfDoc.embedPng(imageBytes);

      page = pdfDoc.addPage([width, height]);
      page.drawImage(image);

      page = pdfDoc.addPage([width, height]);
      page.drawImage(backimage);
    }

    const pdfBytes = await pdfDoc.save();

    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    return pdfBlob;
  }


  //#endregion

}
