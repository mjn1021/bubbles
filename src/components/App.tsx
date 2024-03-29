import * as React from "react";
import { useReducer, useEffect } from "react";

import Scene from "./Scene";

export const OptionsContext = React.createContext({});
export const StateContext = React.createContext({});

/**
 * At the time of experimentation, `useState` did not work, but `useReducer` did.
 * As such, create a trivial reducer that mimics `useState`.
 */
function optionsReducer(current: any, next: any): any {
    return next;
};

export function App({ callback, state = {}, ...props }: any = {}) {
    const [ options, setOptions ] = useReducer(optionsReducer, {});

    /**
     * This mounting assignment is necessary to bind the state-Context appropriately and allow for .update to be invoked by the IVisual.update function
     */
    useEffect(() => {
        App.update = (opts: any, viz: any): any => {
            setOptions({
                options: opts,
                visualSettings: viz,
            });
        };

        /**
         * Recreate the placeholder function on unmount
         */
        return () => {
            App.update = (...args: any): any => void 0;
        }
    }, []);

    return (
        <OptionsContext.Provider value={ options }>
            <StateContext.Provider value={ state }>
                <Scene />
            </StateContext.Provider>
        </OptionsContext.Provider>
    );
}

/**
 * Create a placeholder function for mounting
 */
App.update = (...args: any): any => void 0;

export default App;