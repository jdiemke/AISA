import { Canvas } from '../../Canvas';
import { TitanEffectScene } from './TitanEffectScene';

class Application {

    public static main(): void {
        const canvas: Canvas = new Canvas(320, 200, new TitanEffectScene());
        canvas.appendTo(document.getElementById('aisa'));
        canvas.init();
    }

}

Application.main();
