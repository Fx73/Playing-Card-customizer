import { CardColor } from "../shared/DTO/deckDTO";
import { Injectable } from "@angular/core";
import { downloadZip } from 'client-zip';

@Injectable({
  providedIn: 'root'
})
export class ArchiverService {


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

}
