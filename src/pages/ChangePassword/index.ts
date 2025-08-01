import Handlebars from "handlebars";
import rawTemplate from "./ChangePassword.hbs?raw";

export function renderChangePasswordPage() {
  const template = Handlebars.compile(rawTemplate);
  return template({});
}

