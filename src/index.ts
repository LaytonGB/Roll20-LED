/* eslint-disable @typescript-eslint/ban-ts-comment */

export interface UnitSelector {
  inPageUnits: () => number;
  inPixels: () => number;
}

export interface MethodSelector {
  byFoure: () => UnitSelector;
  byManhattan: () => UnitSelector;
  byPageDistance: () => UnitSelector;
  byPythagoras: () => UnitSelector;
  byThreeFive: () => UnitSelector;
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

  const methodSelectorWithContext = ({
    startLeft,
    startTop,
    endLeft,
    endTop,
  }: ToContextType): MethodSelector => {
    // TODO replace with actual
    const page = {
      get: (property: string): string | number | undefined => {
        return {
          pixelsPerSquare: 1,
        }[property];
      },
    };

    const pixelsPerSquare = page.get('pixelsPerSquare') as number;
    const dx = endLeft - startLeft;
    const dy = endTop - startTop;

    const roundToGrid = (value: number) => {
      return (value / pixelsPerSquare) * pixelsPerSquare;
    };

    return {
      byFoure: (): UnitSelector => {
        // largest distance
        const distance = Math.max(dx, dy);
        return unitSelectorWithContext({ distance, pixelsPerSquare });
      },
      byManhattan: (): UnitSelector => {
        // sum of distances
        const distance = dx + dy;
        return unitSelectorWithContext({ distance, pixelsPerSquare });
      },
      byPageDistance: (): UnitSelector => {
        const distance = 1;
        return unitSelectorWithContext({ distance, pixelsPerSquare });
      },
      byPythagoras: (): UnitSelector => {
        // exact distance, rounded to grid
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        return unitSelectorWithContext({ distance, pixelsPerSquare });
      },
      byThreeFive: (): UnitSelector => {
        // larger distance + 1/2 smaller distance rounded down to grid
        const distance =
          Math.max(dx, dy) + roundToGrid(Math.floor(Math.min(dx, dy) / 2));
        return unitSelectorWithContext({ distance, pixelsPerSquare });
      },
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
