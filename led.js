/* eslint-disable @typescript-eslint/ban-ts-comment */
const Led = (() => {
    const pixelsPerSquare = 70;
    const getGraphicCenterCoords = (graphic) => [
        graphic.get('left'),
        graphic.get('top'),
        graphic.get('_pageid'),
    ];
    const getOrValidateCoords = (a, b) => {
        if (typeof a === 'number' && typeof b === 'number') {
            return [a, b];
        }
        else if (typeof a === 'object' && typeof b === 'undefined') {
            return getGraphicCenterCoords(a);
        }
        else {
            log('LED-ERROR: LED received invalid input');
            return;
        }
    };
    const roundToGrid = (value) => (value / pixelsPerSquare) * pixelsPerSquare;
    const unitSelectorWithContext = ({ distance, }) => ({
        inPageUnits: () => Math.floor(distance / pixelsPerSquare),
        inPixels: () => distance,
    });
    const methodSelectorWithContext = ({ startGraphicPageId, startLeft, startTop, endGraphicPageId, endLeft, endTop, }) => {
        const dx = endLeft - startLeft;
        const dy = endTop - startTop;
        const getPage = () => {
            if (startGraphicPageId) {
                if (endGraphicPageId) {
                    if (startGraphicPageId !== endGraphicPageId) {
                        log('LEG-ERROR: supplied graphics are on different pages, could not get current page');
                        return;
                    }
                    return getObj('page', startGraphicPageId);
                }
                return getObj('page', startGraphicPageId);
            }
            else if (endGraphicPageId) {
                return getObj('page', endGraphicPageId);
            }
            const campaign = Campaign();
            const playerpageid = campaign.get('playerpageid');
            return getObj('page', playerpageid);
        };
        const foureCalc = () => Math.max(dx, dy);
        const manhattanCalc = () => dx + dy;
        const pythagorasCalc = () => Math.sqrt(dx ** 2 + dy ** 2);
        const threeFiveCalc = () => Math.max(dx, dy) + roundToGrid(Math.floor(Math.min(dx, dy) / 2));
        const getPageDistanceMethod = (diagonalType) => {
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
        const byPageDistance = (pageId) => {
            const page = pageId ? getObj('page', pageId) : getPage();
            if (!page) {
                log('LED-ERROR: failed to get page');
                return;
            }
            const pageDiagonalType = page === null || page === void 0 ? void 0 : page.get('diagonaltype');
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
            byPythagoras: () => unitSelectorWithContext({ distance: pythagorasCalc() }),
            byThreeFive: () => unitSelectorWithContext({ distance: threeFiveCalc() }),
            byPageDistance,
        };
    };
    const toWithContext = ({ startGraphicPageId, startLeft, startTop, }) => ({
        to: (a, b) => {
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
        from: (a, b) => {
            const coords = getOrValidateCoords(a, b);
            if (!coords) {
                return;
            }
            const [startLeft, startTop, startGraphicPageId] = coords;
            return toWithContext({ startGraphicPageId, startLeft, startTop });
        },
    };
})();
