import * as React from "react";
import { useState, useEffect, useReducer, useRef } from "react";

/**
 * A trivial state-reducer to compensate for the NOTE in
 * Canvas below.
 */
function timeReducer(time: Array<number>, newTime: number) {
    const [ prev2, prev ] = time;

    if(prev === newTime) {
        return time;
    }

    return [ prev, newTime, (newTime - prev) / 1000 ];
};

/**
 * This basically uses @master as the master canvas element and
 * @onDraw and its main drawing function.  It is currently invoked
 * by a time-state loop, invoked by the animation frame call.  There
 * are better ways to handle this, but this is primarily a POC.
 * 
 * NOTE: I've had mixed luck with `useState` actually invoking an update,
 * but `useReducer` seems to work reliably.
 */
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
     * This is somewhat of a shim to facilitate the animation frame drawing,
     * basically just forcing React to update this component per draw.
     */
    useEffect(() => {
        const [ p, c, dt ] = time;
        const dtn = dt / 1000;

        draw();
    }, [ time ]);

    /**
     * Render graphics
     * Using the effect hook with `setTime` forces the component
     * to update, matching the draw.
     * 
     * NOTE: It's not usually necessary to have a React component update to draw
     * to the canvas, but those paradigms weren't working well in testing,
     * thus this modified approach.  Something like PixiJS might be able
     * to really overhaul this by leveraging GPU acceleration and its internal
     * timers might resolve this.
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