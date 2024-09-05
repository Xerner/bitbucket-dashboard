/**
 * absolute hack to get the name of a javascript object
 *
 * {@link https://stackoverflow.com/a/37057212/12265840}
 *
 * ```ts
 * // propertyName = 'some_property'
 * var propertyName = nameOf({ myVariable.some_property })
 * ```
 */
export function nameOf(obj: object) {
  return Object.keys(obj)[0];
}
