import { Vector2f } from '../../math/index';
import { Texture } from '../../texture/index';
import { Camera } from './Mode7Renderer';

export abstract class Mode7Entity {

    public position: Vector2f;
    public height: number;
    public priority: number;

    public constructor(position: Vector2f, height: number = 0, priority: number = 0) {
        this.position = position;
        this.height = height;
        this.priority = priority;
    }

    public abstract getTexture(camera: Camera): Texture;

    public abstract getAlpha(): number;

    public getPriority(): number {
        return this.priority;
    }

}