import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
/**
 * This is basically where you actually declare all of the potential settings
 * that you might like to utilize.  As you can see, there are more options here
 * than are present in the visual -- this only initializes them, you must still
 * add them to the context.
 */
export declare class BubbleSettings {
    largeBubbleCount: number;
    largeBubbleRadius: number;
    largeBubbleSpeed: number;
    smallBubbleCount: number;
    smallBubbleRadius: number;
    smallBubbleSpeed: number;
}
/**
 * Establish the above settings as the main settings.
 */
export declare class VisualSettings extends DataViewObjectsParser {
    bubbles: BubbleSettings;
}
