/* eslint-disable @typescript-eslint/ban-ts-comment */

import { MockObjectName } from './mocks/values';
import mockFunctions from './mocks/functions';

import { Led } from '..';

// @ts-ignore not assignable error because of roll20 types
global.Campaign = (): void => undefined;
const CampaignMock = jest.fn<Roll20Object | undefined, []>(mockFunctions.Campaign);
/* const createObjSpy =  */ jest
  .spyOn(global, 'Campaign')
  // @ts-ignore CreateObj overload causing bad-selection error
  .mockImplementation(CampaignMock);

// @ts-ignore not assignable error because of roll20 types
global.createObj = (): void => undefined;
const createObjMock = jest.fn<Roll20Object | undefined, [ObjectType, { [property: string]: any }]>(
  mockFunctions.createObj
);
/* const createObjSpy =  */ jest
  .spyOn(global, 'createObj')
  // @ts-ignore CreateObj overload causing bad-selection error
  .mockImplementation(createObjMock);

// @ts-ignore
global.getObj = (): void => undefined;
const getObjMock = jest.fn<Roll20Object | undefined, [ObjectType, string]>(mockFunctions.getObj);
/* const getObjSpy =  */ jest.spyOn(global, 'getObj').mockImplementation(getObjMock);

// @ts-ignore
global.findObjs = (): void => undefined;
const findObjsMock = jest.fn<Roll20Object[], [{ [property: string]: any }]>(mockFunctions.findObjs);
/* const findObjsSpy =  */ jest.spyOn(global, 'findObjs').mockImplementation(findObjsMock);

// @ts-ignore
global.filterObjs = (): void => undefined;
const filterObjsMock = jest.fn<Roll20Object[], [(obj: Roll20Object) => boolean]>(mockFunctions.filterObjs);
/* const filterObjsSpy =  */ jest.spyOn(global, 'filterObjs').mockImplementation(filterObjsMock);

const { on } = mockFunctions.getOnFunctions();
// @ts-ignore
global.on = (): void => undefined;
const onMock = jest.fn<void, [string, (obj: Roll20Object) => void]>(on);
// @ts-ignore On overload causing bad-selection error
/* const onSpy = */ jest.spyOn(global, 'on').mockImplementation(onMock);

global.log = (): void => undefined;
const logMock = jest.fn<void, [string]>(mockFunctions.log);
const logSpy = jest.spyOn(global, 'log').mockImplementation(logMock);

it('calculates arbitrary distance correctly', () => {
  const calculatedDistance = Led.from(10, 15)?.to(20, 25)?.byPythagoras().inPixels();

  // 10 ** 2 === 100
  // 100 + 100 === 200
  expect(calculatedDistance).toBe(Math.sqrt(200));
});

describe('distance methods', () => {
  it.todo('foure');
  it.todo('manhattan');
  it.todo('pythagoras');
  it.todo('threeFive');
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

    const calculatedDistance = Led.from(visitedPageGraphic) // starts at 0,0
      ?.to(...endPos) // ends 700,700 // 10,10 in squares // 20,20 including snapping increment
      ?.byPageDistance() // pythagoras // sqrt(20 ** 2 + 20 ** 2) = 28.284
      ?.inPageUnits(); // 5 units per square // rounded down to nearest value

    // using pythagoras for expected page
    expect(calculatedDistance).toBe(Math.floor(Math.sqrt(10 ** 2 + 10 ** 2)) * 5);
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
