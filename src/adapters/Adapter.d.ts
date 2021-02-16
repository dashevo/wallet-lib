export declare interface Adapter {
    config()

    setItem(key, item): Promise<any>

    getItem(key): Promise<any>
}
