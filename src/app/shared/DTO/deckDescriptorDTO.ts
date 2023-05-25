
export class DeckDescriptorDTO {
  id: string
  title: string
  description: string
  icon: string
  creator: string


  constructor() {
    this.id = "-1"
    this.title = "default"
    this.description = "i am a default deck"
    this.icon = "https://store-images.s-microsoft.com/image/apps.25913.13546341381523259.8f30b71b-aac8-4816-a999-212ef85f8876.1b6b3f4d-3d78-409e-acc2-57b4950505b7?q=90&w=177&h=265"
    this.creator = "default creator"
  }


}
