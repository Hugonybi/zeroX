import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          // Minimum 8 characters
          if (value.length < 8) {
            return false;
          }

          // At least one uppercase letter
          if (!/[A-Z]/.test(value)) {
            return false;
          }

          // At least one lowercase letter
          if (!/[a-z]/.test(value)) {
            return false;
          }

          // At least one number
          if (!/[0-9]/.test(value)) {
            return false;
          }

          // At least one special character
          if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            return false;
          }

          // Check against common weak passwords
          const commonPasswords = [
            'password',
            'password123',
            '12345678',
            'qwerty123',
            'admin123',
            'letmein',
            'welcome123',
          ];

          if (commonPasswords.includes(value.toLowerCase())) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character (!@#$%^&*(),.?":{}|<>)';
        },
      },
    });
  };
}
