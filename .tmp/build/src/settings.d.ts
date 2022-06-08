import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
export declare class BubbleSettings {
    largeBubbleCount: number;
    largeBubbleRadius: number;
    largeBubbleSpeed: number;
    smallBubbleCount: number;
    smallBubbleRadius: number;
    smallBubbleSpeed: number;
}
export declare class VisualSettings extends DataViewObjectsParser {
    bubbles: BubbleSettings;
}
