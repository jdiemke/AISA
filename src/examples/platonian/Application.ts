import { Canvas } from '../../Canvas';
import { PlatonianScene } from './PlatonianScene';

class Application {

    public static main(): void {
        const canvas: Canvas = new Canvas(320, 200, new PlatonianScene());
        canvas.init();
    }

}

Application.main();
