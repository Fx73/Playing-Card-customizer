import { DeckDTO, deckConverter } from '../shared/DTO/deckDTO';
import { DeckDescriptorDTO, deckDescriptorConverter } from '../shared/DTO/deckDescriptorDTO';
import { Firestore, addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

import { Injectable } from '@angular/core';
import { UserComponent } from '../shared/user/user.component';
import { cloneDeep } from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class SaveService {
  db: Firestore
  proxyDeck: DeckDTO = new DeckDTO('')

  constructor() {
    this.db = getFirestore()

  }


  //#region Descriptors
  async getAllDescriptors(): Promise<DeckDescriptorDTO[]> {
    try {
      const docRef = collection(this.db, 'users', UserComponent.user!.uid, 'descriptors');
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
      const descriptorDocRef = doc(this.db, 'users', UserComponent.user!.uid, 'descriptors', descriptorId);
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
      const docRef = doc(this.db, 'users', UserComponent.user!.uid, 'descriptors', dto.id).withConverter(deckDescriptorConverter)
      await setDoc(docRef, dto);
    } catch (e) {
      console.error('Error adding descriptor: ', e);
    }
  }

  async updateDescriptor(dto: DeckDescriptorDTO) {
    if (!UserComponent.user) return;
    try {
      const docRef = doc(this.db, 'users', UserComponent.user.uid, 'descriptors', dto.id).withConverter(deckDescriptorConverter)
      await setDoc(docRef, dto, { merge: true });
    } catch (e) {
      console.error('Error updating descriptor: ', e);
    }
  }

  //Public part
  async addDescriptorToPublic(descriptor: DeckDescriptorDTO, archiveData: Blob): Promise<void> {
    const storageRef = ref(getStorage(), `Public/${descriptor.id}.zip`)
    const docRef = doc(this.db, 'public', descriptor.id).withConverter(deckDescriptorConverter)

    await setDoc(docRef, descriptor)
    await uploadBytes(storageRef, archiveData)
  }

  async removeDescriptorFromublic(descriptor: DeckDescriptorDTO): Promise<void> {
    const storageRef = ref(getStorage(), `Public/${descriptor.id}.zip`)
    const docRef = doc(this.db, 'public', descriptor.id).withConverter(deckDescriptorConverter)

    await deleteDoc(docRef)
    await deleteObject(storageRef)
  }

  async updateDescriptorPublic(dto: DeckDescriptorDTO) {
    if (!UserComponent.user) return;
    try {
      const docRef = doc(this.db, 'public', dto.id).withConverter(deckDescriptorConverter)
      await setDoc(docRef, dto, { merge: true });
    } catch (e) {
      console.error('Error updating descriptor: ', e);
    }
  }

  //#endregion

  //#region Deck
  async addDeck(deck: DeckDTO): Promise<void> {
    try {
      const docRef = doc(this.db, 'users', UserComponent.user!.uid, 'deckObjects', deck.id).withConverter(deckConverter);
      await setDoc(docRef, deck);
      this.proxyDeck = cloneDeep(deck);
    } catch (e) {
      console.error('Error adding deck: ', e);
      throw e;
    }
  }

  async getDeckById(deckId: string): Promise<DeckDTO | null> {
    try {
      const docRef = doc(this.db, 'users', UserComponent.user!.uid, 'deckObjects', deckId);
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
      const deckDocRef = doc(this.db, 'users', UserComponent.user!.uid, 'deckObjects', deck.id);
      const updateFields: { [key: string]: any } = {};

      Object.keys(deck).forEach((key) => {
        if (JSON.stringify(deck[key as keyof DeckDTO]) !== JSON.stringify(this.proxyDeck[key as keyof DeckDTO])) {
          updateFields[key] = deck[key as keyof DeckDTO];
        }
      });

      await updateDoc(deckDocRef, updateFields);
      this.proxyDeck = cloneDeep(deck);
    } catch (e) {
      console.error('Error updating deck: ', e);
      throw e;
    }
  }


  async deleteDeck(deckId: string): Promise<void> {
    try {
      const deckDocRef = doc(this.db, 'users', UserComponent.user!.uid, 'deckObjects', deckId);
      const descriptorDocRef = doc(this.db, 'users', UserComponent.user!.uid, 'descriptors', deckId);
      await deleteDoc(deckDocRef);
      await deleteDoc(descriptorDocRef);
      const storageRef = ref(getStorage(), `${UserComponent.user!.uid}/${deckId}`);
      await deleteObject(storageRef);
    } catch (e) {
      if ((e as { code: string }).code !== 'storage/object-not-found') {
        console.error('Error deleting deck: ', e);
        throw e;
      }
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
