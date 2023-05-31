import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore';

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

export class BaseDeckValues {
  static readonly colorFont = "numbers-deuce"
  static readonly trumpFont = "basteleur"
  static readonly trumpIcon = 'assets/Standard/iconEmpty.png'
  static readonly colorIcon: (color: CardColor) => string = (color: CardColor) => `assets/Standard/icon${color}.png`

}

export class DeckDTO {
  id: string

  format: DeckFormat = DeckFormat.Classic
  blackCardColor: string = "black"
  redCardColor: string = "red"

  drawBorder: {
    [color in CardColor]: boolean;
  } = {
      [CardColor.Spade]: false,
      [CardColor.Heart]: false,
      [CardColor.Diamond]: false,
      [CardColor.Club]: false,
    }


  drawBorderTrump: boolean = false
  drawBorderTrumpNumber: boolean = false
  drawBorderTrumpNumber2: boolean = false
  drawBorderTrumpNumberAdditional: boolean = false

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
      [CardColor.Spade]: BaseDeckValues.colorIcon(CardColor.Spade),
      [CardColor.Heart]: BaseDeckValues.colorIcon(CardColor.Heart),
      [CardColor.Diamond]: BaseDeckValues.colorIcon(CardColor.Diamond),
      [CardColor.Club]: BaseDeckValues.colorIcon(CardColor.Club),
    }

  iconImagesTrump: string = BaseDeckValues.trumpIcon

  iconFont: {
    [color in CardColor]: { name: string; path: string };
  } = {
      [CardColor.Spade]: { name: BaseDeckValues.colorFont, path: "" },
      [CardColor.Heart]: { name: BaseDeckValues.colorFont, path: "" },
      [CardColor.Diamond]: { name: BaseDeckValues.colorFont, path: "" },
      [CardColor.Club]: { name: BaseDeckValues.colorFont, path: "" },
    }

  iconFontTrump: { name: string; path: string } = { name: BaseDeckValues.trumpFont, path: "" }

  isPublic = false;
  constructor(id: string) {
    this.id = id
  }
}


const deckConverter: FirestoreDataConverter<DeckDTO> = {
  toFirestore(deck: DeckDTO): DocumentData {
    const data: DocumentData = {};
    Object.keys(deck).forEach((key) => {
      data[key] = Reflect.get(deck, key);
    });
    return data
  },

  fromFirestore(snapshot: QueryDocumentSnapshot<DeckDTO>): DeckDTO {
    const data = snapshot.data();
    const deck = new DeckDTO(data.id);
    Object.keys(data).forEach((key) => {
      Reflect.set(deck, key, data[key as keyof DeckDTO]);
    });
    return deck;
  }
}

export { deckConverter };
