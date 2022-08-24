/// <reference types="react" />
/**
 * This basically uses @master as the master canvas element and
 * @onDraw and its main drawing function.  It is currently invoked
 * by a time-state loop, invoked by the animation frame call.  There
 * are better ways to handle this, but this is primarily a POC.
 *
 * NOTE: I've had mixed luck with `useState` actually invoking an update,
 * but `useReducer` seems to work reliably.
 */
export declare function Canvas({ master, onDraw, style }?: any): JSX.Element;
export default Canvas;
