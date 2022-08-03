export function initialiser() {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const init = descriptor.value;
        descriptor.value = function() {
            if(this._initialised) {
                return Promise.resolve();
            } else if(this._initPromise) {
                return this._initPromise;
            } else {
                return this._initPromise = init.apply(this, arguments).then(() => this._initialised = true);
            }
        }
    };
}
