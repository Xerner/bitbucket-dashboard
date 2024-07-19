export interface User {
  uuid: string;
  account_id: string;
  display_name: string;
  nickname: string;
  links: {
    self: string;
    avatar: string;
    html: string;
  };
}
