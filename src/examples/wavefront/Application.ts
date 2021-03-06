import { Canvas } from '../../Canvas';
import { WavefrontScene } from './WavefrontScene';

class Application {

    public main(): void {
        const canvas: Canvas = new Canvas(320, 200, new WavefrontScene());
        canvas.init();
    }

}

new Application().main();
