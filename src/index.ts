/* eslint-disable @typescript-eslint/ban-ts-comment */

type ConversionUnits = 'pageUnits' | 'pixels' | 'squares';

export interface PageSelector {
  onPage(page: Page): number | undefined;
}

export interface ToUnitsSelectorContext extends FromUnitsSelectorContext {
  toUnits: ConversionUnits;
}

export interface ToUnitsSelector {
  toPageUnits(): PageSelector;
  toPixels(): PageSelector;
  toSquares(): PageSelector;
}

export interface FromUnitsSelectorContext extends ConvertContextType {
  fromUnits: ConversionUnits;
}

export interface FromUnitsSelector {
  fromPageUnits(): ToUnitsSelector;
  fromPixels(): ToUnitsSelector;
  fromSquares(): ToUnitsSelector;
}

export interface ConvertContextType {
  value: number;
}

export interface UnitSelector {
  inPageUnits(pageId?: string): number | undefined;
  inPixels(): number;
  inSquares(pageId?: string): number | undefined;
}

export interface MethodSelectorContextType {
  distance: number;
  page?: Page;
  startGraphicPageId: string | undefined;
  endGraphicPageId: string | undefined;
}

export interface MethodSelector {
  byFoure(): UnitSelector;
  byManhattan(): UnitSelector;
  byPythagorean(): UnitSelector;
  byThreeFive(pageId?: string): UnitSelector | undefined;
  byPageDistance(pageId?: string): UnitSelector | undefined;
}

export interface ToContextType extends FromContextType {
  endGraphicPageId: string | undefined;
  endLeft: number;
  endTop: number;
}

export interface To {
  to(a: Graphic | number, b?: number): MethodSelector | undefined;
}

export interface FromContextType {
  startGraphicPageId: string | undefined;
  startLeft: number;
  startTop: number;
}

export interface ILed {
  convert(value: number): FromUnitsSelector;
  from(a: Graphic | number, b?: number): To | undefined;
}

