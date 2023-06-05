import { EventBus, EventEmitter } from '../EventEmitter';

jest.mock('../EventEmitter');

export const eventEmitterMock = jest.mocked<EventEmitter<any>>(new EventBus());
