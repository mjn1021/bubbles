/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import DataView = powerbi.DataView;
import { VisualSettings } from "./settings";
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;

import * as React from "react";
import * as ReactDOM from "react-dom";

import App from "./components/App";

export class Visual implements IVisual {
    private target: HTMLElement;

    /**
     * This is the main React app
     */
    private app: React.FunctionComponentElement<any>;   // Use this with React Hooks (i.e. functional components)
    // private app: React.ComponentElement<any, any>;   // Use this with React Classes (i.e. class components)

    /**
     * This is the main configuration object (i.e. "Format your visual" settings)
     */
    private visualSettings: VisualSettings;

    /**
     * Initialize the React similarly to CRA's `index.js` bootstraping
     * Here `this.target` is the typical `#root`
     */
    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.app = React.createElement(App, {
            callback: this.callback.bind(this)
        });

        ReactDOM.render(this.app, this.target);
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
        const settings: VisualSettings = this.visualSettings || <VisualSettings>VisualSettings.getDefault();
        
        return VisualSettings.enumerateObjectInstances(settings, options);
    }
    
    /**
     * This is triggered by any update that the visual has.
     */
    public update(options: VisualUpdateOptions) {
        /**
         * This is the actual data in the visual
         */
        let dataView: DataView = options.dataViews[ 0 ];

        /**
         * Read and (re)assign any modified options.  Changes appears to trigger automatically
         * whenever you invoke a settings change in the visual (e.g. enter a value and press "Enter"),
         * though in some cases the visual *may* need to have at least *some* data element attached to it
         * in order to invoke the update.
         */
        this.visualSettings = VisualSettings.parse<VisualSettings>(dataView);

        this.visualSettings.bubbles.largeBubbleCount = Math.max(0, this.visualSettings.bubbles.largeBubbleCount);
        this.visualSettings.bubbles.smallBubbleCount = Math.max(0, this.visualSettings.bubbles.smallBubbleCount);

        /**
         * Create a static binding to an update hook on the React side.  This allows the PBI
         * data to flow into the React context.
         * 
         * NOTE: Instance-overrides will occur on Component mount and stil allows for multiple instances of the IVisual without issue.
         */
        App.update(options, this.visualSettings);
    }

    /**
     * Allow for React components to invoke a callback to the IVisual (e.g. message bus)
     */
    protected callback(...args: any) {
        console.log("@callback: ", ...args);
    }
}