import { User } from "./User";

export interface Author {
  raw: string;
  type?: string;
  user?: User;
}
