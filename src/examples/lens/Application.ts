import { Canvas } from '../../Canvas';
import { LensScene } from './LensScene';

class Application {

    public static main(): void {
        const canvas: Canvas = new Canvas(320, 200, new LensScene());
        canvas.appendTo(document.getElementById('aisa'));
        canvas.init();
    }

}

Application.main();