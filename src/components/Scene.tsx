import * as React from "react";
import { v4 as uuid } from "uuid";
import { useState, useEffect, useContext } from "react";

import Canvas from "./Canvas2D";

import { OptionsContext } from "./App";

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
            if(aabb.left <= 0) {
                this.pos.x = resetValue;
            }
            if(aabb.right >= width) {
                this.pos.x = width - resetValue;
            }            
            if(aabb.top <= 0) {
                this.pos.y = resetValue;
            }
            if(aabb.bottom >= height) {
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
    const context = useContext(OptionsContext);
    const [ canvas, setCanvas ] = useState(document.createElement("canvas"));
    const [ shapes, setShapes ] = useState([]);
    const [ ticks, setTicks ] = useState(0);
    const size = 5;

    useEffect(() => {
        setCanvasSize(canvas);

        const circles = [];
        const magnitude = 150;
        const speed = [ -magnitude, magnitude ];
        for (let i = 0; i < 100; i++) {
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
        for (let i = 0; i < 500; i++) {
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
    }, []);
    useEffect(() => {
        setCanvasSize(canvas);
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
        <>
            <Canvas
                master={ canvas }
                onDraw={ onDraw }
                style={ {
                    position: "absolute",
                    top: 0,
                    left: 0,
                } }
            />

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
        </>
    )
}

export default Scene;