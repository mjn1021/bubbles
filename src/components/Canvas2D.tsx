import * as React from "react";
import { useState, useEffect, useReducer, useRef } from "react";

function timeReducer(time: Array<number>, newTime: number) {
    const [ prev2, prev ] = time;

    if(prev === newTime) {
        return time;
    }

    return [ prev, newTime, (newTime - prev) / 1000 ];
};

export function Canvas({ master, onDraw, style }: any = {}) {
    const container = useRef(null);
    const [ canvas, setCanvas ] = useState(master || document.createElement("canvas"));
    const [ ctx, setCtx ] = useState(canvas.getContext("2d"));
    const [ time, setTime ] = useReducer(timeReducer, [ 0, 0, 0 ]);

    /**
     * Set up canvas and 2d context
     */
    useEffect(() => {
        if("viewport" in ctx) {
            master.width = ctx[ "viewport" ].width;
            master.height = ctx[ "viewport" ].height;
        }
        
        draw();     // Redraw on any canvas context update
    }, [ ctx ]);
    useEffect(() => {
        container.current.innerHTML = "";
        container.current.append(master);
    }, [ container, master ]);

    /**
     * Draw loop
     */
    useEffect(() => {
        const [ p, c, dt ] = time;
        const dtn = dt / 1000;

        draw();
    }, [ time ]);

    /**
     * Render graphics
     */
    function draw() {
        window.requestAnimationFrame((t) => {
            if(typeof onDraw === "function") {
                onDraw(ctx, time);
            }

            setTime(t);
        });
    }

    return (
        <div
            className="unset-all"
            ref={ container }
            style={ style }
        />
    )
}

export default Canvas;