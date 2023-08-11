/* eslint-disable @typescript-eslint/ban-ts-comment */

interface UnitSelector {
  inPixels: () => number;
}

interface MethodSelector {
  byFoure: () => UnitSelector;
  byManhattan: () => UnitSelector;
  byPageDistance: () => UnitSelector;
  byPythagoras: () => UnitSelector;
  byThreeFive: () => UnitSelector;
}

interface TMethodSelectorContext {
  distance: number;
}

interface To {
  to: (a: Graphic | number, b?: number) => MethodSelector | undefined;
}

interface TToContext extends TFromContext {
  endLeft: number;
  endTop: number;
}

interface ILed {
  from: (a: Graphic | number, b?: number) => To | undefined;
}

interface TFromContext {
  startLeft: number;
  startTop: number;
}

export const Led: ILed = (() => {
  // TODO replace with actual
  const page = {
    get: (property: string): string | number | undefined => {
      return {
        pixelsPerSquare: 1,
      }[property];
    },
  };

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
  }: TMethodSelectorContext): UnitSelector => {
    return {
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
  }: TToContext): MethodSelector => {
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
        return unitSelectorWithContext({ distance });
      },
      byManhattan: (): UnitSelector => {
        // sum of distances
        const distance = dx + dy;
        return unitSelectorWithContext({ distance });
      },
      byPageDistance: (): UnitSelector => {
        const distance = 1;
        return unitSelectorWithContext({ distance });
      },
      byPythagoras: (): UnitSelector => {
        // exact distance, rounded to grid
        const distance = roundToGrid(Math.round(Math.sqrt(dx ** 2 + dy ** 2)));
        return unitSelectorWithContext({ distance });
      },
      byThreeFive: (): UnitSelector => {
        // larger distance + 1/2 smaller distance rounded down to grid
        const distance =
          Math.max(dx, dy) + roundToGrid(Math.floor(Math.min(dx, dy) / 2));
        return unitSelectorWithContext({ distance });
      },
    };
  };

  const toWithContext = ({ startLeft, startTop }: TFromContext): To => {
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
