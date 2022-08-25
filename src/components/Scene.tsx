import * as React from "react";
import { v4 as uuid } from "uuid";
import { useState, useEffect, useContext } from "react";

import Canvas from "./Canvas2D";

import { OptionsContext } from "./App";

/**
 * README:
 * 
 * There's a lot to unpack here, but really just look at Scene
 * at the bottom and work backward.  Basically everything else in 
 * this file is facilitating Scene's work.
 * 
 * This particular scene renders a bunch of bubbles that will float around
 * the visual, bouncing off of walls.  You can change the number of bubbles
 * in Power BI itself, by changing the visual's settings there.
 */




export function rand(min = 0, max = 100) {
    return ~~(Math.random() * max + min);
};
export function rgb(r?: any, g?: any, b?: any, a?: any) {
    if (typeof r !== "number") {
        r = rand(0, 255);
    }
    if (typeof g !== "number") {
        g = rand(0, 255);
    }
    if (typeof b !== "number") {
        b = rand(0, 255);
    }
    if (typeof a !== "number") {
        a = 1;
    }

    return `rgb(${r}, ${g}, ${b}, ${a})`;
};
export function randRGB() {
    return rgb();
};
export function randRGBA(alpha = 1.0) {
    return rgb(true, true, true, alpha);
};

export function setCanvasSize(canvas: HTMLCanvasElement, width?: number, height?: number) {
    if (width && height) {
        canvas.width = width;
        canvas.height = height;
    } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    return canvas;
};

export class Vector {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    dotProduct(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    clamp(min, max) {
        const x = Math.max(min, Math.min(max, this.x));
        const y = Math.max(min, Math.min(max, this.y));

        return new Vector(x, y);
    }

    get magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    get direction() {
        return Math.atan2(this.x, this.y);
    }
};

export class Shape {
    public id: string = uuid();
    public pos: Vector = new Vector(0, 0);
    public vel: Vector = new Vector(0, 0);
    public collisions: Set<Shape> = new Set<Shape>();

    constructor(pos: any, vel?: any) {
        this.setPos(pos);
        this.setVel(vel);
    }

    getCollisions(asIterator = true) {
        if (asIterator) {
            return this.collisions.values();
        }

        return Array.from(this.collisions.values());
    }

    setPos(input: any) {
        let x = 0,
            y = 0;
        if (Array.isArray(input)) {
            x = input[ 0 ];
            y = input[ 1 ];
        } else if (typeof input === "object") {
            x = input.x;
            y = input.y;
        }

        this.pos = new Vector(x, y);

        return this;
    }
    getPos() {
        return [
            ~~this.pos.x,
            ~~this.pos.y,
        ];
    }
    setVel(input: any) {
        let vx = 0,
            vy = 0;
        if (Array.isArray(input)) {
            vx = input[ 0 ];
            vy = input[ 1 ];
        } else if (typeof input === "object") {
            vx = input.x;
            vy = input.y;
        }

        this.vel = new Vector(vx, vy);

        return this;
    }
    getVel() {
        return [
            this.vel.x,
            this.vel.y,
        ];
    }

    static CollisionVector = (c1, c2) => {
        return c1.vel.subtract(
            c1.pos
                .subtract(c2.pos)
                .multiply(
                    c1.vel
                        .subtract(c2.vel)
                        .dotProduct(c1.pos.subtract(c2.pos))
                    /
                    c1.pos
                        .subtract(c2.pos).magnitude ** 2)
                .multiply((2 * c2.mass) / (c1.mass + c2.mass))
        );
    };
};

export class Circle extends Shape {
    public radius: number;
    public color: string;

    constructor(pos: any, radius: number, vel?: any, color?: string) {
        super(pos, vel);

        this.radius = radius;
        this.color = color || rgb(128, 128, 128, 1.0);
    }

    get mass() {
        return 4 * Math.PI * this.radius ** 2;
    }

    hasIntersection(x: number | Circle, y?: number, radius?: number) {
        if (x instanceof Circle) {
            const circle = x;

            return Math.hypot(this.pos.x - circle.pos.x, this.pos.y - circle.pos.y) <= (this.radius + circle.radius);
        } else {
            return Math.hypot(this.pos.x - x, this.pos.y - y) <= (this.radius + radius);
        }
    }

    getAABB() {
        return {
            left: this.pos.x - this.radius,
            right: this.pos.x + this.radius,
            top: this.pos.y - this.radius,
            bottom: this.pos.y + this.radius,
        };
    }

    updatePosition(dt: number) {
        this.pos.x = this.pos.x + this.vel.x * dt;
        this.pos.y = this.pos.y + this.vel.y * dt;

        return this;
    }

