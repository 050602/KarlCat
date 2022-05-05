export abstract class Sigleton {
    constructor() {
    }

    public initInstance() {
    };

    public destoryInstance() {
    };

    static getInstance(T: any) {
        if (T.instance == null) {
            T.instance = new T();
            T.instance.initInstance();
        }
        return T.instance;
    }
}