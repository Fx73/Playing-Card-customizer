import { DeckDTO, deckConverter } from '../shared/DTO/deckDTO';
import { DeckDescriptorDTO, deckDescriptorConverter } from '../shared/DTO/deckDescriptorDTO';
import { Firestore, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { Injectable, Injector } from '@angular/core';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

import { UserComponent } from '../shared/user/user.component';
import { cloneDeep } from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class SaveService {
  private proxyService: SaveService | null = null;
  db: Firestore
  proxyDeck: DeckDTO = new DeckDTO('')

  constructor(private injector: Injector) {
    this.db = getFirestore()

  }

  //#region UserProxy


  withUserCheck<T>(func: (...args: any[]) => T): (...args: any[]) => Promise<T> {
    return async (...args: any[]): Promise<T> => {
      console.log("I AM IN PROXY")
      if (!UserComponent.user) {
        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (UserComponent.user) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      }
      return func(...args);
    };
  }
  //#endregion

  //#region Descriptors
  async getAllDescriptors(): Promise<DeckDescriptorDTO[]> {
    try {
      const docRef = collection(this.db, UserComponent.user!.uid, 'decks', 'descriptors');
      const querySnapshot = await getDocs(docRef);
      const descriptors: DeckDescriptorDTO[] = [];
      querySnapshot.forEach((doc) => {
        const descriptor = doc.data() as DeckDescriptorDTO;
        descriptors.push(descriptor);
      });
      return descriptors;
    } catch (e) {
      console.error('Error getting descriptors list: ', e);
      return [];
    }
  }

  async getDescriptorById(descriptorId: string): Promise<DeckDescriptorDTO | null> {
    try {
      const descriptorDocRef = doc(this.db, UserComponent.user!.uid, 'decks', 'descriptors', descriptorId);
      const descriptorDocSnap = await getDoc(descriptorDocRef);
      if (descriptorDocSnap.exists()) {
        return descriptorDocSnap.data() as DeckDescriptorDTO;
      } else {
        return null;
      }
    } catch (e) {
      console.error('Error retrieving descriptor: ', e);
      throw e;
    }
  }


  async addDescriptor(dto: DeckDescriptorDTO) {
    try {
      const docRef = doc(this.db, UserComponent.user!.uid, 'decks', 'descriptors', dto.id).withConverter(deckDescriptorConverter)
      await setDoc(docRef, dto);
    } catch (e) {
      console.error('Error adding descriptor: ', e);
    }
  }

  async updateDescriptor(dto: DeckDescriptorDTO) {
    if (!UserComponent.user) return;
    try {
      const docRef = doc(this.db, UserComponent.user.uid, 'decks', 'descriptors', dto.id).withConverter(deckDescriptorConverter)
      await setDoc(docRef, dto, { merge: true });
    } catch (e) {
      console.error('Error updating descriptor: ', e);
    }
  }

  //#endregion

  //#region Deck
  async addDeck(deck: DeckDTO): Promise<void> {
    try {
      const docRef = doc(this.db, UserComponent.user!.uid, 'decks', 'deckObjects', deck.id).withConverter(deckConverter);
      await setDoc(docRef, deck);
      this.proxyDeck = cloneDeep(deck);
    } catch (e) {
      console.error('Error adding deck: ', e);
      throw e;
    }
  }

  async getDeckById(deckId: string): Promise<DeckDTO | null> {
    try {
      const docRef = doc(this.db, UserComponent.user!.uid, 'decks', 'deckObjects', deckId);
      const docSnapshot = await getDoc(docRef.withConverter(deckConverter));
      if (docSnapshot.exists()) {
        const deck = docSnapshot.data();
        this.proxyDeck = cloneDeep(deck);
        return deck as DeckDTO;
      } else {
        return null;
      }
    } catch (e) {
      console.error('Error getting deck: ', e);
      throw e;
    }
  }

  async updateDeck(deck: DeckDTO): Promise<void> {
    try {
      const deckDocRef = doc(this.db, UserComponent.user!.uid, 'decks', 'deckObjects', deck.id);
      const updateFields: { [key: string]: any } = {};
      if (deck.format !== this.proxyDeck.format) {
        updateFields['format'] = deck.format;
      }
      if (deck.drawBorder !== this.proxyDeck.drawBorder) {
        updateFields['drawBorder'] = deck.drawBorder;
      }
      if (deck.blackCardColor !== this.proxyDeck.blackCardColor) {
        updateFields['blackCardColor'] = deck.blackCardColor;
      }
      if (deck.redCardColor !== this.proxyDeck.redCardColor) {
        updateFields['redCardColor'] = deck.redCardColor;
      }
      if (JSON.stringify(deck.images) !== JSON.stringify(this.proxyDeck.images)) {
        updateFields['images'] = deck.images;
      }
      if (JSON.stringify(deck.imagesTrump) !== JSON.stringify(this.proxyDeck.imagesTrump)) {
        updateFields['imagesTrump'] = deck.imagesTrump;
      }
      if (JSON.stringify(deck.iconImages) !== JSON.stringify(this.proxyDeck.iconImages)) {
        updateFields['iconImages'] = deck.iconImages;
      }
      await updateDoc(deckDocRef, updateFields);
      this.proxyDeck = cloneDeep(deck);
    } catch (e) {
      console.error('Error updating deck: ', e);
      throw e;
    }
  }


  async deleteDeck(deckId: string): Promise<void> {
    try {
      const deckDocRef = doc(this.db, UserComponent.user!.uid, 'decks', 'deckObjects', deckId);
      const descriptorDocRef = doc(this.db, UserComponent.user!.uid, 'decks', 'descriptors', deckId);
      await deleteDoc(deckDocRef);
      await deleteDoc(descriptorDocRef);
      const storageRef = ref(getStorage(), `${UserComponent.user!.uid}/${deckId}`);
      await deleteObject(storageRef);
    } catch (e) {
      console.error('Error deleting deck: ', e);
      throw e;
    }
  }

  //#endregion

  //#region Images
  async storeFile(fileName: string, file: File, deckId: string): Promise<string | null> {
    try {
      const fileExtension = file.name.split('.').pop();
      const storage = getStorage();
      const storageRef = ref(storage, `${UserComponent.user!.uid}/${deckId}/${fileName}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (e) {
      console.error('Error storing image: ', e);
      return null;
    }
  }

  //#endregion

  generateRandomId(length: number): string {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  }
}
