import { DateTime } from "luxon";
import { BitbucketRepository } from "./BitbucketRepository";

export interface PullRequest {
  id: number;
  title: string;
  created_on: string;
  updated_on: string;
  destination: {
    repository: BitbucketRepository
  }
}
