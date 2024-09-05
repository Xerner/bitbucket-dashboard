export interface Project {
  type: string,
  links: {
    html: {
      href: string,
      name: string
    },
    avatar: {
      href: string,
      name: string
    }
  },
  uuid: string,
  key: string,
  owner: {
    type: string
  },
  name: string,
  description: string,
  is_private: boolean,
  created_on: string,
  updated_on: string,
  has_publicly_visible_repos: boolean
}
