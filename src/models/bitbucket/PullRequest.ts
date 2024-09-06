import { BitbucketRepository } from "./BitbucketRepository";
import { User } from "./User";

export interface PullRequest {
  "comment_count": number,
  "task_count": number,
  "type": string,
  "id": number,
  "title": string,
  "description": string,
  "state": string,
  "merge_commit": string | null,
  "close_source_branch": boolean,
  "closed_by": string | null,
  "author": User,
  "reason": string,
  "created_on": string,
  "updated_on": string,
  "destination": {
    "branch": {
      "name": string
    },
    "commit": {
      "hash": string,
      "links": {
        "self": {
          "href": string
        },
        "html": {
          "href": string
        }
      },
      "type": string
    },
    "repository": BitbucketRepository
  },
  "source": {
    "branch": {
      "name": string,
      "links": {}
    },
    "commit": {
      "hash": string,
      "links": {
        "self": {
          "href": string
        },
        "html": {
          "href": string
        }
      },
      "type": string
    },
    "repository": {
      "type": string,
      "full_name": string,
      "links": {
        "self": {
          "href": string
        },
        "html": {
          "href": string
        },
        "avatar": {
          "href": string
        }
      },
      "name": string,
      "uuid": string
    }
  },
  "participants":
  {
    "type": string,
    "user": User
    "role": string,
    "approved": boolean,
    "state": string | null,
    "participated_on": string | null
  }[],
  "links": {
    "self": {
      "href": string
    },
    "html": {
      "href": string
    },
    "commits": {
      "href": string
    },
    "approve": {
      "href": string
    },
    "request-changes": {
      "href": string
    },
    "diff": {
      "href": string
    },
    "diffstat": {
      "href": string
    },
    "comments": {
      "href": string
    },
    "activity": {
      "href": string
    },
    "merge": {
      "href": string
    },
    "decline": {
      "href": string
    },
    "statuses": {
      "href": string
    }
  },
  "summary": {
    "type": string,
    "raw": string,
    "markup": string,
    "html": string
  }
}

export enum PullRequestState {
  OPEN,
  MERGED,
  DECLINED,
  SUPERSEDED
}
