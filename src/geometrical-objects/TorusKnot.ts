import { Vector4f } from '../math/Vector4f';
import { AbstractGeometricObject } from './AbstractGeometricObject';

export class TorusKnot extends AbstractGeometricObject {

    public constructor(inverse: boolean = false) {
        super();

        const points: Array<Vector4f> = [];

        const STEPS = 80;
        const STEPS2 = 8;
        for (let i = 0; i < STEPS; i++) {
            const frame = this.torusFunction3(i * 2 * Math.PI / STEPS);
            const frame2 = this.torusFunction3(i * 2 * Math.PI / STEPS + 0.1);

            const tangent = frame2.sub(frame);
            let up = frame.add(frame2).normalize();
            const right = tangent.cross(up).normalize().mul(26.4);
            up = right.cross(tangent).normalize().mul(26.4);

            for (let r = 0; r < STEPS2; r++) {
                const pos = up.mul(Math.sin(r * 2 * Math.PI / STEPS2)).add(right.mul(Math.cos(r * 2 * Math.PI / STEPS2))).add(frame);
                points.push(pos.mul(1));
            }
        }

        const index: Array<number> = [];



        for (let j = 0; j < STEPS; j++) {
            for (let i = 0; i < STEPS2; i++) {
                index.push(((STEPS2 * j) + (1 + i) % STEPS2) % points.length); // 2
                index.push(((STEPS2 * j) + (0 + i) % STEPS2) % points.length); // 1
                index.push(((STEPS2 * j) + STEPS2 + (1 + i) % STEPS2) % points.length); // 3

                index.push(((STEPS2 * j) + STEPS2 + (0 + i) % STEPS2) % points.length); // 4
                index.push(((STEPS2 * j) + STEPS2 + (1 + i) % STEPS2) % points.length); // 3
                index.push(((STEPS2 * j) + (0 + i) % STEPS2) % points.length); // 5
            }
        }

        this.buildMesh(points, index, inverse);
    }

    private torusFunction3(alpha: number): Vector4f {
        const p = 2
        const q = 3;
        const r = 0.5 * (2 + Math.sin(q * alpha));
        return new Vector4f(r * Math.cos(p * alpha),
            r * Math.cos(q * alpha),
            r * Math.sin(p * alpha)).mul(70);
    }

}
