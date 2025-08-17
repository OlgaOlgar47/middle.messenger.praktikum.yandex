export const validationRules: Record<string, { regex: RegExp; errorMessage: string }> = {
  first_name: {
    regex: /^[A-ZА-ЯЁ][a-zа-яё-]+$/,
    errorMessage: "Первая буква заглавная, латиница/кириллица, только дефис, без пробелов/цифр",
  },
  second_name: {
    regex: /^[A-ZА-ЯЁ][a-zа-яё-]+$/,
    errorMessage: "Первая буква заглавная, латиница/кириллица, только дефис, без пробелов/цифр",
  },
  display_name: {
    regex: /^[A-ZА-ЯЁ][a-zа-яё-]+$/,
    errorMessage: "Первая буква заглавная, латиница/кириллица, только дефис, без пробелов/цифр",
  },
  login: {
    regex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    errorMessage:
      "Введите корректный email или логин (3-20 символов, латиница, цифры, дефис, " +
      "подчеркивание, без пробелов)",
  },
  email: {
    regex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    errorMessage: "Латиница, @ и точка после, буквы перед точкой",
  },
  password: {
    regex: /^(?=.*[A-Z])(?=.*\d).{8,40}$/,
    errorMessage: "8-40 символов, хотя бы 1 заглавная буква и 1 цифра",
  },
  oldPassword: {
    regex: /^(?=.*[A-Z])(?=.*\d).{8,40}$/,
    errorMessage: "8-40 символов, хотя бы 1 заглавная буква и 1 цифра",
  },
  newPassword: {
    regex: /^(?=.*[A-Z])(?=.*\d).{8,40}$/,
    errorMessage: "8-40 символов, хотя бы 1 заглавная буква и 1 цифра",
  },
  phone: {
    regex: /^\+?[\d\s-]{10,15}$/,
    errorMessage: "10-15 цифр, может начинаться с +",
  },
  message: {
    regex: /.+/,
    errorMessage: "Сообщение не должно быть пустым",
  },
};

export function validateField(name: string, value: string): { isValid: boolean; error?: string } {
  if (name === "password" || name === "oldPassword" || name === "newPassword") {
    if (value.length < 8 || value.length > 40)
      return { isValid: false, error: "Длина должна быть от 8 до 40 символов" };
    if (!/[A-Z]/.test(value))
      return { isValid: false, error: "Должен быть хотя бы 1 заглавный символ" };
    if (!/\d/.test(value)) return { isValid: false, error: "Должна быть хотя бы 1 цифра" };
    return { isValid: true };
  }
  const rule = validationRules[name];
  if (!rule) return { isValid: true };
  const isValid = rule.regex.test(value);

  return { isValid, error: isValid ? undefined : rule.errorMessage };
}
