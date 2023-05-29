import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore';

import { DeckDescriptorDTO } from "./deckDescriptorDTO";

export enum DeckFormat {
  Classic = 'Classic',
  Tarot = 'Tarot',
}

export enum CardColor {
  Spade = 'Spade',
  Heart = 'Heart',
  Diamond = 'Diamond',
  Club = 'Club',
}

export class DeckDTO {
  readonly colorMapping = {
    [CardColor.Spade]: () => this.blackCardColor,
    [CardColor.Heart]: () => this.redCardColor,
    [CardColor.Diamond]: () => this.redCardColor,
    [CardColor.Club]: () => this.blackCardColor,
  };

  id: string

  format: DeckFormat = DeckFormat.Classic
  drawBorder: boolean = false
  blackCardColor: string = "black"
  redCardColor: string = "red"

  images: {
    [color in CardColor]: { [number: string]: string };
  } = {
      [CardColor.Spade]: {},
      [CardColor.Heart]: {},
      [CardColor.Diamond]: {},
      [CardColor.Club]: {},
    }

  imagesTrump: { [number: string]: string } = {};

  iconImages: {
    [color in CardColor]: string;
  } = {
      [CardColor.Spade]: "",
      [CardColor.Heart]: "",
      [CardColor.Diamond]: "",
      [CardColor.Club]: "",
    }

  iconFont: {
    [color in CardColor]: { name: string; path: string };
  } = {
      [CardColor.Spade]: { name: "numbers-deuce", path: "" },
      [CardColor.Heart]: { name: "numbers-deuce", path: "" },
      [CardColor.Diamond]: { name: "numbers-deuce", path: "" },
      [CardColor.Club]: { name: "numbers-deuce", path: "" },
    }

  constructor(id: string) {
    this.id = id
  }
}


const deckConverter: FirestoreDataConverter<DeckDTO> = {
  toFirestore(deck: DeckDTO): DocumentData {
    return {
      id: deck.id,
      format: deck.format,
      drawBorder: deck.drawBorder,
      blackCardColor: deck.blackCardColor,
      redCardColor: deck.redCardColor,
      images: deck.images,
      imagesTrump: deck.imagesTrump,
      iconImages: deck.iconImages,
      iconFont: deck.iconFont
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot<DeckDTO>): DeckDTO {
    const data = snapshot.data();
    const deck = new DeckDTO(data.id);
    deck.format = data.format;
    deck.drawBorder = data.drawBorder;
    deck.blackCardColor = data.blackCardColor;
    deck.redCardColor = data.redCardColor;
    deck.images = data.images;
    deck.imagesTrump = data.imagesTrump;
    deck.iconImages = data.iconImages;
    deck.iconFont = data.iconFont;
    return deck;
  }
}

export { deckConverter };
