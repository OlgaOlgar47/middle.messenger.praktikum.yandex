import { Input } from "@/components/Input";

export function createFormSubmitHandler(
  inputs: Input[],
  onSubmit?: (formData: Record<string, string>) => void
) {
  return (e: Event) => {
    e.preventDefault();
    const formData: Record<string, string> = {};
    let isFormValid = true;

    inputs.forEach((input: Input) => {
      const { isValid, error } = input.validate();
      console.log(`Input "${input || "unknown"}": isValid=${isValid}, error="${error || "none"}"`);
      if (!isValid) isFormValid = false;
      const inputEl = input.getContent()?.querySelector("input") as HTMLInputElement;
      if (inputEl) formData[inputEl.name] = inputEl.value;
    });

    console.log(`Overall form: isValid=${isFormValid}, data=`, formData);

    if (isFormValid) {
      console.log("Form data:", formData);
      onSubmit?.(formData);
    } else {
      console.log("Форма невалидна");
    }
  };
}
