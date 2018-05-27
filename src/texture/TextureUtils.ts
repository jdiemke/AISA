import RandomNumberGenerator from '../RandomNumberGenerator';
import { Texture } from './Texture';

export class TextureUtils {

    public static generateProceduralNoise(): Promise<Texture> {
        return new Promise((resolve) => {
            const texture = new Texture();
            texture.texture = new Uint32Array(256 * 256);

            const rng: RandomNumberGenerator = new RandomNumberGenerator();
            rng.setSeed(100);

            for (let i: number = 0; i < 256 * 256; i++) {
                const scale: number = rng.getFloat();
                texture.texture[i] = 200 * scale | 255 * scale << 8 | 205 * scale << 16 | 255 << 24;
            }

            texture.width = 256;
            texture.height = 256;
            resolve(texture);
        });
    }

    public static load(filename: string, transparency: boolean): Promise<Texture> {
        return new Promise<Texture>((resolve: (texture?: Texture) => void): void => {
            const image: HTMLImageElement = new Image();
            image.onload = (): void => {
                const texture: Texture = new Texture();
                texture.texture = this.getImageData(image, transparency);
                texture.width = image.width;
                texture.height = image.height;
                resolve(texture);
            };
            image.onerror = (): void => resolve();
            image.src = filename;
        });
    }

    private static getImageData(image: HTMLImageElement, withAlpha: boolean = false): Uint32Array {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context: CanvasRenderingContext2D = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        const data: Uint8ClampedArray = context.getImageData(0, 0, image.width, image.height).data;
        const conv: Uint32Array = new Uint32Array(data.length / 4);
        let c: number = 0;
        for (let i: number = 0; i < data.length; i += 4) {
            if (withAlpha) {
                conv[c] = (data[i + 3] << 24) | (data[i + 2] << 16) | (data[i + 1] << 8) | data[i + 0];
            } else {
                conv[c] = (255 << 24) | (data[i + 2] << 16) | (data[i + 1] << 8) | data[i + 0];
            }

            c++;
        }
        return conv;
    }

}