import { Canvas } from '../../Canvas';
import { CullFace } from '../../CullFace';
import { Framebuffer } from '../../Framebuffer';
import { AbstractScene } from '../../scenes/AbstractScene';
import { Texture, TextureUtils } from '../../texture';
import { Vector3f, Matrix4f } from '../../math';
import { Torus } from '../../geometrical-objects/Torus';
import { TorusKnot } from '../../geometrical-objects/TorusKnot';
import RandomNumberGenerator from '../../RandomNumberGenerator';

export class TorusKnotScene extends AbstractScene {

    private rave: Texture;
    private torus: TorusKnot = new TorusKnot();
    private noise: Texture;

    public init(framebuffer: Framebuffer): Promise<any> {
        framebuffer.setCullFace(CullFace.BACK);

        return Promise.all([
            TextureUtils.load(require('../../assets/rave.png'), false).then(texture => this.rave = texture),
            TextureUtils.generateProceduralNoise().then(texture => this.noise = texture)
        ]);
    }

    public render(framebuffer: Framebuffer): void {
        const time: number = Date.now();
        const elapsedTime: number = 0.02 * time;

        this.raveMoview(framebuffer, time * 5, this.rave);
        framebuffer.setCullFace(CullFace.BACK);
        this.shadingTorus5(framebuffer, Date.now() * 0.03);
        this.glitchScreen(framebuffer, time, this.noise);
        // framebuffer.drawTexture(0, 75, this.hoodlumLogo, (Math.sin(time * 0.0003) + 1) * 0.5);
    }

    public raveMoview(framebuffer: Framebuffer, elapsedTime: number, texture: Texture): void {
        framebuffer.fastFramebufferCopyOffset(framebuffer.framebuffer, texture.texture, -(Math.round(elapsedTime / 200) % 11) * 200);
    }

    public glitchScreen(framebuffer: Framebuffer, elapsedTime: number, texture: Texture, noise: boolean = true): void {

        const glitchFactor = (Math.sin(elapsedTime * 0.0003) * 0.5 + 0.5);
        let rng = new RandomNumberGenerator();
        rng.setSeed((elapsedTime / 250) | 0);
        let texture2 = new Texture();
        texture2.height = 200;
        texture2.width = 320;
        texture2.texture = framebuffer.framebuffer;
        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 10; y++) {
                if (rng.getFloat() > 0.25) {
                    continue;
                }

                framebuffer.drawTextureRect(20 * (16 - x), 20 * ((16 * rng.getFloat()) | 0), 20 * x, 20 * y, 20, 20, texture2, 0.1 + 0.35 * glitchFactor);
            }
        }

        if (noise) {
            for (let x = 0; x < 16; x++) {
                for (let y = 0; y < 10; y++) {
                    framebuffer.drawTextureRect(x * 20, y * 20, 20 * (Math.round(elapsedTime / 100 + x + y) % 12), 0, 20, 20, texture, 0.1 + 0.3 * glitchFactor);
                }
            }
        }

        framebuffer.fastFramebufferCopy(framebuffer.tmpGlitch, framebuffer.framebuffer);

        // now distort the tmpGlitch buffer and render to framebuffer again

        let rng2 = new RandomNumberGenerator();

        for (let k = 0; k < 8; k++) {
            let yStart = Math.round(rng.getFloat() * 180);
            const size = 3 + Math.round(rng.getFloat() * 20);
            rng2.setSeed((elapsedTime / 250) | 0);
            let scale = rng2.getFloat() * glitchFactor;
            let off = rng.getFloat() * glitchFactor;
            for (let y = 0; y < size; y++) {
                const offset = Math.abs(Math.round(off * 25) + Math.round(rng2.getFloat() * 3)
                    + Math.round(Math.cos(y * 0.01 + elapsedTime * 0.002 + off) * scale * 5));

                let index = yStart * 320;
                let glIndex = yStart * 320 + 320 - offset;

                for (let i = 0; i < Math.max(0, offset); i++) {
                    framebuffer.framebuffer[index++] = framebuffer.tmpGlitch[glIndex++];
                }

                glIndex = yStart * 320;
                let count = 320 - offset;

                for (let i = 0; i < count; i++) {
                    framebuffer.framebuffer[index++] = framebuffer.tmpGlitch[glIndex++];
                }
                yStart++;
            }
        }
    }


    private shadingTorus5(framebuffer: Framebuffer, time: number) {
        framebuffer.clearDepthBuffer();

        let scale = 1.0;

        let modelViewMartrix = Matrix4f.constructScaleMatrix(scale, scale, scale).multiplyMatrix(Matrix4f.constructYRotationMatrix(time * 0.035));
        modelViewMartrix = modelViewMartrix.multiplyMatrix(Matrix4f.constructXRotationMatrix(time * 0.04));

        let ukBasslineBpm = 130 / 2;
        let ukBasslineClapMs = 60000 / ukBasslineBpm;
        let smashTime = (time * 10) % ukBasslineClapMs;
        let smash = (framebuffer.cosineInterpolate(0, 15, smashTime) - framebuffer.cosineInterpolate(15, 200, smashTime) +
            0.4 * framebuffer.cosineInterpolate(200, 300, smashTime) - 0.4 * framebuffer.cosineInterpolate(300, 400, smashTime)
        )
            * 12;
        modelViewMartrix = Matrix4f.constructTranslationMatrix(Math.sin(time * 0.04) * 20,
            Math.sin(time * 0.05) * 8 - smash * 5, -28 - 250).multiplyMatrix(modelViewMartrix);

        framebuffer.renderingPipeline.draw(this.torus.getMesh(), modelViewMartrix, 200, 100, 100);
    }

}
