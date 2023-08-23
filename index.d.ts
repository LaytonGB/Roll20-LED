/// <reference types="roll20" />
declare interface UnitSelector {
  inPageUnits: (pageId?: string) => number;
  inPixels: () => number;
}
declare interface MethodSelector {
  byFoure: () => UnitSelector;
  byManhattan: () => UnitSelector;
  byPythagoras: () => UnitSelector;
  byThreeFive: () => UnitSelector;
  byPageDistance: (pageId?: string) => UnitSelector | undefined;
}
declare interface MethodSelectorContextType {
  distance: number;
}
declare interface To {
  to: (a: Graphic | number, b?: number) => MethodSelector | undefined;
}
declare interface ToContextType extends FromContextType {
  endGraphicPageId: string | undefined;
  endLeft: number;
  endTop: number;
}
declare interface ILed {
  from: (a: Graphic | number, b?: number) => To | undefined;
}
declare interface FromContextType {
  startGraphicPageId: string | undefined;
  startLeft: number;
  startTop: number;
}
declare const Led: ILed;
