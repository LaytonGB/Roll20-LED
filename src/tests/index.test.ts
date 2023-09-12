/* eslint-disable @typescript-eslint/ban-ts-comment */

import { MockObjectName } from './mocks/values';
import mockFunctions from './mocks/functions';

import { Led } from '..';

// @ts-ignore not assignable error because of roll20 types
global.Campaign = (): void => undefined;
/* const createObjSpy =  */ jest
  .spyOn(global, 'Campaign')
  // @ts-ignore CreateObj overload causing bad-selection error
  .mockImplementation(mockFunctions.Campaign);

// @ts-ignore not assignable error because of roll20 types
global.createObj = (): void => undefined;
/* const createObjSpy =  */ jest
  .spyOn(global, 'createObj')
  // @ts-ignore CreateObj overload causing bad-selection error
  .mockImplementation(mockFunctions.createObj);

// @ts-ignore
global.getObj = (): void => undefined;
/* const getObjSpy =  */ jest.spyOn(global, 'getObj').mockImplementation(mockFunctions.getObj);

// @ts-ignore
global.findObjs = (): void => undefined;
/* const findObjsSpy =  */ jest.spyOn(global, 'findObjs').mockImplementation(mockFunctions.findObjs);

// @ts-ignore
global.filterObjs = (): void => undefined;
/* const filterObjsSpy =  */ jest.spyOn(global, 'filterObjs').mockImplementation(mockFunctions.filterObjs);

const { on } = mockFunctions.getOnFunctions();
// @ts-ignore
global.on = (): void => undefined;
// @ts-ignore On overload causing bad-selection error
/* const onSpy = */ jest.spyOn(global, 'on').mockImplementation(on);

global.log = (): void => undefined;
const logMock = jest.fn<void, [string]>(mockFunctions.log);
const logSpy = jest.spyOn(global, 'log').mockImplementation(logMock);

it('calculates arbitrary distance correctly', () => {
  const calculatedDistance = Led.from(10, 15)?.to(20, 25)?.byPythagorean().inPixels();

  // 10 ** 2 === 100
  // 100 + 100 === 200
  expect(calculatedDistance).toBe(Math.sqrt(200));
});

describe('distance methods', () => {
  const startGraphic = getObj('graphic', 'MOCK_GRAPHIC_ON_CURRENT_PAGE_IN_POSITION_1') as Graphic;
  const endGraphic = getObj('graphic', 'MOCK_GRAPHIC_ON_CURRENT_PAGE_IN_POSITION_2') as Graphic;

  it.todo('foure');
  it.todo('manhattan');
  it.todo('pythagoras');
  it('threeFive', () => {
    const distance = Led.from(startGraphic)?.to(endGraphic)?.byThreeFive()?.inSquares();
    expect(distance).toBe(2);
  });
});

describe('correctly gets information from page', () => {
  const startPos: [number, number] = [0, 0];
  const endPos: [number, number] = [10 * 70, 10 * 70]; // 70 pixels per grid square at default snapping

  const playerPage = getObj('page', MockObjectName.MOCK_PAGE_CURRENT);
  if (!playerPage) throw new Error('player page not found');

  it('uses player page + prefers player page', () => {
    const calculatedDistance = Led.from(...startPos)
      ?.to(...endPos)
      ?.byPageDistance() // manhattan // 10 + 10 = 20
      ?.inPageUnits(); // 1 unit per square // 20
    expect(calculatedDistance).toBe(20);
  });

  it('uses supplied graphic page if possible', () => {
    const visitedPageGraphic = getObj('graphic', MockObjectName.MOCK_GRAPHIC_ON_VISITED_PAGE);
    if (!visitedPageGraphic) throw new Error('could not get graphic on visited page');

    const ledFrom = Led.from(visitedPageGraphic); // starts at 0,0
    const ledTo = ledFrom?.to(...endPos); // ends at 700,700 // 10,10 in squares // 20,20 including snapping increment
    const ledMethod = ledTo?.byPageDistance(); // pythagoras // sqrt(20 ** 2 + 20 ** 2) = 28.284
    const ledResult = ledMethod?.inPageUnits(); // 5 units per square // rounded down to nearest value

    // using pythagoras for expected page
    expect(ledResult).toBe(Math.floor(Math.sqrt(10 ** 2 + 10 ** 2)) * 5);
  });

  it('logs an error if graphic pages are different', () => {
    const currentPageGraphic = getObj('graphic', MockObjectName.MOCK_GRAPHIC_ON_PLAYER_PAGE);
    const visitedPageGraphic = getObj('graphic', MockObjectName.MOCK_GRAPHIC_ON_VISITED_PAGE);
    if (!currentPageGraphic || !visitedPageGraphic) throw new Error('could not get graphic on current or visited page');

    const logCallCount = logSpy.mock.calls.length;
    const calculatedDistance = Led.from(visitedPageGraphic)?.to(currentPageGraphic)?.byPageDistance()?.inPageUnits();

    expect(calculatedDistance).toBeUndefined();
    expect(logSpy).not.toHaveBeenCalledTimes(logCallCount); // gets called more than once
  });

  it.todo('adjusts correctly for snapping increment');

  it.todo('adjusts correctly for unit number');
});

describe('conversion methods', () => {
  it.todo('converts from pixels to squares');
  it.todo('converts from pixels to page units');
  it.todo('converts from squares to pixels');
  it.todo('converts from squares to page units');
  it.todo('converts from page units to pixels');
  it.todo('converts from page units to squares');
});
