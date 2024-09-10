import { Feature } from "./Feature";
import { FeatureGroup } from "./FeatureGroup";

export const Views: Record<FeatureGroup, Feature[]> = {
  [FeatureGroup.GitOnly]: [
    Feature.GitCommitHistory
  ],
  [FeatureGroup.PullRequests]: [
    Feature.OpenPullRequestTable,
    Feature.PullRequestAgeChart,
    Feature.PullRequestLastUpdatedChart,
    Feature.PullRequestParticipationChart,
    Feature.PullRequestSubmittedChart,
  ],
  [FeatureGroup.PullRequestCharts]: [
    Feature.PullRequestAgeChart,
    Feature.PullRequestLastUpdatedChart,
    Feature.PullRequestParticipationChart,
    Feature.PullRequestSubmittedChart,
  ],
  [FeatureGroup.OpenPullRequestTable]: [
    Feature.OpenPullRequestTable,
  ],
}
