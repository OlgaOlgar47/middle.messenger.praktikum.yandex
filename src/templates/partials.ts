import Handlebars from "handlebars";
import Button from "@/components/Button/Button.hbs?raw";
import Input from "@/components/Input/Input.hbs?raw";
import FooterNav from "@/components/FooterNav/FooterNav.hbs?raw";
import Link from "@/components/Link/Link.hbs?raw";

Handlebars.registerPartial("button", Button);
Handlebars.registerPartial("input", Input);
Handlebars.registerPartial("footerNav", FooterNav);
Handlebars.registerPartial("link", Link);
