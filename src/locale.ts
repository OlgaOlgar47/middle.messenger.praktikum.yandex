export type Locale = "ru" | "es";

const LOCALE_KEY = "uruschat-locale";

const ru = {
  language: "Язык",
  introPhrase: "Объединяя семьи через континенты",
  loginTitle: "Вход",
  loginLabel: "Логин",
  loginPlaceholder: "ivanivanov",
  passwordLabel: "Пароль",
  passwordPlaceholder: "********",
  loginSubmit: "Войти",
  noAccount: "Нет аккаунта?",
  loginSuccess: "Успешный вход!",
  loginError: "Ошибка входа. Проверьте данные.",
  profileLoading: "Загрузка...",
  email: "Почта",
  firstName: "Имя",
  lastName: "Фамилия",
  displayName: "Имя в чате",
  phone: "Телефон",
  editData: "Изменить данные",
  changePassword: "Изменить пароль",
  logout: "Выйти",
  back: "Назад",
  logoutSuccess: "Вы успешно вышли из системы",
  logoutError: "Ошибка при выходе",
  avatarType: "Пожалуйста, выберите изображение",
  avatarSize: "Размер файла не должен превышать 5MB",
  avatarError: "Ошибка при обновлении аватара",
  avatarAlt: "Аватар",
  fieldRequired: "Поле обязательно для заполнения",
  nameError: "Первая буква заглавная, латиница или кириллица, только дефис",
  loginRule: "Логин (3-20 символов) или email",
  emailRule: "Латиница, @ и точка после, буквы перед точкой",
  passwordLength: "Длина должна быть от 8 до 40 символов",
  passwordUpper: "Должен быть хотя бы 1 заглавный символ",
  passwordDigit: "Должна быть хотя бы 1 цифра",
  phoneRule: "10-15 цифр, может начинаться с +",
  messageEmpty: "Сообщение не должно быть пустым",
  alreadyInSystem: "Пользователь уже в системе",
  loginExists: "Такой логин уже занят",
  emailExists: "Такая почта уже занята",
  sessionExpired: "Сессия истекла. Войдите снова",
  wrongPassword: "Неверный пароль",
  networkError: "Нет соединения с сервером",
  timeoutError: "Сервер не ответил вовремя",
  requestAborted: "Запрос прерван",
  passwordMismatch: "Пароли не совпадают",
  registerError: "Ошибка регистрации",
  fillAll: "Заполните все поля",
  profileMissing: "Данные пользователя не загружены",
  profileUpdateError: "Ошибка при обновлении профиля",
  passwordChangeError: "Ошибка изменения пароля",
  chatConnectError: "Ошибка подключения к чату",
  pickChatToSend: "Выберите чат для отправки сообщения",
  messageSendError: "Ошибка отправки сообщения",
  chatsLoadError: "Ошибка загрузки чатов",
  chatCreateError: "Ошибка создания чата",
  addUserError: "Ошибка добавления пользователя",
  addUsersError: "Ошибка добавления пользователей",
  removeUserError: "Ошибка удаления пользователя",
  chatUsersError: "Ошибка загрузки пользователей чата",
  tokenError: "Ошибка получения токена",
  userNotFound: "Пользователь с логином «{login}» не найден",
  profile: "Профиль",
  search: "Поиск",
  createChat: "Создать чат",
  noChats: "Нет чатов. Создайте новый чат!",
  nothingFound: "Ничего не найдено",
  noMessages: "Нет сообщений",
  members: "Участники",
  chatMenu: "Меню чата",
  addUser: "Добавить пользователя",
  removeUser: "Удалить пользователя",
  emptyThread: "Сообщения будут отображаться здесь",
  messagePlaceholder: "Введите сообщение",
  send: "Отправить",
  pickChat: "Выберите чат для начала общения",
  createChatTitle: "Создать новый чат",
  addUserTitle: "Добавить пользователя в чат",
  removeUserTitle: "Удалить пользователя из чата",
  chatName: "Название чата",
  userLogin: "Логин пользователя",
  chatNamePlaceholder: "Введите название чата",
  userLoginPlaceholder: "Введите логин пользователя",
  create: "Создать",
  add: "Добавить",
  remove: "Удалить",
  alreadyInChat: "Пользователь уже в чате",
  userAdded: "Пользователь добавлен",
  notInChat: "Такого пользователя нет в чате",
  userRemoved: "Пользователь удалён",
  yesterday: "Вчера",
  loading: "Загрузка...",
  chatCreated: "Чат успешно создан",
};

