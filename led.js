/* eslint-disable @typescript-eslint/ban-ts-comment */
const Led = (() => {
    const getGraphicCenterCoords = (graphic) => [
        graphic.get('left'),
        graphic.get('top'),
    ];
    const getOrValidateCoords = (a, b) => {
        if (typeof a === 'number' && typeof b === 'number') {
            return [a, b];
        }
        else if (typeof a === 'object' && typeof b === 'undefined') {
            return getGraphicCenterCoords(a);
        }
        else {
            log('ERROR: LED received invalid input');
            return;
        }
    };
    const unitSelectorWithContext = ({ distance, pixelsPerSquare, }) => {
        return {
            inPageUnits: () => {
                return Math.floor(distance / pixelsPerSquare);
            },
            inPixels: () => {
                return distance;
            },
        };
    };
    const methodSelectorWithContext = ({ startLeft, startTop, endLeft, endTop, }) => {
        // TODO replace with actual
        const page = {
            get: (property) => {
                return {
                    pixelsPerSquare: 1,
                }[property];
            },
        };
        const pixelsPerSquare = page.get('pixelsPerSquare');
        const dx = endLeft - startLeft;
        const dy = endTop - startTop;
        const roundToGrid = (value) => {
            return (value / pixelsPerSquare) * pixelsPerSquare;
        };
        return {
            byFoure: () => {
                // largest distance
                const distance = Math.max(dx, dy);
                return unitSelectorWithContext({ distance, pixelsPerSquare });
            },
            byManhattan: () => {
                // sum of distances
                const distance = dx + dy;
                return unitSelectorWithContext({ distance, pixelsPerSquare });
            },
            byPageDistance: () => {
                const distance = 1;
                return unitSelectorWithContext({ distance, pixelsPerSquare });
            },
            byPythagoras: () => {
                // exact distance, rounded to grid
                const distance = Math.sqrt(dx ** 2 + dy ** 2);
                return unitSelectorWithContext({ distance, pixelsPerSquare });
            },
            byThreeFive: () => {
                // larger distance + 1/2 smaller distance rounded down to grid
                const distance = Math.max(dx, dy) + roundToGrid(Math.floor(Math.min(dx, dy) / 2));
                return unitSelectorWithContext({ distance, pixelsPerSquare });
            },
        };
    };
    const toWithContext = ({ startLeft, startTop }) => {
        return {
            to: (a, b) => {
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
        from: (a, b) => {
            const coords = getOrValidateCoords(a, b);
            if (!coords) {
                return;
            }
            const [startLeft, startTop] = coords;
            return toWithContext({ startLeft, startTop });
        },
    };
})();
