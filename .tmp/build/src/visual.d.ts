import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
export declare class Visual implements IVisual {
    private target;
    /**
     * This is the main React app
     */
    private app;
    /**
     * This is the main configuration object (i.e. "Format your visual" settings)
     */
    private visualSettings;
    /**
     * Initialize the React act similarly to CRA's `index.js` bootstraping
     * Here `this.target` is the typical `#root`
     */
    constructor(options: VisualConstructorOptions);
    enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration;
    /**
     * This is triggered by any update that the visual has.
     */
    update(options: VisualUpdateOptions): void;
    /**
     * Allow for React components to invoke a callback to the IVisual (e.g. message bus)
     */
    protected callback(...args: any): void;
}
