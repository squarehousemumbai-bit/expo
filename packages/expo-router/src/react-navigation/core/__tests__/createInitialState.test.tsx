import { expect, jest, test } from '@jest/globals';

import { createInitialState } from '../createInitialState';

jest.mock('nanoid/non-secure', () => ({ nanoid: jest.fn(() => 'test') }));

const routeNames = ['first', 'second'];

test('creates sparse state focused on the first route by default', () => {
  expect(createInitialState({ routeNames, routeParamList: {} })).toEqual({
    stale: false,
    key: 'navigator-test',
    index: 0,
    routeNames,
    routes: [{ key: 'first-test', name: 'first' }],
  });
});

test('focuses a valid configured initial route', () => {
  expect(
    createInitialState({
      routeNames,
      routeParamList: { second: { source: 'initial' } },
      initialRouteName: 'second',
    })
  ).toEqual({
    stale: false,
    key: 'navigator-test',
    index: 0,
    routeNames,
    routes: [{ key: 'second-test', name: 'second', params: { source: 'initial' } }],
  });
});

test('focuses a nested route with its params and path', () => {
  expect(
    createInitialState({
      routeNames,
      routeParamList: { first: { ignored: true } },
      initialRouteName: 'first',
      routeParams: {
        screen: 'second',
        params: { answer: 42 },
        path: '/second',
      },
    })
  ).toEqual({
    stale: false,
    key: 'navigator-test',
    index: 0,
    routeNames,
    routes: [
      {
        key: 'second-test',
        name: 'second',
        params: { answer: 42 },
        path: '/second',
      },
    ],
  });
});

test('prepends the initial route for nested navigation with initial false', () => {
  expect(
    createInitialState({
      routeNames,
      routeParamList: { first: { source: 'initial' } },
      initialRouteName: 'first',
      routeParams: {
        screen: 'second',
        initial: false,
        params: { answer: 42 },
        path: '/second',
      },
    })
  ).toEqual({
    stale: false,
    key: 'navigator-test',
    index: 1,
    routeNames,
    routes: [
      { key: 'first-test', name: 'first', params: { source: 'initial' } },
      {
        key: 'second-test',
        name: 'second',
        params: { answer: 42 },
        path: '/second',
      },
    ],
  });
});

test('does not duplicate matching initial and focused routes', () => {
  expect(
    createInitialState({
      routeNames,
      routeParamList: {},
      initialRouteName: 'second',
      routeParams: { screen: 'second', initial: false },
    }).routes
  ).toEqual([{ key: 'second-test', name: 'second' }]);
});

test('falls back to the first route for an invalid configured route', () => {
  expect(
    createInitialState({
      routeNames,
      routeParamList: {},
      initialRouteName: 'missing',
    }).routes
  ).toEqual([{ key: 'first-test', name: 'first' }]);
});

test.each([undefined, false])(
  'does not copy params from an invalid nested route with initial %s',
  (initial) => {
    expect(
      createInitialState({
        routeNames,
        routeParamList: {},
        initialRouteName: 'first',
        routeParams: {
          screen: 'missing',
          initial,
          params: { answer: 42 },
          path: '/missing',
        },
      }).routes
    ).toEqual([{ key: 'first-test', name: 'first' }]);
  }
);

test('creates defensive empty state', () => {
  expect(createInitialState({ routeNames: [], routeParamList: {} })).toEqual({
    stale: false,
    key: 'navigator-test',
    index: -1,
    routeNames: [],
    routes: [],
  });
});
