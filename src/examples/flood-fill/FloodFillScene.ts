import { Canvas } from '../../Canvas';
import { CullFace } from '../../CullFace';
import { Framebuffer } from '../../Framebuffer';
import { Vector3f } from '../../math';
import { AbstractScene } from '../../scenes/AbstractScene';
import { TextureUtils } from '../../texture';
import { Texture } from '../../texture/Texture';

/**
 * TODO: extract lens into effect class
 */
export class FloodFillScene extends AbstractScene {

    private ledTexture: Texture;

    public init(framebuffer: Framebuffer): Promise<any> {
        return Promise.all([
            TextureUtils.load(require('../../assets/atlantis.png'), false).then(
                (texture: Texture) => this.ledTexture = texture
            )
        ]);
    }

    public render(framebuffer: Framebuffer): void {
        const time: number = Date.now();
        this.floodFill(framebuffer, this.ledTexture, time);
    }

    public floodFill(framebuffer: Framebuffer, texture: Texture, time: number) {
        let pos = Math.floor(time * 0.02) % 200;
        let index = 320 * 200;

        for (let y = 0; y < pos; y++) {
            for (let x = 0; x < 320; x++) {
                framebuffer.framebuffer[index] = texture.texture[index];
                index--;
            }
        }

        let index2 = index;
        for (let y = 0; y < 200 - pos; y++) {
            for (let x = 0; x < 320; x++) {
                framebuffer.framebuffer[index] = texture.texture[index2];
                index--;
                index2--;
            }
            index2 += 320;
        }
    }

}
