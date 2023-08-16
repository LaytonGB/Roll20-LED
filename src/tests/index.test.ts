/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */

import _ from 'lodash';

import { MockObjectName } from './mocks/values';
import mockValues from './mocks/values';
import mockFunctions from './mocks/functions';

import { Led } from '..';

// @ts-ignore not assignable error because of roll20 types
global.Campaign = () => {
  return;
};
const CampaignMock = jest.fn<Roll20Object | undefined, []>(
  mockFunctions.Campaign
);
/* const createObjSpy =  */ jest
  .spyOn(global, 'Campaign')
  // @ts-ignore CreateObj overload causing bad-selection error
  .mockImplementation(CampaignMock);

// @ts-ignore not assignable error because of roll20 types
global.createObj = () => {
  return;
};
const createObjMock = jest.fn<
  Roll20Object | undefined,
  [ObjectType, { [property: string]: any }]
>(mockFunctions.createObj);
/* const createObjSpy =  */ jest
  .spyOn(global, 'createObj')
  // @ts-ignore CreateObj overload causing bad-selection error
  .mockImplementation(createObjMock);

// @ts-ignore
global.getObj = () => {
  return;
};
const getObjMock = jest.fn<Roll20Object | undefined, [ObjectType, string]>(
  mockFunctions.getObj
);
/* const getObjSpy =  */ jest
  .spyOn(global, 'getObj')
  .mockImplementation(getObjMock);

// @ts-ignore
global.findObjs = () => {
  return;
};
const findObjsMock = jest.fn<Roll20Object[], [{ [property: string]: any }]>(
  mockFunctions.findObjs
);
/* const findObjsSpy =  */ jest
  .spyOn(global, 'findObjs')
  .mockImplementation(findObjsMock);

// @ts-ignore
global.filterObjs = () => {
  return;
};
const filterObjsMock = jest.fn<
  Roll20Object[],
  [(obj: Roll20Object) => boolean]
>(mockFunctions.filterObjs);
/* const filterObjsSpy =  */ jest
  .spyOn(global, 'filterObjs')
  .mockImplementation(filterObjsMock);

const { triggerEvent, on } = mockFunctions.getOnFunctions();
// @ts-ignore
global.on = () => {
  return;
};
const onMock = jest.fn<void, [string, (obj: Roll20Object) => void]>(on);
// @ts-ignore On overload causing bad-selection error
/* const onSpy = */ jest.spyOn(global, 'on').mockImplementation(onMock);

global.log = () => {
  return;
};
const logMock = jest.fn<void, [string]>(mockFunctions.log);
const logSpy = jest.spyOn(global, 'log').mockImplementation(logMock);

let pages: Page[];
beforeEach(() => {
  pages = [
    mockValues.mockRequestResults.get(MockObjectName.MOCK_PAGE_CURRENT),
    mockValues.mockRequestResults.get(MockObjectName.MOCK_PAGE_INACTIVE),
    mockValues.mockRequestResults.get(MockObjectName.MOCK_PAGE_VISITED),
  ] as Page[];
});

it('calculates arbitrary distance correctly', () => {
  const calculatedDistance = Led.from(10, 15)
    ?.to(20, 25)
    ?.byPythagoras()
    .inPixels();

  // 10 ** 2 === 100
  // 100 + 100 === 200
  expect(calculatedDistance).toBe(Math.sqrt(200));
});

describe('correctly gets information from page', () => {
  const startPos: [number, number] = [0, 0];
  const endPos: [number, number] = [10 * 70, 10 * 70]; // 70 pixels per grid square

  const campaign = Campaign() as Campaign;
  const playerpageid = campaign.get('playerpageid');
  const playerPage = getObj('page', MockObjectName.MOCK_PAGE_CURRENT);
  if (!playerPage) {
    throw new Error('player page not found');
  }

  it('uses player page + prefers player page', () => {
    const calculatedDistance = Led.from(...startPos)
      ?.to(...endPos)
      ?.byPageDistance()
      ?.inPageUnits();
    expect(calculatedDistance).toBe(20);
  });

  it('uses supplied graphic page if possible', () => {
    const visitedPageGraphic = getObj(
      'graphic',
      MockObjectName.MOCK_GRAPHIC_ON_VISITED_PAGE
    );
    if (!visitedPageGraphic) {
      throw new Error('could not get graphic on visited page');
    }

    const calculatedDistance = Led.from(visitedPageGraphic)
      ?.to(...endPos)
      ?.byPageDistance()
      ?.inPageUnits();

    expect(calculatedDistance).toBe(20);
  });

  it('logs an error if graphic pages are different', () => {
    const currentPageGraphic = getObj(
      'graphic',
      MockObjectName.MOCK_GRAPHIC_ON_PLAYER_PAGE
    );
    const visitedPageGraphic = getObj(
      'graphic',
      MockObjectName.MOCK_GRAPHIC_ON_VISITED_PAGE
    );
    if (!currentPageGraphic || !visitedPageGraphic) {
      throw new Error('could not get graphic on current or visited page');
    }

    const logCallCount = logSpy.mock.calls.length;
    const calculatedDistance = Led.from(visitedPageGraphic)
      ?.to(currentPageGraphic)
      ?.byPageDistance()
      ?.inPageUnits();

    expect(calculatedDistance).toBeUndefined();
    expect(logSpy).toHaveBeenCalledTimes(logCallCount + 1);
  });

  it.todo('logs an error if no page is present');
});
