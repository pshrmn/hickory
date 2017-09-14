import { HickoryLocation } from './interface';

export type SubscriberFn = (location: HickoryLocation, action: string) => void;
export type UnsubscribeFn = () => void;
export interface SubscriptionMethods {
  subscribe(fn: SubscriberFn): UnsubscribeFn;
  emit(location: HickoryLocation, action: string): void;
  removeAllSubscribers(): void;
}

export default function subscriptionCoordinator(): SubscriptionMethods {
  let subscribers: Array<SubscriberFn | null> = [];

  function subscribe(fn: SubscriberFn): UnsubscribeFn {
    const index: number = subscribers.push(fn) - 1;
    return function() {
      subscribers[index] = null;
    }
  }

  function emit(location: HickoryLocation, action: string): void {
    subscribers.forEach(fn => {
      if (fn !== null) {
        fn(location, action);
      }
    });
  }

  function removeAllSubscribers() {
    subscribers = [];
  }

  return {
    subscribe,
    emit,
    removeAllSubscribers
  };
}
