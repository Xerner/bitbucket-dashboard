export interface User {
  display_name: string;
  uuid: string;
  links: {
    self: {
      href: string;
    };
    html: {
      href: string;
    };
    avatar: {
      href: string;
    };
  };
  type: string;
  nickname: string;
  account_id: string;
};