    update(dt: number, state: any) {
        const { width, height, shapes } = state;
        const aabb = this.getAABB();

        if (aabb.left <= 0 || aabb.right >= width) {
            this.vel = new Vector(-this.vel.x, this.vel.y);

            const resetValue = this.radius;
            if (aabb.left <= 0) {
                this.pos.x = resetValue;
            }
            if (aabb.right >= width) {
                this.pos.x = width - resetValue;
            }
            if (aabb.top <= 0) {
                this.pos.y = resetValue;
            }
            if (aabb.bottom >= height) {
                this.pos.y = height - resetValue;
            }
        }
        if (aabb.top <= 0 || aabb.bottom >= height) {
            this.vel = new Vector(this.vel.x, -this.vel.y);
        }

        // const lossFactor = 1;
        // for (let circle of shapes) {
        //     if (this === circle || this.collisions.has(circle)) {
        //     // if (this === circle) {
        //         continue;
        //     }

        //     if (this.hasIntersection(circle)) {                
        //         const v1 = Shape.CollisionVector(this, circle);
        //         const v2 = Shape.CollisionVector(circle, this);

        //         this.vel = v1.multiply(lossFactor).clamp(-150, 150);
        //         circle.vel = v2.multiply(lossFactor).clamp(-150, 150);

        //         this.collisions.add(circle);
        //         circle.collisions.add(this);

        //         // this.color = rgb();
        //     }

        //     if(Math.random() > 0.999995 && circle.mass < 100) {
        //         circle.pos = new Vector(
        //             rand(0, 1000),
        //             rand(0, 1000),
        //         )
        //     }
        // }

        this.updatePosition(dt);
    }
}

export function Scene() {
    //TODO TypeScript is failing to recognize the { options, visualSettings } on @context -- add definition mappings
    const context = useContext(OptionsContext);
    const [ canvas, setCanvas ] = useState(document.createElement("canvas"));
    const [ shapes, setShapes ] = useState([]);
    const [ ticks, setTicks ] = useState(0);
    const size = 5;

    useEffect(() => {
        setCanvasSize(canvas);

        //NOTE  See TODO above
        const largeBubbleCount = context[ "visualSettings" ] ? context[ "visualSettings" ].bubbles.largeBubbleCount : 10;
        const smallBubbleCount = context[ "visualSettings" ] ? context[ "visualSettings" ].bubbles.smallBubbleCount : 10;

        const circles = [];
        const magnitude = 150;
        const speed = [ -magnitude, magnitude ];
        for (let i = 0; i < largeBubbleCount; i++) {
            const circle: Circle = new Circle(
                [
                    rand(0 + size * 2, canvas.width - size * 2),
                    rand(0 + size * 2, canvas.height - size * 2),
                ],
                rand(size, size * 3),
                [
                    rand(...speed),
                    rand(...speed),
                ],
            );

            circles.push(circle);
        }
        for (let i = 0; i < smallBubbleCount; i++) {
            const circle: Circle = new Circle(
                [
                    rand(0 + size * 2, canvas.width - size * 2),
                    rand(0 + size * 2, canvas.height - size * 2),
                ],
                rand(1, size),
                [
                    rand(...speed),
                    rand(...speed),
                ],
            );

            circles.push(circle);
        }

        setShapes(circles);
    }, [ canvas, context ]);

    function clearCanvas(ctx) {
        //? Blur-to-Full Clear
        const alpha = 0.75;
        ctx.fillStyle = `rgba(35, 35, 35, ${alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        //? Full clear
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    function onDraw(ctx, [ previous, current, dt ]) {
        clearCanvas(ctx);

        for (let circle of shapes) {
            circle.update(dt, {
                width: canvas.width,
                height: canvas.height,
                shapes,
            });

            ctx.beginPath();
            ctx.arc(...circle.getPos(), circle.radius, 0, 2 * Math.PI);
            ctx.closePath();

            ctx.fillStyle = rgb(86, 139, 214, 0.5);
            ctx.strokeStyle = rgb(255, 255, 255);
            ctx.strokeWidth = 30;
            // ctx.fillStyle = circle.color;
            ctx.fill();
            ctx.stroke();
        }

        for (let circle of shapes) {
            circle.collisions.clear();
        }

        ctx.fillStyle = "#000";

        setTicks(ticks + 1);
    }

    return (
        <div>
            <Canvas
                master={ canvas }
                onDraw={ onDraw }
                style={ {
                    position: "absolute",
                    top: 0,
                    left: 0,
                } }
            />

            {/* <div
                style={ {
                    position: "absolute",
                    top: Math.random() * 100,
                    left: Math.random() * 100,
                    zIndex: 9999,
                    color: "#fff",
                } }
            >cats</div> */}
            
            <div
                style={ {
                    height: "100%",
                    position: "absolute",
                    top: "calc(100% - 150px)",
                    left: "calc(100% - 220px)",
                    zIndex: 9999,
                    color: "#fff",
                } }
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 192.756 192.756">
                    <g fill-rule="evenodd" clip-rule="evenodd">
                        <path fill="transparent" d="M0 0h192.756v192.756H0V0z" />
                        <path fill="#fff" d="M180.258 88.183a13.555 13.555 0 0 0-9.646-3.994c-5.143 0-9.627 2.862-11.949 7.077a13.741 13.741 0 0 0-2.312-3.083 13.551 13.551 0 0 0-9.645-3.994c-4.1 0-7.773 1.826-10.275 4.698v-3.292h-3.355v12.067c-.002.057-.01.109-.01.166h.01v19.783h3.355V97.656a10.203 10.203 0 0 1 3.004-7.1 10.212 10.212 0 0 1 7.271-3.012c2.746 0 5.33 1.07 7.271 3.012a10.203 10.203 0 0 1 3.004 7.1v.006c0 .057-.008.109-.008.166h.008v19.783h3.355V97.828h.008c0-.059-.006-.115-.008-.172a10.212 10.212 0 0 1 3.004-7.1 10.219 10.219 0 0 1 7.271-3.012c2.748 0 5.33 1.07 7.273 3.012a10.216 10.216 0 0 1 3.004 7.1V117.611h3.355V99.506c.008 0 .008-1.678.008-1.678a13.548 13.548 0 0 0-3.993-9.645zM86.517 73.432v44.179h3.356V73.432h-3.356zM111.543 83.741c4.752 0 9.221 1.851 12.58 5.211 3.361 3.36 5.211 7.829 5.211 12.581s-1.85 9.221-5.211 12.58c-3.359 3.361-7.828 5.211-12.58 5.211s-9.221-1.85-12.58-5.211a17.67 17.67 0 0 1-5.211-12.58c-.001-9.81 7.98-17.792 17.791-17.792zm0 3.356c-3.855 0-7.48 1.501-10.209 4.229-2.727 2.727-4.229 6.353-4.229 10.208s1.502 7.48 4.229 10.207a14.35 14.35 0 0 0 10.209 4.229c7.961 0 14.436-6.475 14.436-14.436 0-3.855-1.5-7.481-4.227-10.208a14.345 14.345 0 0 0-10.209-4.229zM40.38 73.432v44.179h3.356V73.432H40.38zM49.432 101.533a14.34 14.34 0 0 1 4.229-10.208c2.726-2.727 6.352-4.229 10.208-4.229s7.482 1.501 10.208 4.229a14.314 14.314 0 0 1 4.192 9.466v1.455c-.375 7.627-6.68 13.723-14.4 13.723a14.342 14.342 0 0 1-10.208-4.229 14.338 14.338 0 0 1-4.229-10.207zm-3.355 0c0 4.752 1.851 9.221 5.211 12.58 3.36 3.361 7.828 5.211 12.581 5.211s9.22-1.85 12.581-5.211a17.782 17.782 0 0 0 1.819-2.16v5.658h3.355V85.595h-3.355v5.518a17.95 17.95 0 0 0-1.819-2.16 17.68 17.68 0 0 0-12.581-5.211c-9.811-.001-17.792 7.981-17.792 17.791zM8.504 106.705c0 3.043 1.291 6.148 3.452 8.311 2.65 2.65 6.475 3.994 11.368 3.994 6.548 0 10.659-2.012 12.568-6.148.605-1.311 1.382-4.635-.003-7.84-1.032-2.385-3.066-4.141-5.883-5.08a367.135 367.135 0 0 0-7.21-2.332 83.038 83.038 0 0 1-3.107-1.014c-2.896-1.021-4.027-2.462-3.783-4.816.336-3.248 3.797-5.346 8.817-5.346 5.268 0 7.897 3.185 8.112 6.403l3.348.056c-.326-4.877-4.367-9.814-11.46-9.814-6.753 0-11.638 3.358-12.155 8.355-.282 2.732.53 6.394 6.004 8.326 1.109.391 1.996.668 3.223 1.053 1.479.463 3.506 1.098 7.151 2.312 1.913.637 3.213 1.725 3.864 3.229.874 2.021.402 4.311.036 5.102-.53 1.148-1.938 4.199-9.521 4.199-3.971 0-6.998-1.014-8.996-3.012-2.291-2.291-2.469-5.123-2.469-5.938H8.504z" />
                    </g>
                </svg>
            </div>

            {/* <table style={ {
                position: "absolute",
                left: 0,
                top: 0,
                backgroundColor: `#fff`,
                color: `#000`,
                border: `1px solid #000`,
                borderRadius: 4,
                padding: 4,
            } }>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Pos</th>
                        <th>Vel</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        shapes.map((shape, i) => (
                            <tr>
                                <td>{ shape.id.substring(0, 8) }</td>
                                <td>[ { ~~shape.pos.x }, { ~~shape.pos.y } ]</td>
                                <td>[ { shape.vel.x.toFixed(1) }, { shape.vel.y.toFixed(1) } ]</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table> */}
        </div>
    )
}

export default Scene;