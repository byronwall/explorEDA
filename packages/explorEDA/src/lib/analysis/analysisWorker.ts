import { handleAnalysisWorkerRequest } from "./analysisWorkerProtocol";
import type {
  AnalysisWorkerRequest,
  AnalysisWorkerResponse,
} from "./analysisWorkerProtocol";

const tables: Record<
  string,
  import("@/types/AnalysisProject").AnalysisSourceRow[]
> = {};

self.onmessage = (event: MessageEvent<AnalysisWorkerRequest>) => {
  const response = handleAnalysisWorkerRequest(event.data, tables);
  if (response) self.postMessage(response satisfies AnalysisWorkerResponse);
};
