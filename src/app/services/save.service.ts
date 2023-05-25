import { Observable, of } from "rxjs";

import { DeckDTO } from "../shared/DTO/deckDTO";
import { DeckDescriptorDTO } from "../shared/DTO/deckDescriptorDTO";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class SaveService {


  getDescriptorsList(): Observable<DeckDescriptorDTO[]> {
    const json = localStorage.getItem('descriptors');
    if (json) {
      const descriptors: DeckDescriptorDTO[] = JSON.parse(json);
      return of(descriptors);
    } else {
      return of([]);
    }
  }

  addDescriptor(dto: DeckDescriptorDTO) {
    this.getDescriptorsList().subscribe((descriptors) => {
      descriptors.push(dto);
      localStorage.setItem('descriptors', JSON.stringify(descriptors));
    });
  }

  deleteDescriptor(dto: DeckDescriptorDTO) {
    this.getDescriptorsList().subscribe((descriptors) => {
      const updatedDescriptors = descriptors.filter(item => item !== dto);
      localStorage.setItem('descriptors', JSON.stringify(updatedDescriptors));
    });
  }


  getDeck(id: string): Observable<DeckDTO | null> {
    const json = localStorage.getItem('deck' + id);
    if (json) {
      const deck: DeckDTO = JSON.parse(json);
      return of(deck);
    } else {
      return of(null);
    }
  }

  saveDeck(dto: DeckDTO) {
    localStorage.setItem('deck' + dto.id, JSON.stringify(dto));
  }

  deleteDeck(dto: DeckDTO) {
    localStorage.removeItem('deck' + dto.id);
  }

}
