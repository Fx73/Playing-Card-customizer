import { FirestoreDataConverter, QueryDocumentSnapshot } from "firebase/firestore"

export class DeckDescriptorDTO {
  id: string
  title: string
  creator: string
  description: string
  icon: string


  constructor(id: string, title: string = "", creator: string = "AnonymUser", description: string = "", icon: string = "assets/Icon.png") {
    this.id = id;
    this.title = title;
    this.creator = creator;
    this.description = description;
    this.icon = icon;
  }

  toString() {
    return this.id + ', ' + this.title + ', ' + this.creator + ', ' + this.description + ', ' + this.icon;
  }

}

// Firestore data converter
const deckDescriptorConverter: FirestoreDataConverter<DeckDescriptorDTO> = {
  toFirestore: (dto) => {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      icon: dto.icon,
      creator: dto.creator
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<DeckDescriptorDTO>, options): DeckDescriptorDTO => {
    const data = snapshot.data(options);
    return new DeckDescriptorDTO(
      data!.id,
      data!.title,
      data!.creator,
      data!.description,
      data!.icon,
    );
  }
};
export { deckDescriptorConverter };
