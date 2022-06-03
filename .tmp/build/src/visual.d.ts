import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
export declare class Visual implements IVisual {
    private target;
    private app;
    constructor(options: VisualConstructorOptions);
    /**
     * The "effect" function of the Visual experiencing an update
     * @param options VisualUpdateOptions
     */
    update(options: VisualUpdateOptions): void;
    /**
     * Allow for React components to invoke a callback to the IVisual (e.g. message bus)
     */
    protected callback(...args: any): void;
}
