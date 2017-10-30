import { HickoryLocation } from './interface';
export declare type SubscriberFn = (location: HickoryLocation, action: string) => void;
export declare type UnsubscribeFn = () => void;
export interface SubscriptionMethods {
    subscribe(fn: SubscriberFn): UnsubscribeFn;
    emit(location: HickoryLocation, action: string): void;
    removeAllSubscribers(): void;
}
export default function subscriptionCoordinator(): SubscriptionMethods;