const es: typeof ru = {
  language: "Idioma",
  introPhrase: "Uniendo familias a través de los continentes",
  loginTitle: "Iniciar sesión",
  loginLabel: "Usuario",
  loginPlaceholder: "juangarcia",
  passwordLabel: "Contraseña",
  passwordPlaceholder: "********",
  loginSubmit: "Entrar",
  noAccount: "¿No tienes cuenta?",
  loginSuccess: "¡Sesión iniciada!",
  loginError: "Error de acceso. Revisa los datos.",
  profileLoading: "Cargando...",
  email: "Correo",
  firstName: "Nombre",
  lastName: "Apellido",
  displayName: "Nombre en el chat",
  phone: "Teléfono",
  editData: "Editar datos",
  changePassword: "Cambiar contraseña",
  logout: "Salir",
  back: "Atrás",
  logoutSuccess: "Sesión cerrada",
  logoutError: "Error al salir",
  avatarType: "Elige una imagen",
  avatarSize: "El archivo no debe superar 5MB",
  avatarError: "No se pudo actualizar la foto",
  avatarAlt: "Avatar",
  fieldRequired: "El campo es obligatorio",
  nameError: "La primera letra en mayúscula, solo letras y un guion",
  loginRule: "Usuario (3-20 caracteres) o correo",
  emailRule: "Letras, @ y un punto, con letras antes del punto",
  passwordLength: "Debe tener de 8 a 40 caracteres",
  passwordUpper: "Debe haber al menos 1 mayúscula",
  passwordDigit: "Debe haber al menos 1 número",
  phoneRule: "De 10 a 15 dígitos, puede empezar con +",
  messageEmpty: "El mensaje no puede estar vacío",
  alreadyInSystem: "El usuario ya está en el sistema",
  loginExists: "Ese usuario ya está ocupado",
  emailExists: "Ese correo ya está ocupado",
  sessionExpired: "La sesión expiró. Entra de nuevo",
  wrongPassword: "Contraseña incorrecta",
  networkError: "No hay conexión con el servidor",
  timeoutError: "El servidor no respondió a tiempo",
  requestAborted: "La solicitud se interrumpió",
  passwordMismatch: "Las contraseñas no coinciden",
  registerError: "Error de registro",
  fillAll: "Completa todos los campos",
  profileMissing: "No se cargaron los datos del usuario",
  profileUpdateError: "No se pudo actualizar el perfil",
  passwordChangeError: "No se pudo cambiar la contraseña",
  chatConnectError: "No se pudo conectar al chat",
  pickChatToSend: "Elige un chat para enviar el mensaje",
  messageSendError: "No se pudo enviar el mensaje",
  chatsLoadError: "No se pudieron cargar los chats",
  chatCreateError: "No se pudo crear el chat",
  addUserError: "No se pudo agregar el usuario",
  addUsersError: "No se pudieron agregar los usuarios",
  removeUserError: "No se pudo eliminar el usuario",
  chatUsersError: "No se pudieron cargar los participantes",
  tokenError: "No se pudo obtener el token",
  userNotFound: "No se encontró el usuario «{login}»",
  profile: "Perfil",
  search: "Buscar",
  createChat: "Crear chat",
  noChats: "No hay chats. ¡Crea uno nuevo!",
  nothingFound: "No se encontró nada",
  noMessages: "Sin mensajes",
  members: "Participantes",
  chatMenu: "Menú del chat",
  addUser: "Agregar usuario",
  removeUser: "Eliminar usuario",
  emptyThread: "Los mensajes aparecerán aquí",
  messagePlaceholder: "Escribe un mensaje",
  send: "Enviar",
  pickChat: "Elige un chat para empezar",
  createChatTitle: "Crear un chat nuevo",
  addUserTitle: "Agregar usuario al chat",
  removeUserTitle: "Eliminar usuario del chat",
  chatName: "Nombre del chat",
  userLogin: "Usuario",
  chatNamePlaceholder: "Ingresa el nombre del chat",
  userLoginPlaceholder: "Ingresa el usuario",
  create: "Crear",
  add: "Agregar",
  remove: "Eliminar",
  alreadyInChat: "El usuario ya está en el chat",
  userAdded: "Usuario agregado",
  notInChat: "Ese usuario no está en el chat",
  userRemoved: "Usuario eliminado",
  yesterday: "Ayer",
  loading: "Cargando...",
  chatCreated: "Chat creado",
};

const copy = { ru, es };

type Listener = () => void;

const listeners = new Set<Listener>();

function readInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_KEY);
    if (saved === "ru" || saved === "es") {
      return saved;
    }
  } catch {
    // Storage can be blocked; the device language is used instead.
  }

  return navigator.language.toLowerCase().startsWith("ru") ? "ru" : "es";
}

let locale: Locale = readInitialLocale();
document.documentElement.lang = locale;

export function getLocale(): Locale {
  return locale;
}

export function text(): typeof ru {
  return copy[locale];
}

export function setLocale(next: Locale): void {
  if (next === locale) {
    return;
  }
  locale = next;
  document.documentElement.lang = next;
  try {
    localStorage.setItem(LOCALE_KEY, next);
  } catch {
    // The choice still applies until the page is closed.
  }
  listeners.forEach((listener) => listener());
}

export function onLocale(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const serverErrors: Record<string, keyof typeof ru> = {
  "Login or password is incorrect": "loginError",
  "User already in system": "alreadyInSystem",
  "Login already exists": "loginExists",
  "Email already exists": "emailExists",
  "Cookie is not valid": "sessionExpired",
  "Password is incorrect": "wrongPassword",
  "Network error": "networkError",
  "Request timeout": "timeoutError",
  "Request aborted": "requestAborted",
};

export function errorText(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : fallback;
  const key = serverErrors[message];
  if (key) {
    return text()[key];
  }
  if (message.startsWith("Error ")) {
    return fallback;
  }
  return message;
}

export function userNotFound(login: string): string {
  return text().userNotFound.replace("{login}", login);
}
