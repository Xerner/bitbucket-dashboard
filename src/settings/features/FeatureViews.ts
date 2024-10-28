import { IFeatureView } from "../../../repos/common/angular/feature-flags/interfaces/IFeatureView";
import { Features } from "./Features";
import { Views } from "./Views";

export const FeatureViews: IFeatureView<Views, Features>[] = [
  {
    view: Views.GitOnly,
    features: [
      Features.GitCommitHistory
    ]
  },
  {
    view: Views.PullRequests,
    features: [
      Features.OpenPullRequestTable,
      Features.PullRequestAgeChart,
      Features.PullRequestLastUpdatedChart,
      Features.PullRequestParticipationChart,
      Features.PullRequestSubmittedChart,
    ]
  },
  {
    view: Views.PullRequestCharts,
    features: [
      Features.PullRequestAgeChart,
      Features.PullRequestLastUpdatedChart,
      Features.PullRequestParticipationChart,
      Features.PullRequestSubmittedChart,
    ]
  },
  {
    view: Views.OpenPullRequestTable,
    features: [
      Features.OpenPullRequestTable,
    ]
  },
]
