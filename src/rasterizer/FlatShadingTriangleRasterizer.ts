import { Framebuffer } from '../Framebuffer';
import { Vertex } from '../Vertex';
import { AbstractTriangleRasterizer } from './AbstractTriangleRasterizer';

export class FlatShadingTriangleRasterizer extends AbstractTriangleRasterizer {

    private temp: Vertex = null;

    constructor(private framebuffer: Framebuffer) {
        super();
    }

    /**
     * Triangle rasterization using edge-walking strategy for scan-conversion.
     * Internally DDA is used for edge-walking.
     */
    public drawTriangleDDA(framebuffer: Framebuffer, p1: Vertex, p2: Vertex, p3: Vertex): void {
        if (p1.projection.y > p3.projection.y) {
            this.temp = p1;
            p1 = p3;
            p3 = this.temp;
        }

        if (p1.projection.y > p2.projection.y) {
            this.temp = p1;
            p1 = p2;
            p2 = this.temp;
        }

        if (p2.projection.y > p3.projection.y) {
            this.temp = p2;
            p2 = p3;
            p3 = this.temp;
        }

        if (p1.projection.y === p3.projection.y) {
            return;
        } else if (p2.projection.y === p3.projection.y) {
            if (p2.projection.x > p3.projection.x) {
                this.temp = p2;
                p2 = p3;
                p3 = this.temp;
            }
            this.fillBottomFlatTriangle(framebuffer, p1, p2, p3);
        } else if (p1.projection.y === p2.projection.y) {
            if (p1.projection.x > p2.projection.x) {
                this.temp = p1;
                p1 = p2;
                p2 = this.temp;
            }
            this.fillTopFlatTriangle(framebuffer, p1, p2, p3);
        } else {
            const x: number = (p3.projection.x - p1.projection.x) *
                (p2.projection.y - p1.projection.y) / (p3.projection.y - p1.projection.y) + p1.projection.x;
            if (x > p2.projection.x) {
                this.fillLongRightTriangle(framebuffer, p1, p2, p3);
            } else {
                this.fillLongLeftTriangle(framebuffer, p1, p2, p3);
            }
        }
    }

    private fillBottomFlatTriangle(framebuffer: Framebuffer, v1: Vertex, v2: Vertex, v3: Vertex): void {
        const color: number = v1.color.toPackedFormat();

        const yDistance: number = v3.projection.y - v1.projection.y;

        const slope1: number = (v2.projection.x - v1.projection.x) / yDistance;
        const slope2: number = (v3.projection.x - v1.projection.x) / yDistance;

        const zslope1: number = (1 / v2.projection.z - 1 / v1.projection.z) / yDistance;
        const zslope2: number = (1 / v3.projection.z - 1 / v1.projection.z) / yDistance;

        let curz1: number = 1.0 / v1.projection.z;
        let curz2: number = 1.0 / v1.projection.z;

        let xPosition: number = v1.projection.x;
        let xPosition2: number = v1.projection.x;
        let yPosition: number = v1.projection.y;

        for (let i = 0; i < yDistance; i++) {
            const length = Math.round(xPosition2) - Math.round(xPosition);
            let framebufferIndex = Math.round(yPosition) * this.framebuffer.width + Math.round(xPosition);
            const spanzStep = (curz2 - curz1) / length;
            let wStart = curz1;
            for (let j = 0; j < length; j++) {
                if (wStart < this.framebuffer.wBuffer[framebufferIndex]) {
                    this.framebuffer.wBuffer[framebufferIndex] = wStart;
                    this.framebuffer.framebuffer[framebufferIndex] = color;
                }
                framebufferIndex++;
                wStart += spanzStep;
            }

            xPosition += slope1;
            xPosition2 += slope2;
            yPosition++;

            curz1 += zslope1;
            curz2 += zslope2;
        }
    }

    fillTopFlatTriangle(framebuffer: Framebuffer, v1: Vertex, v2: Vertex, v3: Vertex): void {
        const color: number = v1.color.toPackedFormat();

        const yDistance = v3.projection.y - v1.projection.y;
        const slope1 = (v3.projection.x - v1.projection.x) / yDistance;
        const slope2 = (v3.projection.x - v2.projection.x) / yDistance;

        const zslope1 = (1 / v3.projection.z - 1 / v1.projection.z) / yDistance;
        const zslope2 = (1 / v3.projection.z - 1 / v2.projection.z) / yDistance;

        let curz1 = 1.0 / v1.projection.z;
        let curz2 = 1.0 / v2.projection.z;

        let xPosition = v1.projection.x;
        let xPosition2 = v2.projection.x;
        let yPosition = v1.projection.y;

        for (let i = 0; i < yDistance; i++) {
            const length = Math.round(xPosition2) - Math.round(xPosition);
            let framebufferIndex = Math.round(yPosition) * this.framebuffer.width + Math.round(xPosition);
            for (let j = 0; j < length; j++) {
                const wStart = (curz2 - curz1) / (length) * j + curz1;
                if (wStart < this.framebuffer.wBuffer[framebufferIndex]) {
                    this.framebuffer.wBuffer[framebufferIndex] = wStart;
                    this.framebuffer.framebuffer[framebufferIndex] = color;
                }
                framebufferIndex++;
            }

            xPosition += slope1;
            xPosition2 += slope2;
            yPosition++;

            curz1 += zslope1;
            curz2 += zslope2;
        }
    }

