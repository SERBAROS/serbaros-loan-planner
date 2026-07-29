import { registerDecorator, ValidationOptions } from 'class-validator';

const MONEDAS_VALIDAS = new Set(Intl.supportedValuesOf('currency'));

export function IsCurrencyCode(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCurrencyCode',
      target: object.constructor,
      propertyName,
      options: {
        message: 'El código de moneda no es válido (debe ser un código ISO 4217, ej. COP, USD, EUR).',
        ...validationOptions,
      },
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && MONEDAS_VALIDAS.has(value.toUpperCase());
        },
      },
    });
  };
}
