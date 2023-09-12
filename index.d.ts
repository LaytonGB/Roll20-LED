/// <reference types="roll20" />
type ConversionUnits = 'pageUnits' | 'pixels' | 'squares';
declare interface PageSelector {
    onPage(page: Page): number | undefined;
}
declare interface ToUnitsSelectorContext extends FromUnitsSelectorContext {
    toUnits: ConversionUnits;
}
declare interface ToUnitsSelector {
    toPageUnits(): PageSelector;
    toPixels(): PageSelector;
    toSquares(): PageSelector;
}
declare interface FromUnitsSelectorContext extends ConvertContextType {
    fromUnits: ConversionUnits;
}
declare interface FromUnitsSelector {
    fromPageUnits(): ToUnitsSelector;
    fromPixels(): ToUnitsSelector;
    fromSquares(): ToUnitsSelector;
}
declare interface ConvertContextType {
    value: number;
}
declare interface UnitSelector {
    inPageUnits(pageId?: string): number | undefined;
    inPixels(): number;
    inSquares(pageId?: string): number | undefined;
}
declare interface MethodSelectorContextType {
    distance: number;
    page?: Page;
    startGraphicPageId: string | undefined;
    endGraphicPageId: string | undefined;
}
declare interface MethodSelector {
    byFoure(): UnitSelector;
    byManhattan(): UnitSelector;
    byPythagorean(): UnitSelector;
    byThreeFive(pageId?: string): UnitSelector | undefined;
    byPageDistance(pageId?: string): UnitSelector | undefined;
}
declare interface ToContextType extends FromContextType {
    endGraphicPageId: string | undefined;
    endLeft: number;
    endTop: number;
}
declare interface To {
    to(a: Graphic | number, b?: number): MethodSelector | undefined;
}
declare interface FromContextType {
    startGraphicPageId: string | undefined;
    startLeft: number;
    startTop: number;
}
declare interface ILed {
    convert(value: number): FromUnitsSelector;
    from(a: Graphic | number, b?: number): To | undefined;
}
declare const Led: ILed;
