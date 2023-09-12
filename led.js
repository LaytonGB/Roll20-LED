/* eslint-disable @typescript-eslint/ban-ts-comment */
const Led = (() => {
    const errorPrefix = 'LED-ERROR:';
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
            log(`${errorPrefix} LED received invalid input`);
            return;
        }
    };
    const getPageByDetailsOrPlayerPage = (startGraphicPageId, endGraphicPageId, pageId) => {
        if (pageId)
            return getObj('page', pageId);
        if (startGraphicPageId) {
            if (endGraphicPageId && startGraphicPageId !== endGraphicPageId) {
                log(`${errorPrefix} supplied graphics are on different pages, could not get current page`);
                return;
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
    const getPixelsPerSquare = (page) => 70 / page.get('snapping_increment');
    const getScaleNumber = (page) => page.get('scale_number');
    const roundToGrid = (value, pixelsPerSquare) => Math.floor(value / pixelsPerSquare) * pixelsPerSquare;
    const unitSelectorWithContext = ({ distance, page, startGraphicPageId, endGraphicPageId, }) => ({
        inPageUnits: (pageId) => {
            if (!page)
                page = getPageByDetailsOrPlayerPage(startGraphicPageId, endGraphicPageId, pageId);
            if (!page)
                return;
            const pixelsPerSquare = getPixelsPerSquare(page);
            const scaleNumber = getScaleNumber(page);
            if (!pixelsPerSquare || !scaleNumber)
                return;
            return Math.floor((distance / pixelsPerSquare) * scaleNumber);
        },
        inPixels: () => distance,
        inSquares: (pageId) => {
            if (!page)
                page = getPageByDetailsOrPlayerPage(startGraphicPageId, endGraphicPageId, pageId);
            if (!page)
                return;
            const pixelsPerSquare = getPixelsPerSquare(page);
            if (!pixelsPerSquare)
                return;
            return distance / pixelsPerSquare;
        },
    });
    const methodSelectorWithContext = ({ startGraphicPageId, startLeft, startTop, endGraphicPageId, endLeft, endTop, }) => {
        const dx = Math.abs(endLeft - startLeft);
        const dy = Math.abs(endTop - startTop);
        let page;
        const foureCalc = () => Math.max(dx, dy);
        const manhattanCalc = () => dx + dy;
        const pythagoreanCalc = () => Math.sqrt(dx ** 2 + dy ** 2);
        const threeFiveCalc = (pixelsPerSquare) => Math.max(dx, dy) + roundToGrid(Math.floor(Math.min(dx, dy) / 2), pixelsPerSquare);
        const getPageDistanceMethod = (diagonalType) => {
            switch (diagonalType) {
                case 'foure':
                    return foureCalc;
                case 'manhattan':
                    return manhattanCalc;
                case 'pythagorean':
                    return pythagoreanCalc;
                case 'threefive':
                    return (pageId) => {
                        page = getPageByDetailsOrPlayerPage(pageId, startGraphicPageId, endGraphicPageId);
                        if (!page)
                            return;
                        const pixelsPerSquare = getPixelsPerSquare(page);
                        if (!pixelsPerSquare)
                            return;
                        return threeFiveCalc(pixelsPerSquare);
                    };
                default:
                    return;
            }
        };
        const byPageDistance = (pageId) => {
            const page = getPageByDetailsOrPlayerPage(startGraphicPageId, endGraphicPageId, pageId);
            if (!page) {
                log(`${errorPrefix} failed to get page`);
                return;
            }
            const pageDiagonalType = page === null || page === void 0 ? void 0 : page.get('diagonaltype');
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
            byPythagorean: () => unitSelectorWithContext({ distance: pythagoreanCalc(), startGraphicPageId, endGraphicPageId }),
            byThreeFive: (pageId) => {
                const page = getPageByDetailsOrPlayerPage(pageId, startGraphicPageId, endGraphicPageId);
                if (!page)
                    return;
                const pixelsPerSquare = getPixelsPerSquare(page);
                if (!pixelsPerSquare)
                    return;
                const distance = threeFiveCalc(pixelsPerSquare);
                if (!distance)
                    return;
                return unitSelectorWithContext({ distance, page, startGraphicPageId, endGraphicPageId });
            },
            byPageDistance,
        };
    };
    const toWithContext = ({ startGraphicPageId, startLeft, startTop }) => ({
        to: (a, b) => {
            const coords = getOrValidateCoords(a, b);
            if (!coords)
                return;
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
    const pageSelectorWithContext = ({ value, fromUnits, toUnits }) => ({
        onPage(page) {
            // TODO is it worth generalising here?
            const pixelsFromStartValue = (value, fromUnits) => {
                const pixelsPerSquare = page.get('snapping_increment') * 70;
                if (fromUnits === 'pixels')
                    return value;
                if (fromUnits === 'squares')
                    return value * pixelsPerSquare;
                const scale_number = page.get('scale_number');
                return (value * pixelsPerSquare) / scale_number;
            };
            const finalValueFromPixels = (value, toUnits) => {
                const pixelsPerSquare = page.get('snapping_increment') * 70;
                if (toUnits === 'pixels')
                    return value;
                if (toUnits === 'squares')
                    return value / pixelsPerSquare;
                const scale_number = page.get('scale_number');
                return (value * scale_number) / pixelsPerSquare;
            };
            if (fromUnits === toUnits)
                return value;
            const pixels = pixelsFromStartValue(value, fromUnits);
            return finalValueFromPixels(pixels, toUnits);
        },
    });
    const toUnitsSelectorWithContext = (context) => ({
        toPageUnits: () => pageSelectorWithContext({ ...context, toUnits: 'pageUnits' }),
        toPixels: () => pageSelectorWithContext({ ...context, toUnits: 'pixels' }),
        toSquares: () => pageSelectorWithContext({ ...context, toUnits: 'squares' }),
    });
    const fromUnitsSelectorWithContext = (context) => ({
        fromPageUnits: () => toUnitsSelectorWithContext({ ...context, fromUnits: 'pageUnits' }),
        fromPixels: () => toUnitsSelectorWithContext({ ...context, fromUnits: 'pixels' }),
        fromSquares: () => toUnitsSelectorWithContext({ ...context, fromUnits: 'squares' }),
    });
    return {
        convert: (value) => fromUnitsSelectorWithContext({ value }),
        from: (a, b) => {
            const coords = getOrValidateCoords(a, b);
            if (!coords)
                return;
            const [startLeft, startTop, startGraphicPageId] = coords;
            return toWithContext({ startGraphicPageId, startLeft, startTop });
        },
    };
})();
