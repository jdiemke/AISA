import { Canvas } from '../../Canvas';
import { CullFace } from '../../CullFace';
import { Framebuffer } from '../../Framebuffer';
import { AbstractScene } from '../../scenes/AbstractScene';
import { Texture, TextureUtils } from '../../texture';

/**
 * TODO: extract lens into effect class
 */
export class RotoZoomerScene extends AbstractScene {

    private logoTexture: Texture;

    public init(framebuffer: Framebuffer): Promise<any> {
        return Promise.all([
            TextureUtils.load(require('./assets/logo.png'), false).then(
                (texture: Texture) => this.logoTexture = texture
            ),
        ]);
    }

    public render(framebuffer: Framebuffer): void {
        framebuffer.drawRotoZoomer(this.logoTexture);
    }

}
