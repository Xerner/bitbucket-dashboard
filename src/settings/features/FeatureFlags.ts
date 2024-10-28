import { IFeatureFlag } from "../../../repos/common/angular/feature-flags/interfaces/IFeatureFlag"
import { Features } from "./Features"

export const FeatureFlags: IFeatureFlag<Features>[] = [
  { feature: Features.PullRequestAgeChart, enabled: false },
  { feature: Features.PullRequestLastUpdatedChart, enabled: false },
  { feature: Features.PullRequestParticipationChart, enabled: false },
  { feature: Features.PullRequestSubmittedChart, enabled: false },
  { feature: Features.OpenPullRequestTable, enabled: false },
  { feature: Features.GitCommitHistory, enabled: false },
]
