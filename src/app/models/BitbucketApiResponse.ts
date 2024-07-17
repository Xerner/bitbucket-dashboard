export interface BitbucketApiResponse<T> {
  values: T[];
  pagelen: number;
  size: number;
  page: number;
  next: string;
}
