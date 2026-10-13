import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";
import { testTiming } from "@repo/test-config";

configure({ asyncUtilTimeout: testTiming.waitMs });
