export type Listener = (...args: unknown[]) => void;

export type BaseProps = {
  className?: string;
  styles?: Record<string, string>;
  events?: Record<string, (e: Event) => void>;
};

export type RegisterData = {
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  password: string;
  phone: string;
};
export type LoginData = {
  login: string;
  password: string;
};
export type User = {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string;
  phone: string;
  login: string;
  avatar: string;
  email: string;
};

export type UpdateProfileData = {
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
};

export type ChangePasswordData = {
  oldPassword: string;
  newPassword: string;
};

export type AvatarResponse = {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
  avatar: string;
};

export type Chat = {
  id: number;
  title: string;
  avatar: string | null;
  unread_count: number;
  last_message: {
    user: {
      first_name: string;
      second_name: string;
      avatar: string | null;
      email: string;
      login: string;
      phone: string;
    };
    time: string;
    content: string;
  } | null;
};

export type CreateChatData = {
  title: string;
};

export type AddUserToChatData = {
  users: number[];
  chatId: number;
};

export type DeleteUserFromChatData = {
  users: number[];
  chatId: number;
};

export type ChatUser = {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string | null;
  login: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: string;
};

export type Message = {
  id: number;
  user_id: number;
  chat_id: number;
  type: string;
  time: string;
  content: string;
  file?: {
    id: number;
    user_id: number;
  };
};

export type SendMessageData = {
  content: string;
  type?: string;
};
