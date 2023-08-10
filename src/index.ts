/* eslint-disable @typescript-eslint/ban-ts-comment */

export type EventType = 'add' | 'change' | 'destroy';
export type Roll20Id = string;
export type Roll20EventLabel = string;
export type SearchKey = string;

export interface ILedFactory {
  new: () => ILed;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ILed {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Locs: ILedFactory = (() => {
  class Led implements ILed {}

  return {
    new: () => new Led(),
  };
})();
