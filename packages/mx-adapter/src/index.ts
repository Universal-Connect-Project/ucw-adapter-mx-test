import type { AdapterMap } from "@repo/utils";
import { MxAdapter } from "./adapter";
import { createMxIntGetVC, createMxProdGetVC } from "./createVc";
import type { AdapterDependencies } from "./models";
import { createMxIntDataAdapter, createMxProdDataAdapter } from "./dataAdapter";

export const getMxAdapterMapObject = (dependencies: AdapterDependencies) => {
  return {
    mx: {
      dataAdapter: createMxProdDataAdapter(dependencies),
      testInstitutionAdapterName: "mx_int",
      vcAdapter: createMxProdGetVC(dependencies),
      widgetAdapter: new MxAdapter({
        int: false,
        dependencies,
      }),
    } as AdapterMap,
    mx_int: {
      dataAdapter: createMxIntDataAdapter(dependencies),
      vcAdapter: createMxIntGetVC(dependencies),
      widgetAdapter: new MxAdapter({
        int: true,
        dependencies,
      }),
    } as AdapterMap,
  } as Record<string, AdapterMap>;
};

export * from "./models";