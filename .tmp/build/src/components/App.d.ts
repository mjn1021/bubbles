import * as React from "react";
export declare const OptionsContext: React.Context<{}>;
export declare const StateContext: React.Context<{}>;
export declare function App({ callback, state, ...props }?: any): JSX.Element;
export declare namespace App {
    var update: (...args: any) => any;
}
export default App;
