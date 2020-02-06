import {initialiser} from '../src/lib/AsyncInitialisation';


test("init is only called once", async done => {

    let initializing = false;
    let initialized = false;
    let initA = false;
    let initB = false;
    let initC = false;

    let resolveInit;

    class SomeClass {
        constructor() {}

        @initialiser() init() : Promise<void> {
            expect(initializing).toBeFalsy();
            expect(initialized).toBeFalsy();
            initializing = true;
            return new Promise((resolve, reject) => {
                resolveInit = () => {
                    initializing = false;
                    initialized = true;
                    resolve();
                }
            });
        }
    }

    let classToInitialize = new SomeClass();

    let promisesToWaitFor = [];

    promisesToWaitFor.push(classToInitialize.init().then(() => initA = true));

    expect(initializing).toBeTruthy();
    expect(initialized).toBeFalsy();
    expect(initA).toBeFalsy();

    promisesToWaitFor.push(classToInitialize.init().then(() => initB = true));

    expect(initializing).toBeTruthy();
    expect(initialized).toBeFalsy();
    expect(initB).toBeFalsy();

    resolveInit();

    expect(initializing).toBeFalsy();
    expect(initialized).toBeTruthy();

    await Promise.all(promisesToWaitFor);

    expect(initA).toBeTruthy();
    expect(initB).toBeTruthy();

    await classToInitialize.init().then(() => initC = true);

    expect(initC).toBeTruthy();

    done();
});
