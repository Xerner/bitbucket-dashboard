import { Author } from "./Author";

export interface Commit {
  rendered: {
    message: {
      raw: string;
      markup: string;
      html: string;
      type: string;
    };
  };
  hash: string;
  repository: {
    name: string;
    type: string;
    full_name: string;
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
    uuid: string;
  };
  links: {
    self: {
      href: string;
    };
    comments: {
      href: string;
    };
    patch: {
      href: string;
    };
    html: {
      href: string;
    };
    diff: {
      href: string;
    };
    approve: {
      href: string;
    };
    statuses: {
      href: string;
    };
  };
  author: Author;
  summary: {
    raw: string;
    markup: string;
    html: string;
    type: string;
  };
  participants: any[];
  parents: {
    type: string;
    hash: string;
    links: {
      self: {
        href: string;
      };
      html: {
        href: string;
      };
    };
  }[];
  date: string;
  message: string;
  type: string;
}