    fillLongRightTriangle(framebuffer: Framebuffer, v1: Vertex, v2: Vertex, v3: Vertex): void {
        const color: number = v1.color.toPackedFormat();

        let yDistanceLeft = v2.projection.y - v1.projection.y;
        const yDistanceRight = v3.projection.y - v1.projection.y;

        let slope1 = (v2.projection.x - v1.projection.x) / yDistanceLeft;
        const slope2 = (v3.projection.x - v1.projection.x) / yDistanceRight;

        let zslope1 = (1 / v2.projection.z - 1 / v1.projection.z) / yDistanceLeft;
        const zslope2 = (1 / v3.projection.z - 1 / v1.projection.z) / yDistanceRight;

        let curz1 = 1.0 / v1.projection.z;
        let curz2 = 1.0 / v1.projection.z;

        let xPosition = v1.projection.x;
        let xPosition2 = v1.projection.x;
        let yPosition = v1.projection.y;

        for (let i = 0; i < yDistanceLeft; i++) {
            const length = Math.round(xPosition2) - Math.round(xPosition);
            let framebufferIndex = Math.round(yPosition) * this.framebuffer.width + Math.round(xPosition);
            const spanzStep = (curz2 - curz1) / length;
            let wStart = curz1;
            for (let j = 0; j < length; j++) {
                if (wStart < this.framebuffer.wBuffer[framebufferIndex]) {
                    this.framebuffer.wBuffer[framebufferIndex] = wStart;
                    this.framebuffer.framebuffer[framebufferIndex] = color;
                }
                framebufferIndex++;
                wStart += spanzStep;
            }

            xPosition += slope1;
            xPosition2 += slope2;
            yPosition++;

            curz1 += zslope1;
            curz2 += zslope2;
        }

        yDistanceLeft = v3.projection.y - v2.projection.y;
        slope1 = (v3.projection.x - v2.projection.x) / yDistanceLeft;
        zslope1 = (1 / v3.projection.z - 1 / v2.projection.z) / yDistanceLeft;

        xPosition = v2.projection.x;
        yPosition = v2.projection.y;

        for (let i = 0; i < yDistanceLeft; i++) {
            const length = Math.round(xPosition2) - Math.round(xPosition);
            let framebufferIndex = Math.round(yPosition) * this.framebuffer.width + Math.round(xPosition)
            const spanzStep = (curz2 - curz1) / length;
            let wStart = curz1;
            for (let j = 0; j < length; j++) {
                if (wStart < this.framebuffer.wBuffer[framebufferIndex]) {
                    this.framebuffer.wBuffer[framebufferIndex] = wStart;
                    this.framebuffer.framebuffer[framebufferIndex] = color;
                }
                framebufferIndex++;
                wStart += spanzStep;
            }

            xPosition += slope1;
            xPosition2 += slope2;
            yPosition++;

            curz1 += zslope1;
            curz2 += zslope2;
        }
    }


    fillLongLeftTriangle(framebuffer: Framebuffer, v1: Vertex, v2: Vertex, v3: Vertex): void {
        const color: number = v1.color.toPackedFormat();

        let yDistanceRight = v2.projection.y - v1.projection.y;
        const yDistanceLeft = v3.projection.y - v1.projection.y;

        let slope2 = (v2.projection.x - v1.projection.x) / yDistanceRight;
        const slope1 = (v3.projection.x - v1.projection.x) / yDistanceLeft;

        let zslope2 = (1 / v2.projection.z - 1 / v1.projection.z) / yDistanceRight;
        const zslope1 = (1 / v3.projection.z - 1 / v1.projection.z) / yDistanceLeft;

        let curz1 = 1.0 / v1.projection.z;
        let curz2 = 1.0 / v1.projection.z;

        let xPosition = v1.projection.x;
        let xPosition2 = v1.projection.x;
        let yPosition = v1.projection.y;

        for (let i = 0; i < yDistanceRight; i++) {
            const length = Math.round(xPosition2) - Math.round(xPosition);
            let framebufferIndex = Math.round(yPosition) * this.framebuffer.width + Math.round(xPosition);
            const spanzStep = (curz2 - curz1) / length;
            let wStart = curz1;
            for (let j = 0; j < length; j++) {
                if (wStart < this.framebuffer.wBuffer[framebufferIndex]) {
                    this.framebuffer.wBuffer[framebufferIndex] = wStart;
                    this.framebuffer.framebuffer[framebufferIndex] = color;
                }
                framebufferIndex++;
                wStart += spanzStep;
            }

            xPosition += slope1;
            xPosition2 += slope2;
            yPosition++;

            curz1 += zslope1;
            curz2 += zslope2;
        }

        yDistanceRight = v3.projection.y - v2.projection.y;
        slope2 = (v3.projection.x - v2.projection.x) / yDistanceRight;
        zslope2 = (1 / v3.projection.z - 1 / v2.projection.z) / yDistanceRight;

        curz2 = 1.0 / v2.projection.z;
        xPosition2 = v2.projection.x;
        yPosition = v2.projection.y;

        for (let i = 0; i < yDistanceRight; i++) {
            const length = Math.round(xPosition2) - Math.round(xPosition);
            let framebufferIndex = Math.round(yPosition) * this.framebuffer.width + Math.round(xPosition)
            const spanzStep = (curz2 - curz1) / length;
            let wStart = curz1;
            for (let j = 0; j < length; j++) {
                if (wStart < this.framebuffer.wBuffer[framebufferIndex]) {
                    this.framebuffer.wBuffer[framebufferIndex] = wStart;
                    this.framebuffer.framebuffer[framebufferIndex] = color;
                }
                framebufferIndex++;
                wStart += spanzStep;
            }

            xPosition += slope1;
            xPosition2 += slope2;
            yPosition++;

            curz1 += zslope1;
            curz2 += zslope2;
        }
    }

}
