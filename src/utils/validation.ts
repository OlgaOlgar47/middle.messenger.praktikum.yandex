import { text } from "@/locale";

type RuleKey = "nameError" | "loginRule" | "emailRule" | "phoneRule" | "messageEmpty";

const validationRules: Record<string, { regex: RegExp; key: RuleKey }> = {
  first_name: {
    regex: /^[A-ZА-ЯЁ][a-zа-яё-]+$/,
    key: "nameError",
  },
  second_name: {
    regex: /^[A-ZА-ЯЁ][a-zа-яё-]+$/,
    key: "nameError",
  },
  display_name: {
    regex: /^[A-ZА-ЯЁ][a-zа-яё-]+$/,
    key: "nameError",
  },
  login: {
    regex: /^([a-zA-Z0-9_-]{3,20}|[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
    key: "loginRule",
  },
  email: {
    regex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    key: "emailRule",
  },
  phone: {
    regex: /^\+?[\d\s-]{10,15}$/,
    key: "phoneRule",
  },
  message: {
    regex: /.+/,
    key: "messageEmpty",
  },
};

export function validateField(name: string, value: string): { isValid: boolean; error?: string } {
  const copy = text();

  if (!value.trim() && (name === "query" || name === "search")) {
    return { isValid: true };
  }

  if (!value.trim()) {
    return { isValid: false, error: copy.fieldRequired };
  }
  if (name === "password" || name === "oldPassword" || name === "newPassword") {
    if (value.length < 8 || value.length > 40) {
      return { isValid: false, error: copy.passwordLength };
    }
    if (!/[A-Z]/.test(value)) {
      return { isValid: false, error: copy.passwordUpper };
    }
    if (!/\d/.test(value)) {
      return { isValid: false, error: copy.passwordDigit };
    }
    return { isValid: true };
  }
  const rule = validationRules[name];
  if (!rule) {
    return { isValid: true };
  }
  const isValid = rule.regex.test(value);

  return { isValid, error: isValid ? undefined : copy[rule.key] };
}
