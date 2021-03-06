import { Canvas } from '../../Canvas';
import { PortalScene } from './PortalScene';

class Application {

    public main(): void {
        const canvas: Canvas = new Canvas(320, 200, new PortalScene());
        canvas.init();
    }

}

new Application().main();
