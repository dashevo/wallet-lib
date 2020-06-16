export declare class BaseTransporter {
    constructor(props: BaseTransporterOptions);
    type: string;
    state:{
        block: any,
        blockHeaders: any,
        executors:{
            blocks: any,
            blockHeaders: any,
            addresses: any
        }
        addressTransactionsMap: any;
        subscriptions: {
            addresses: any
        }
    }
}

export declare interface BaseTransporterOptions {
    type: string;
}
export interface Transporter extends BaseTransporter {}
