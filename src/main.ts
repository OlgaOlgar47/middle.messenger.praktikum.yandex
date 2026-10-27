import { App } from "./App";
import { showIntro } from "./intro/showIntro";
import "./global.sass";
import "./intro/intro.sass";

showIntro();

// eslint-disable-next-line no-new
new App();
