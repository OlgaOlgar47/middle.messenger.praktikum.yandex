import Block from "@/framework/Block";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { BackButton } from "@/components/BackButton";
import { createFormSubmitHandler } from "@/utils/formUtils";
import type { BaseProps, User, UpdateProfileData } from "@/types";
import { router } from "@/App";
import { UserController } from "@/controllers/UserController";
import { connect } from "@/store/connect";
import type { State } from "@/store/Store";
import { Toast } from "@/utils/toast";
import { errorText, onLocale, text } from "@/locale";

import styles from "../styles/authForm.module.sass";
import settingsStyles from "./Settings.module.sass";

interface SettingsProps extends BaseProps {
  user?: User | null;
  onSubmit?: (formData: Record<string, string>) => void;
  fields?: Input[];
  button?: Button;
  backButton?: BackButton;
  settingsStyles?: unknown;
  originalUser?: User | null;
  title?: string;
}

export class Settings extends Block<SettingsProps> {
  constructor(props: SettingsProps = {}) {
    const { user } = props || {};
    const copy = text();

    super("div", {
      ...props,
      styles,
      settingsStyles,
      title: copy.profileSettings,
      originalUser: user ? { ...user } : null,
      fields: [],
      button: new Button({
        type: "submit",
        label: copy.saveChanges,
        className: styles.button,
        disabled: true,
      }),
      backButton: new BackButton({
        label: copy.back,
        onClick: () => {
          router.go("/profile");
        },
      }),
      events: {},
    });
    onLocale(() => this.applyLocale());
  }

  protected init(): void {
    const fields = this.createFields(this.props.user);
    this.setProps({ fields });

    this.props.events = {
      submit: createFormSubmitHandler(fields, this.handleSubmit.bind(this)),
    };

    this.addChangeListeners(fields);

    if (this.props.user) {
      this.updateFields(this.props.user);
    }
  }

  private createFields(user?: User | null): Input[] {
    const copy = text();
    return [
      new Input({
        type: "text",
        name: "first_name",
        label: copy.firstName,
        placeholder: copy.enterFirstName,
        value: user?.first_name || "",
        required: true,
        className: styles.input,
      }),
      new Input({
        type: "text",
        name: "second_name",
        label: copy.lastName,
        placeholder: copy.enterLastName,
        value: user?.second_name || "",
        required: true,
        className: styles.input,
      }),
      new Input({
        type: "text",
        name: "display_name",
        label: copy.displayName,
        placeholder: copy.enterDisplayName,
        value: user?.display_name || "",
        className: styles.input,
      }),
      new Input({
        type: "text",
        name: "login",
        label: copy.loginLabel,
        placeholder: copy.enterLogin,
        value: user?.login || "",
        required: true,
        className: styles.input,
      }),
      new Input({
        type: "email",
        name: "email",
        label: copy.email,
        placeholder: copy.enterEmail,
        value: user?.email || "",
        required: true,
        className: styles.input,
      }),
      new Input({
        type: "tel",
        name: "phone",
        label: copy.phone,
        placeholder: copy.enterPhone,
        value: user?.phone || "",
        required: true,
        className: styles.input,
      }),
    ];
  }

  private applyLocale(): void {
    const copy = text();
    const labels = [
      { label: copy.firstName, placeholder: copy.enterFirstName },
      { label: copy.lastName, placeholder: copy.enterLastName },
      { label: copy.displayName, placeholder: copy.enterDisplayName },
      { label: copy.loginLabel, placeholder: copy.enterLogin },
      { label: copy.email, placeholder: copy.enterEmail },
      { label: copy.phone, placeholder: copy.enterPhone },
    ];
    (this.lists.fields as Input[] | undefined)?.forEach((input, index) => {
      const field = input.element?.querySelector("input");
      const value = field instanceof HTMLInputElement ? field.value : "";
      const next = labels[index];
      if (!next) return;
      input.setProps({ ...next, value });
    });
    (this.children.button as Button | undefined)?.setProps({ label: copy.saveChanges });
    (this.children.backButton as BackButton | undefined)?.setProps({ label: copy.back });
    this.setProps({ title: copy.profileSettings });
    this.addChangeListeners((this.lists.fields as Input[]) || []);
  }

  public updateFields(user: User) {
    this.setProps({ originalUser: { ...user } });

    const newFields = this.createFields(user);

    this.setProps({ fields: newFields });

    this.props.events = {
      submit: createFormSubmitHandler(newFields, this.handleSubmit.bind(this)),
    };

    this.addChangeListeners(newFields);

    setTimeout(() => this.checkForChanges(), 100);
  }

  private addChangeListeners(inputs: Input[]) {
    inputs.forEach((input) => {
      const inputElement = input.element?.querySelector("input") as HTMLInputElement;
      if (inputElement) {
        inputElement.addEventListener("input", () => {
          this.checkForChanges();
        });
      }
    });
  }

  private checkForChanges() {
    const inputs = this.lists.fields as Input[];
    const { originalUser, button } = this.props;

    if (!originalUser || !inputs) {
      return;
    }

    let hasChanges = false;
    inputs.forEach((input) => {
      const inputElement = input.element?.querySelector("input") as HTMLInputElement;
      if (inputElement) {
        const name = inputElement.name as keyof User;
        const currentValue = inputElement.value;
        const originalValue = String(originalUser[name] || "");

        if (currentValue !== originalValue) {
          hasChanges = true;
        }
      }
    });

    if (button) {
      button.setProps({ disabled: !hasChanges });
    } else {
      const buttonElement = this.element?.querySelector(
        'button[type="submit"]'
      ) as HTMLButtonElement;
      if (buttonElement) {
        buttonElement.disabled = !hasChanges;
      }
    }
  }

  private async handleSubmit(formData: Record<string, string>) {
    const submitButton = this.element?.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton?.disabled) {
      return;
    }

    const { originalUser } = this.props;
    if (!originalUser) {
      Toast.error(text().profileMissing);
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const updateData: UpdateProfileData = {
        first_name: formData.first_name,
        second_name: formData.second_name,
        display_name: formData.display_name,
        login: formData.login,
        email: formData.email,
        phone: formData.phone,
      };

      await UserController.updateProfile(updateData);
      Toast.success(text().profileUpdated);
      setTimeout(() => {
        router.go("/profile");
      }, 1000);
    } catch (error) {
      Toast.error(errorText(error, text().profileUpdateError));

      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  }

  override render() {
    return `
      <div class="{{styles.formPage}}">
        <form novalidate class="{{styles.form}}">
          <header class="{{styles.header}}">
            <h1 class="{{styles.title}} {{settingsStyles.headerSeetings}}">{{title}}</h1>
          </header>
          <ul class="{{styles.fields}}">
            {{#each fields}}
              <li>{{{this}}}</li>
            {{/each}}
          </ul>
          {{{button}}}
          {{{backButton}}}
        </form>
      </div>
    `;
  }
}

// HOC для подключения к store
const mapStateToProps = (state: State): Partial<SettingsProps> => ({
  user: state.user as User | null,
});

export const ConnectedSettings = connect(mapStateToProps)(Settings);
