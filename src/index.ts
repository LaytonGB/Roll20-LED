/* eslint-disable @typescript-eslint/ban-ts-comment */

export interface UnitSelector {
  inPageUnits: () => number;
  inPixels: () => number;
}

export interface MethodSelector {
  byFoure: () => UnitSelector;
  byManhattan: () => UnitSelector;
  byPythagoras: () => UnitSelector;
  byThreeFive: () => UnitSelector;
  byPageDistance: () => UnitSelector | undefined;
}

export interface MethodSelectorContextType {
  distance: number;
  pixelsPerSquare: number;
}

export interface To {
  to: (a: Graphic | number, b?: number) => MethodSelector | undefined;
}

export interface ToContextType extends FromContextType {
  endLeft: number;
  endTop: number;
}

export interface ILed {
  from: (a: Graphic | number, b?: number) => To | undefined;
}

export interface FromContextType {
  startLeft: number;
  startTop: number;
}

export const Led: ILed = (() => {
  const getGraphicCenterCoords = (graphic: Graphic): [number, number] => [
    graphic.get('left'),
    graphic.get('top'),
  ];

  const getOrValidateCoords = (
    a: Graphic | number,
    b?: number
  ): [number, number] | undefined => {
    if (typeof a === 'number' && typeof b === 'number') {
      return [a, b];
    } else if (typeof a === 'object' && typeof b === 'undefined') {
      return getGraphicCenterCoords(a);
    } else {
      log('ERROR: LED received invalid input');
      return;
    }
  };

  const unitSelectorWithContext = ({
    distance,
    pixelsPerSquare,
  }: MethodSelectorContextType): UnitSelector => {
    return {
      inPageUnits: (): number => {
        return Math.floor(distance / pixelsPerSquare);
      },
      inPixels: (): number => {
        return distance;
      },
    };
  };

  // TODO clean this section, lots of retyped code
  const methodSelectorWithContext = ({
    startLeft,
    startTop,
    endLeft,
    endTop,
  }: ToContextType): MethodSelector | undefined => {
    const campaign = Campaign();
    const playerpageid = campaign.get('playerpageid');
    const currentPage = getObj('page', playerpageid);
    if (!currentPage) {
      log('ERROR: could not find current page');
      return;
    }

    // TODO check this works
    const pixelsPerSquare = currentPage.get('snapping_increment') * 70;
    const dx = endLeft - startLeft;
    const dy = endTop - startTop;

    const roundToGrid = (value: number) => {
      return (value / pixelsPerSquare) * pixelsPerSquare;
    };

    const foureCalc = (): number => {
      return Math.max(dx, dy);
    };
    const byFoure = (): UnitSelector => {
      // largest distance
      const distance = foureCalc();
      return unitSelectorWithContext({ distance, pixelsPerSquare });
    };

    const manhattanCalc = (): number => {
      return dx + dy;
    };
    const byManhattan = (): UnitSelector => {
      // sum of distances
      const distance = manhattanCalc();
      return unitSelectorWithContext({ distance, pixelsPerSquare });
    };

    const pythagorasCalc = (): number => {
      return Math.sqrt(dx ** 2 + dy ** 2);
    };
    const byPythagoras = (): UnitSelector => {
      // exact distance, rounded to grid
      const distance = pythagorasCalc();
      return unitSelectorWithContext({ distance, pixelsPerSquare });
    };

    const threeFiveCalc = (): number => {
      return Math.max(dx, dy) + roundToGrid(Math.floor(Math.min(dx, dy) / 2));
    };
    const byThreeFive = (): UnitSelector => {
      // larger distance + 1/2 smaller distance rounded down to grid
      const distance = threeFiveCalc();
      return unitSelectorWithContext({ distance, pixelsPerSquare });
    };

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
    const byPageDistance = (): UnitSelector | undefined => {
      const pageDiagonalType = currentPage?.get('diagonaltype');
      if (!pageDiagonalType) {
        log('ERROR: could not get page diagonal type');
        return;
      }

      const distanceMethod = getPageDistanceMethod(pageDiagonalType);
      if (!distanceMethod) {
        log('ERROR: invalid page diagonaltype');
        return;
      }

      const distance = distanceMethod();
      return unitSelectorWithContext({ distance, pixelsPerSquare });
    };

    return {
      byFoure,
      byManhattan,
      byPythagoras,
      byThreeFive,
      byPageDistance,
    };
  };

  const toWithContext = ({ startLeft, startTop }: FromContextType): To => {
    return {
      to: (a: Graphic | number, b?: number): MethodSelector | undefined => {
        const coords = getOrValidateCoords(a, b);
        if (!coords) {
          return;
        }
        const [endLeft, endTop] = coords;

        return methodSelectorWithContext({
          startLeft,
          startTop,
          endLeft,
          endTop,
        });
      },
    };
  };

  return {
    from: (a: Graphic | number, b?: number): To | undefined => {
      const coords = getOrValidateCoords(a, b);
      if (!coords) {
        return;
      }
      const [startLeft, startTop] = coords;

      return toWithContext({ startLeft, startTop });
    },
  };
})();
