import type {
    Fixtures,
    PlaywrightTestArgs,
    PlaywrightTestOptions,
    PlaywrightWorkerArgs,
    PlaywrightWorkerOptions,
    TestType,
} from '@playwright/test';
import {test as playwrightBaseTest,} from '@playwright/test';

// ---------------------------------------------------------------------------------------------------------------------
// Example 1:
//  WORKS

export const it1 = playwrightBaseTest;
export const describe1: typeof playwrightBaseTest.describe = playwrightBaseTest.describe;


// ---------------------------------------------------------------------------------------------------------------------
// Example 2:
//  WORKS

export const it2 = playwrightBaseTest;
export const describe2: TestType<object, object>['describe'] = playwrightBaseTest.describe;


// ---------------------------------------------------------------------------------------------------------------------
// Example 3:
//  WORKS PARTIALLY

export type SimplifiedTestApi<TestArgs extends Record<string, any>, WorkerArgs extends Record<string, any>> = {
    it: TestType<TestArgs, WorkerArgs>,
    describe: typeof playwrightBaseTest.describe // TestType<TestArgs, WorkerArgs>['describe'],
}

function createSimplifiedTestApi<TestArgs extends Record<string, any>, WorkerArgs extends Record<string, any> = object>(baseTest: TestType<TestArgs, WorkerArgs>): SimplifiedTestApi<TestArgs, WorkerArgs> {
    return {
        describe:   baseTest.describe,
        it:         baseTest,
    };
}

const simplifiedApi = createSimplifiedTestApi(playwrightBaseTest)

// DOESN'T WORK
//      Exported variable 'describe' has or is using name 'SuiteFunction' from external module "node_modules/@playwright/test/types/test" but cannot be named.
//
// export const { it, describe } = simplifiedApi;

/**
 * WORKS, but only when the type of describe is specified explicitly
 */
export const it3 = simplifiedApi.it;
export const describe3: typeof playwrightBaseTest.describe = simplifiedApi.describe;


// ---------------------------------------------------------------------------------------------------------------------
// Example 4:
//  DOESN'T WORK IN GENERAL CASE

export interface CustomOptions {
    defaultActorName: string;
}

export const fixtures: Fixtures<CustomOptions, object, PlaywrightTestArgs & PlaywrightTestOptions, PlaywrightWorkerArgs & PlaywrightWorkerOptions> = {
    defaultActorName: [
        'Polly',
        { option: true },
    ],
};

export type TestApi<TestArgs extends Record<string, any>, WorkerArgs extends Record<string, any>> =
    Pick<TestType<TestArgs, WorkerArgs>, 'beforeAll' | 'beforeEach' | 'afterEach' | 'afterAll' | 'expect' | 'describe' > &
    {
        useFixtures: <T extends Record<string, any>, W extends Record<string, any> = object>(customFixtures: Fixtures<T, W, TestArgs, WorkerArgs>) => TestApi<TestArgs & T, WorkerArgs & W>,
        it: TestType<TestArgs, WorkerArgs>,
        test: TestType<TestArgs, WorkerArgs>,
    }

function createTestApi<TestArgs extends Record<string, any>, WorkerArgs extends Record<string, any> = object>(baseTest: TestType<TestArgs, WorkerArgs>): TestApi<TestArgs, WorkerArgs> {
    return {
        useFixtures<T extends Record<string, any>, W extends Record<string, any> = object>(customFixtures: Fixtures<T, W, TestArgs, WorkerArgs>): TestApi<TestArgs & T, WorkerArgs & W> {
            return createTestApi(baseTest.extend(customFixtures));
        },
        beforeAll:  baseTest.beforeAll,
        beforeEach: baseTest.beforeEach,
        afterEach:  baseTest.afterEach,
        afterAll:   baseTest.afterAll,
        describe:   baseTest.describe,
        expect:     baseTest.expect,
        it:         baseTest,
        test:       baseTest,
    };
}

// Export DOESN'T WORK
//      Exported variable 'describe' has or is using name 'SuiteFunction' from external module "node_modules/@playwright/test/types/test" but cannot be named.
//
// export const {
//     it,
//     test,
//     describe,
//     beforeAll,
//     beforeEach,
//     afterEach,
//     afterAll,
//     expect,
//     useFixtures,
// } = createTestApi(playwrightBaseTest).useFixtures(fixtures);

// Assigning to a variable works with 1st degree export
const api4 = createTestApi(playwrightBaseTest).useFixtures(fixtures);

export const it4 = api4.it;
export const describe4: typeof playwrightBaseTest.describe = api4.describe;
export const useFixtures4 = api4.useFixtures;

// but breaks when a 2nd degree consuming module would try to re-export describe:
//      Exported variable 'describe' has or is using name 'SuiteFunction' from external module "node_modules/@playwright/test/types/test" but cannot be named.
const api5 = useFixtures4({})
export const describe5 = api5.describe;
