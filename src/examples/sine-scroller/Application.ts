import { Canvas } from '../../Canvas';
import { SineScrollerScene } from './SineScrollerScene';

class Application {

    public static main(): void {
        const canvas: Canvas = new Canvas(320, 200, new SineScrollerScene());
        canvas.init();
    }

}

Application.main();
