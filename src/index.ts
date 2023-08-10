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

export class Led {
  static from(a: Graphic | number, b?: number): To | undefined {
    const getLeftFromCenter = (graphic: Graphic): number => {
      return graphic.get('left') + graphic.get('width') / 2;
    };
    const getTopFromCenter = (graphic: Graphic): number => {
      return graphic.get('top') + graphic.get('height') / 2;
    };

    let startLeft: number, startTop: number;
    if (typeof a === 'number' && typeof b === 'number') {
      startLeft = a;
      startTop = b;
    } else if (typeof a === 'object' && typeof b === 'undefined') {
      startLeft = getLeftFromCenter(a);
      startTop = getTopFromCenter(a);
    } else {
      log('ERROR: Led received an incorrect input');
      return;
    }

    return {
      to: (a: Graphic | number, b?: number): MethodSelector | undefined => {
        let endLeft: number, endTop: number;
        if (typeof a === 'number' && typeof b === 'number') {
          endLeft = a;
          endTop = b;
        } else if (typeof a === 'object' && typeof b === 'undefined') {
          endLeft = getLeftFromCenter(a);
          endTop = getTopFromCenter(a);
        } else {
          log('ERROR: Led received an incorrect input');
          return;
        }

        let distanceMethod: (pixelCalculatedDistance: number) => number;
        const unitSelector = {
          inPixels: () => {
            return distanceMethod(
              Math.sqrt((endTop - startTop) ** 2 + (endLeft - startLeft) ** 2)
            );
          },
        };

        return {
          byPageDistance: (): UnitSelector => {
            distanceMethod = (pixelCalculatedDistance: number) =>
              pixelCalculatedDistance * 2;
            return unitSelector;
          },
          byPythagoras: (): UnitSelector => {
            distanceMethod = (pixelCalculatedDistance: number) =>
              pixelCalculatedDistance;
            return unitSelector;
          },
        };
      },
    };
  }
}
