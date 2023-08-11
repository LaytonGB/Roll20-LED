/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */

import _ from 'lodash';

import { MockObjectName } from './mocks/values';
import mockValues from './mocks/values';
import mockFunctions from './mocks/functions';

import { Led, MethodSelector } from '..';
import { MockRoll20Object } from './utils/roll20';

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
/* const logSpy = */ jest.spyOn(global, 'log').mockImplementation(logMock);

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
  const midwayCalc = Led.from(0, 0)?.to(10, 10);

  [
    {
      name: 'method selector',
      func: (midwayCalc as MethodSelector).byPageDistance,
    },
    {
      name: 'unit selector',
      func: (midwayCalc as MethodSelector).byFoure().inPageUnits,
    },
  ].forEach(({ name, func }) => {
    describe(name, () => {
      it.todo('uses a page if present');
      it.todo('prefers current page');
      it.todo('logs an error if no page is present');
    });
  });
});

describe('calculates as expected', () => {
  [{ name: '', value: '', expected: '' }].forEach(
    ({ name, value, expected }) => {
      describe(name, () => {
        it.todo('is the expected value');
      });
    }
  );
});
