/* eslint-disable @typescript-eslint/ban-ts-comment */

interface UnitSelector {
  inPixels: () => number;
}

interface MethodSelector {
  byPageDistance: () => UnitSelector;
  byPythagoras: () => UnitSelector;
}

interface To {
  to: (a: Graphic | number, b?: number) => MethodSelector | undefined;
}

interface ToCtx extends FromCtx {
  endLeft: number;
  endTop: number;
}

interface ILed {
  from: (a: Graphic | number, b?: number) => To | undefined;
}

interface FromCtx {
  startLeft: number;
  startTop: number;
}

const Led: ILed = (() => {
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

  const unitSelectorWithContext = ({}: MethodSelectorCtx): UnitSelector => {
    return {
      inPixels: (output: number): number => {
        return output;
      },
    };
  };

  const methodSelectorWithContext = (context: ToCtx): MethodSelector => {
    let calculateDistance: (
      x1: number,
      y1: number,
      x2: number,
      y2: number
    ) => number;

    return {
      byPageDistance: (): UnitSelector => {
        return unitSelectorWithContext({ ...context, calculateDistance });
      },
      byPythagoras: (): UnitSelector => {
        return unitSelectorWithContext({ ...context, calculateDistance });
      },
    };
  };

  const toWithContext = ({ startLeft, startTop }: FromCtx): To => {
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
