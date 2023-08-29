/// <reference types="roll20" />
declare interface PageSelector {
    onPage(page: Page): number | undefined;
}
declare interface ToUnitsSelectorContext extends FromUnitsSelectorContext {
    toUnits: keyof ToUnitsSelector;
}
declare interface ToUnitsSelector {
    pageUnits(): PageSelector;
    pixels(): PageSelector;
    squares(): PageSelector;
}
declare interface FromUnitsSelectorContext extends ConvertContextType {
    fromUnits: keyof FromUnitsSelector;
}
declare interface FromUnitsSelector {
    pageUnits(): ToUnitsSelector;
    pixels(): ToUnitsSelector;
    squares(): ToUnitsSelector;
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
    byPythagoras(): UnitSelector;
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
