export interface WithCallback<T = any> {
  payload: T
  callback?: (response: any) => void
}
