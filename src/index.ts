/* eslint-disable @typescript-eslint/ban-ts-comment */

export interface UnitSelector {
  inPageUnits: (pageId?: string) => number;
  inPixels: () => number;
}

export interface MethodSelector {
  byFoure: () => UnitSelector;
  byManhattan: () => UnitSelector;
  byPythagoras: () => UnitSelector;
  byThreeFive: () => UnitSelector;
  byPageDistance: (pageId?: string) => UnitSelector | undefined;
}

export interface MethodSelectorContextType {
  distance: number;
}

export interface To {
  to: (a: Graphic | number, b?: number) => MethodSelector | undefined;
}

export interface ToContextType extends FromContextType {
  endGraphicPageId: string | undefined;
  endLeft: number;
  endTop: number;
}

export interface ILed {
  from: (a: Graphic | number, b?: number) => To | undefined;
}

export interface FromContextType {
  startGraphicPageId: string | undefined;
  startLeft: number;
  startTop: number;
}

export const Led = ((): ILed => {
  const pixelsPerSquare = 70;

  const getGraphicCenterCoords = (
    graphic: Graphic
  ): [number, number, string] => [
    graphic.get('left'),
    graphic.get('top'),
    graphic.get('_pageid'),
  ];

  const getOrValidateCoords = (
    a: Graphic | number,
    b?: number
  ): [number, number] | [number, number, string] | undefined => {
    if (typeof a === 'number' && typeof b === 'number') {
      return [a, b];
    } else if (typeof a === 'object' && typeof b === 'undefined') {
      return getGraphicCenterCoords(a);
    } else {
      log('LED-ERROR: LED received invalid input');
      return;
    }
  };

  const roundToGrid = (value: number): number =>
    (value / pixelsPerSquare) * pixelsPerSquare;

  const unitSelectorWithContext = ({
    distance,
  }: MethodSelectorContextType): UnitSelector => ({
    inPageUnits: (): number => Math.floor(distance / pixelsPerSquare),
    inPixels: (): number => distance,
  });

  const methodSelectorWithContext = ({
    startGraphicPageId,
    startLeft,
    startTop,
    endGraphicPageId,
    endLeft,
    endTop,
  }: ToContextType): MethodSelector | undefined => {
    const dx = endLeft - startLeft;
    const dy = endTop - startTop;

    const getPage = (): Page | undefined => {
      if (startGraphicPageId) {
        if (endGraphicPageId) {
          if (startGraphicPageId !== endGraphicPageId) {
            log(
              'LEG-ERROR: supplied graphics are on different pages, could not get current page'
            );
            return;
          }
          return getObj('page', startGraphicPageId);
        }
        return getObj('page', startGraphicPageId);
      } else if (endGraphicPageId) {
        return getObj('page', endGraphicPageId);
      }
      const campaign = Campaign();
      const playerpageid = campaign.get('playerpageid');
      return getObj('page', playerpageid);
    };

    const foureCalc = (): number => Math.max(dx, dy);

    const manhattanCalc = (): number => dx + dy;

    const pythagorasCalc = (): number => Math.sqrt(dx ** 2 + dy ** 2);

    const threeFiveCalc = (): number =>
      Math.max(dx, dy) + roundToGrid(Math.floor(Math.min(dx, dy) / 2));

    const getPageDistanceMethod = (
      diagonalType: string
    ): (() => number) | undefined => {
      switch (diagonalType) {
        case 'foure':
          return foureCalc;
        case 'manhattan':
          return manhattanCalc;
        case 'pythagoras':
          return pythagorasCalc;
        case 'threefive':
          return threeFiveCalc;
        default:
          return;
      }
    };
    const byPageDistance = (pageId?: string): UnitSelector | undefined => {
      const page = pageId ? getObj('page', pageId) : getPage();
      if (!page) {
        log('LED-ERROR: failed to get page');
        return;
      }

      const pageDiagonalType = page?.get('diagonaltype');
      if (!pageDiagonalType) {
        log('LED-ERROR: could not get page diagonaltype');
        return;
      }

      const distanceMethod = getPageDistanceMethod(pageDiagonalType);
      if (!distanceMethod) {
        log('LED-ERROR: invalid page diagonaltype');
        return;
      }

      const distance = distanceMethod();
      return unitSelectorWithContext({ distance });
    };

    return {
      byFoure: () => unitSelectorWithContext({ distance: foureCalc() }),
      byManhattan: () => unitSelectorWithContext({ distance: manhattanCalc() }),
      byPythagoras: () =>
        unitSelectorWithContext({ distance: pythagorasCalc() }),
      byThreeFive: () => unitSelectorWithContext({ distance: threeFiveCalc() }),
      byPageDistance,
    };
  };

  const toWithContext = ({
    startGraphicPageId,
    startLeft,
    startTop,
  }: FromContextType): To => ({
    to: (a: Graphic | number, b?: number): MethodSelector | undefined => {
      const coords = getOrValidateCoords(a, b);
      if (!coords) {
        return;
      }
      const [endLeft, endTop, endGraphicPageId] = coords;

      return methodSelectorWithContext({
        startGraphicPageId,
        startLeft,
        startTop,
        endGraphicPageId,
        endLeft,
        endTop,
      });
    },
  });

  return {
    from: (a: Graphic | number, b?: number): To | undefined => {
      const coords = getOrValidateCoords(a, b);
      if (!coords) {
        return;
      }
      const [startLeft, startTop, startGraphicPageId] = coords;

      return toWithContext({ startGraphicPageId, startLeft, startTop });
    },
  };
})();
