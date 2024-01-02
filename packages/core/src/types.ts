export interface Unsubscribable {
  unsubscribe(): void;
}

export interface Subscribable<S> {
  subscribe(next: (state: S) => void): Unsubscribable;
}
