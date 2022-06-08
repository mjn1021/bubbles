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
    // private app: React.ComponentElement<any, any>;     // See NOTES.md
    private app: React.FunctionComponentElement<any>;     // See NOTES.md

    private visualSettings: VisualSettings;

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
     * The "effect" function of the Visual experiencing an update
     * @param options VisualUpdateOptions
     */
    public update(options: VisualUpdateOptions) {
        let dataView: DataView = options.dataViews[ 0 ];
        this.visualSettings = VisualSettings.parse<VisualSettings>(dataView);

        this.visualSettings.bubbles.largeBubbleCount = Math.max(0, this.visualSettings.bubbles.largeBubbleCount);
        this.visualSettings.bubbles.smallBubbleCount = Math.max(0, this.visualSettings.bubbles.smallBubbleCount);

        App.update(options, this.visualSettings);     // Instance-override will occur on Component mount and stil allows for multiple instances of the IVisual without issue
    }

    /**
     * Allow for React components to invoke a callback to the IVisual (e.g. message bus)
     */
    protected callback(...args: any) {
        console.log("@callback: ", ...args);
    }
}