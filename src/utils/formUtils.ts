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
      const { isValid } = input.validate();
      if (!isValid) isFormValid = false;
      const inputEl = input.getContent()?.querySelector("input") as HTMLInputElement;
      if (inputEl) formData[inputEl.name] = inputEl.value;
    });
    if (isFormValid) {
      onSubmit?.(formData);
    }
  };
}
