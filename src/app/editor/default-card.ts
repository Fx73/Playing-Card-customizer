import { CardColor } from "../shared/DTO/deckDTO";

export class DefaultCard {
  canvasWidth: number
  canvasHeight: number
  xGap: number
  yGap: number
  yGapHalf: number
  yGapTd: number
  yGapFt: number

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasHeight = canvasHeight
    this.canvasWidth = canvasWidth
    this.xGap = canvasWidth / 7;
    this.yGap = this.canvasHeight / 3.5;
    this.yGapHalf = this.yGap / 2;
    this.yGapTd = 2 * this.yGap / 7;
    this.yGapFt = 5 * this.yGap / 8;
  }


  drawDefaultPattern(number: string, colorSymbolImg: HTMLImageElement, ctx: CanvasRenderingContext2D) {
    const canvasCenterX = (this.canvasWidth - colorSymbolImg.width) / 2;
    const canvasCenterY = (this.canvasHeight - colorSymbolImg.height) / 2;

    if (number == 'A' || number == 'J' || number == 'Q' || number == 'K' || number == 'Kn') {
      ctx.drawImage(colorSymbolImg, (this.canvasWidth - (colorSymbolImg.width * 2)) / 2, (this.canvasHeight - (colorSymbolImg.height * 2)) / 2, colorSymbolImg.width * 2, colorSymbolImg.width * 2);
    } else {
      for (const position of this.getPositions(canvasCenterX, canvasCenterY)[number]) {
        ctx.drawImage(colorSymbolImg, position.x, position.y);
      }
    }
  }

  drawDefaultPatternTrump(number: string, ctx: CanvasRenderingContext2D) {
    ctx.font = '320px basteleur'
    ctx.textAlign = 'center'

    ctx.fillText(number, this.canvasWidth / 2, this.canvasHeight / 2)
  }


  getDefaultPattern(color: CardColor, number: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const localcanvas = document.createElement('canvas');
      const ctx = localcanvas.getContext('2d');

      if (!ctx) {
        reject("Cannot create canvas context");
        return;
      }
      const colorSymbolImg = new Image();

      colorSymbolImg.onload = () => {
        localcanvas.width = this.canvasWidth;
        localcanvas.height = this.canvasHeight;

        const canvasCenterX = (this.canvasWidth - colorSymbolImg.width) / 2;
        const canvasCenterY = (this.canvasHeight - colorSymbolImg.height) / 2;

        if (number == 'A' || number == 'J' || number == 'Q' || number == 'K' || number == 'Kn') {
          ctx.drawImage(colorSymbolImg, (this.canvasWidth - (colorSymbolImg.width * 2)) / 2, (this.canvasHeight - (colorSymbolImg.height * 2)) / 2, colorSymbolImg.width * 2, colorSymbolImg.width * 2);
        } else {
          for (const position of this.getPositions(canvasCenterX, canvasCenterY)[number]) {
            ctx.drawImage(colorSymbolImg, position.x, position.y);
          }
        }

        const finalImage = localcanvas.toDataURL('image/png');
        resolve(finalImage);
      };
      colorSymbolImg.src = 'assets/Standard/icon' + color + '.png';

      colorSymbolImg.onerror = () => {
        reject("Failed to load color symbol image");
      };
    });
  }

  getDefaultPatternTrump(number: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const localcanvas = document.createElement('canvas');
      const ctx = localcanvas.getContext('2d');

      if (!ctx) {
        reject("Cannot create canvas context");
        return;
      }

      localcanvas.width = this.canvasWidth;
      localcanvas.height = this.canvasHeight;

      ctx.font = '320px basteleur'
      ctx.textAlign = 'center'

      ctx.fillText(number, this.canvasWidth / 2, this.canvasHeight / 2)

      const finalImage = localcanvas.toDataURL('image/png')
      resolve(finalImage);
    });
  }



  readonly getPositions: (canvasCenterX: number, canvasCenterY: number) => { [key: string]: { x: number; y: number; }[] } = (canvasCenterX: number, canvasCenterY: number) => ({
    '2': [
      { x: canvasCenterX, y: canvasCenterY + this.yGap },
      { x: canvasCenterX, y: canvasCenterY - this.yGap }],
    '3': [
      { x: canvasCenterX, y: canvasCenterY + this.yGap },
      { x: canvasCenterX, y: canvasCenterY },
      { x: canvasCenterX, y: canvasCenterY - this.yGap }],
    '4': [
      { x: canvasCenterX + this.xGap, y: canvasCenterY + this.yGap },
      { x: canvasCenterX + this.xGap, y: canvasCenterY - this.yGap },
      { x: canvasCenterX - this.xGap, y: canvasCenterY - this.yGap },
      { x: canvasCenterX - this.xGap, y: canvasCenterY + this.yGap }],
    '5': [
      { x: canvasCenterX + this.xGap, y: canvasCenterY + this.yGap },
      { x: canvasCenterX + this.xGap, y: canvasCenterY - this.yGap },
      { x: canvasCenterX - this.xGap, y: canvasCenterY - this.yGap },
      { x: canvasCenterX - this.xGap, y: canvasCenterY + this.yGap },
      { x: canvasCenterX, y: canvasCenterY }],
    '6': [
      { x: canvasCenterX + this.xGap, y: canvasCenterY + this.yGap },
      { x: canvasCenterX + this.xGap, y: canvasCenterY - this.yGap },
      { x: canvasCenterX - this.xGap, y: canvasCenterY - this.yGap },
      { x: canvasCenterX - this.xGap, y: canvasCenterY + this.yGap },
      { x: canvasCenterX - this.xGap, y: canvasCenterY },
      { x: canvasCenterX + this.xGap, y: canvasCenterY }],
    '7': [
      { x: canvasCenterX + this.xGap, y: canvasCenterY + this.yGap },
      { x: canvasCenterX + this.xGap, y: canvasCenterY - this.yGap },
      { x: canvasCenterX - this.xGap, y: canvasCenterY - this.yGap },
      { x: canvasCenterX - this.xGap, y: canvasCenterY + this.yGap },
      { x: canvasCenterX - this.xGap, y: canvasCenterY },
      { x: canvasCenterX + this.xGap, y: canvasCenterY },
      { x: canvasCenterX, y: canvasCenterY - this.yGapHalf }],
    '8': [
      { x: canvasCenterX + this.xGap, y: canvasCenterY + this.yGap },
      { x: canvasCenterX + this.xGap, y: canvasCenterY - this.yGap },
      { x: canvasCenterX - this.xGap, y: canvasCenterY - this.yGap },
      { x: canvasCenterX - this.xGap, y: canvasCenterY + this.yGap },
      { x: canvasCenterX - this.xGap, y: canvasCenterY },
      { x: canvasCenterX + this.xGap, y: canvasCenterY },
      { x: canvasCenterX, y: canvasCenterY - this.yGapHalf },
      { x: canvasCenterX, y: canvasCenterY + this.yGapHalf }],
    '9': [
      { x: canvasCenterX + this.xGap, y: canvasCenterY + this.yGap },
      { x: canvasCenterX + this.xGap, y: canvasCenterY - this.yGap },
      { x: canvasCenterX - this.xGap, y: canvasCenterY - this.yGap },
      { x: canvasCenterX - this.xGap, y: canvasCenterY + this.yGap },
      { x: canvasCenterX + this.xGap, y: canvasCenterY + this.yGapTd },
      { x: canvasCenterX + this.xGap, y: canvasCenterY - this.yGapTd },
      { x: canvasCenterX - this.xGap, y: canvasCenterY - this.yGapTd },
      { x: canvasCenterX - this.xGap, y: canvasCenterY + this.yGapTd },
      { x: canvasCenterX, y: canvasCenterY - this.yGapFt }],
    '10': [
      { x: canvasCenterX + this.xGap, y: canvasCenterY + this.yGap },
      { x: canvasCenterX + this.xGap, y: canvasCenterY - this.yGap },
      { x: canvasCenterX - this.xGap, y: canvasCenterY - this.yGap },
      { x: canvasCenterX - this.xGap, y: canvasCenterY + this.yGap },
      { x: canvasCenterX + this.xGap, y: canvasCenterY + this.yGapTd },
      { x: canvasCenterX + this.xGap, y: canvasCenterY - this.yGapTd },
      { x: canvasCenterX - this.xGap, y: canvasCenterY - this.yGapTd },
      { x: canvasCenterX - this.xGap, y: canvasCenterY + this.yGapTd },
      { x: canvasCenterX, y: canvasCenterY - this.yGapFt },
      { x: canvasCenterX, y: canvasCenterY + this.yGapFt }],
  });

}