export const Led = ((): ILed => {
  const errorPrefix = 'LED-ERROR:';

  const getGraphicCenterCoords = (graphic: Graphic): [number, number, string] => [
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
      log(`${errorPrefix} LED received invalid input`);
      return;
    }
  };

  const getPageByDetailsOrPlayerPage = (
    startGraphicPageId: string | undefined,
    endGraphicPageId: string | undefined,
    pageId?: string
  ): Page | undefined => {
    if (pageId) return getObj('page', pageId);

    if (startGraphicPageId) {
      if (endGraphicPageId && startGraphicPageId !== endGraphicPageId) {
        log(`${errorPrefix} supplied graphics are on different pages, could not get current page`);
        return;
      }
      return getObj('page', startGraphicPageId);
    } else if (endGraphicPageId) {
      return getObj('page', endGraphicPageId);
    }
    const campaign = Campaign();
    const playerpageid = campaign.get('playerpageid');
    return getObj('page', playerpageid);
  };

  const getPixelsPerSquare = (page: Page): number | undefined => 70 / page.get('snapping_increment');

  const getScaleNumber = (page: Page): number | undefined => page.get('scale_number');

  const roundToGrid = (value: number, pixelsPerSquare: number): number =>
    Math.floor(value / pixelsPerSquare) * pixelsPerSquare;

  const unitSelectorWithContext = ({
    distance,
    page,
    startGraphicPageId,
    endGraphicPageId,
  }: MethodSelectorContextType): UnitSelector => ({
    inPageUnits: (pageId?: string): number | undefined => {
      if (!page) page = getPageByDetailsOrPlayerPage(startGraphicPageId, endGraphicPageId, pageId);
      if (!page) return;

      const pixelsPerSquare = getPixelsPerSquare(page);
      const scaleNumber = getScaleNumber(page);
      if (!pixelsPerSquare || !scaleNumber) return;

      return Math.floor((distance / pixelsPerSquare) * scaleNumber);
    },
    inPixels: () => distance,
    inSquares: (pageId?: string): number | undefined => {
      if (!page) page = getPageByDetailsOrPlayerPage(startGraphicPageId, endGraphicPageId, pageId);
      if (!page) return;

      const pixelsPerSquare = getPixelsPerSquare(page);
      if (!pixelsPerSquare) return;

      return distance / pixelsPerSquare;
    },
  });

  const methodSelectorWithContext = ({
    startGraphicPageId,
    startLeft,
    startTop,
    endGraphicPageId,
    endLeft,
    endTop,
  }: ToContextType): MethodSelector | undefined => {
    const dx = Math.abs(endLeft - startLeft);
    const dy = Math.abs(endTop - startTop);
    let page: Page | undefined;

    const foureCalc = (): number => Math.max(dx, dy);

    const manhattanCalc = (): number => dx + dy;

    const pythagoreanCalc = (): number => Math.sqrt(dx ** 2 + dy ** 2);

    const threeFiveCalc = (pixelsPerSquare: number): number | undefined =>
      Math.max(dx, dy) + roundToGrid(Math.floor(Math.min(dx, dy) / 2), pixelsPerSquare);

    const getPageDistanceMethod = (diagonalType: string): (() => number | undefined) | undefined => {
      switch (diagonalType) {
        case 'foure':
          return foureCalc;
        case 'manhattan':
          return manhattanCalc;
        case 'pythagorean':
          return pythagoreanCalc;
        case 'threefive':
          return (pageId?: string) => {
            page = getPageByDetailsOrPlayerPage(pageId, startGraphicPageId, endGraphicPageId);
            if (!page) return;

            const pixelsPerSquare = getPixelsPerSquare(page);
            if (!pixelsPerSquare) return;

            return threeFiveCalc(pixelsPerSquare);
          };
        default:
          return;
      }
    };

    const byPageDistance = (pageId?: string): UnitSelector | undefined => {
      const page = getPageByDetailsOrPlayerPage(startGraphicPageId, endGraphicPageId, pageId);
      if (!page) {
        log(`${errorPrefix} failed to get page`);
        return;
      }

      const pageDiagonalType = page?.get('diagonaltype');
      if (!pageDiagonalType) {
        log(`${errorPrefix} could not get page diagonaltype`);
        return;
      }

      const distanceMethod = getPageDistanceMethod(pageDiagonalType);
      if (!distanceMethod) {
        log(`${errorPrefix} invalid page diagonaltype`);
        return;
      }

      const distance = distanceMethod();
      if (distance === undefined) {
        log(`${errorPrefix} error running distance method`);
        return;
      }

      return unitSelectorWithContext({ distance, page, startGraphicPageId, endGraphicPageId });
    };

    return {
      byFoure: () => unitSelectorWithContext({ distance: foureCalc(), startGraphicPageId, endGraphicPageId }),
      byManhattan: () => unitSelectorWithContext({ distance: manhattanCalc(), startGraphicPageId, endGraphicPageId }),
      byPythagorean: () =>
        unitSelectorWithContext({ distance: pythagoreanCalc(), startGraphicPageId, endGraphicPageId }),
      byThreeFive: (pageId?: string): UnitSelector | undefined => {
        const page = getPageByDetailsOrPlayerPage(pageId, startGraphicPageId, endGraphicPageId);
        if (!page) return;

        const pixelsPerSquare = getPixelsPerSquare(page);
        if (!pixelsPerSquare) return;

        const distance = threeFiveCalc(pixelsPerSquare);
        if (!distance) return;

        return unitSelectorWithContext({ distance, page, startGraphicPageId, endGraphicPageId });
      },
      byPageDistance,
    };
  };

  const toWithContext = ({ startGraphicPageId, startLeft, startTop }: FromContextType): To => ({
    to: (a: Graphic | number, b?: number): MethodSelector | undefined => {
      const coords = getOrValidateCoords(a, b);
      if (!coords) return;

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

  const pageSelectorWithContext = ({ value, fromUnits, toUnits }: ToUnitsSelectorContext): PageSelector => ({
    onPage(page: Page): number | undefined {
      // TODO is it worth generalising here?
      const pixelsFromStartValue = (value: number, fromUnits: ConversionUnits): number => {
        const pixelsPerSquare = page.get('snapping_increment') * 70;

        if (fromUnits === 'pixels') return value;
        if (fromUnits === 'squares') return value * pixelsPerSquare;
        const scale_number = page.get('scale_number');
        return (value * pixelsPerSquare) / scale_number;
      };
      const finalValueFromPixels = (value: number, toUnits: ConversionUnits): number => {
        const pixelsPerSquare = page.get('snapping_increment') * 70;

        if (toUnits === 'pixels') return value;
        if (toUnits === 'squares') return value / pixelsPerSquare;
        const scale_number = page.get('scale_number');
        return (value * scale_number) / pixelsPerSquare;
      };

      if (fromUnits === toUnits) return value;

      const pixels = pixelsFromStartValue(value, fromUnits);
      return finalValueFromPixels(pixels, toUnits);
    },
  });

  const toUnitsSelectorWithContext = (context: FromUnitsSelectorContext): ToUnitsSelector => ({
    toPageUnits: (): PageSelector => pageSelectorWithContext({ ...context, toUnits: 'pageUnits' }),
    toPixels: (): PageSelector => pageSelectorWithContext({ ...context, toUnits: 'pixels' }),
    toSquares: (): PageSelector => pageSelectorWithContext({ ...context, toUnits: 'squares' }),
  });

  const fromUnitsSelectorWithContext = (context: ConvertContextType): FromUnitsSelector => ({
    fromPageUnits: (): ToUnitsSelector => toUnitsSelectorWithContext({ ...context, fromUnits: 'pageUnits' }),
    fromPixels: (): ToUnitsSelector => toUnitsSelectorWithContext({ ...context, fromUnits: 'pixels' }),
    fromSquares: (): ToUnitsSelector => toUnitsSelectorWithContext({ ...context, fromUnits: 'squares' }),
  });

  return {
    convert: (value: number): FromUnitsSelector => fromUnitsSelectorWithContext({ value }),

    from: (a: Graphic | number, b?: number): To | undefined => {
      const coords = getOrValidateCoords(a, b);
      if (!coords) return;

      const [startLeft, startTop, startGraphicPageId] = coords;

      return toWithContext({ startGraphicPageId, startLeft, startTop });
    },
  };
})();
