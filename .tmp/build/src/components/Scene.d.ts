/// <reference types="react" />
export declare function rand(min?: number, max?: number): number;
export declare function rgb(r?: any, g?: any, b?: any, a?: any): string;
export declare function randRGB(): string;
export declare function randRGBA(alpha?: number): string;
export declare function setCanvasSize(canvas: HTMLCanvasElement, width?: number, height?: number): HTMLCanvasElement;
export declare class Vector {
    x: number;
    y: number;
    constructor(x: number, y: number);
    add(vector: any): Vector;
    subtract(vector: any): Vector;
    multiply(scalar: any): Vector;
    dotProduct(vector: any): number;
    clamp(min: any, max: any): Vector;
    get magnitude(): number;
    get direction(): number;
}
export declare class Shape {
    id: string;
    pos: Vector;
    vel: Vector;
    collisions: Set<Shape>;
    constructor(pos: any, vel?: any);
    getCollisions(asIterator?: boolean): IterableIterator<Shape> | Shape[];
    setPos(input: any): this;
    getPos(): number[];
    setVel(input: any): this;
    getVel(): number[];
    static CollisionVector: (c1: any, c2: any) => any;
}
export declare class Circle extends Shape {
    radius: number;
    color: string;
    constructor(pos: any, radius: number, vel?: any, color?: string);
    get mass(): number;
    hasIntersection(x: number | Circle, y?: number, radius?: number): boolean;
    getAABB(): {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    updatePosition(dt: number): this;
    update(dt: number, state: any): void;
}
export declare function Scene(): JSX.Element;
export default Scene;
