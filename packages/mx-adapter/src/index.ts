import type { AdapterMap } from "@repo/utils";
import { MxAdapter } from "./adapter";
import { createMxIntGetVC, createMxProdGetVC } from "./createVc";
import type { AdapterDependencies } from "./models";
import { createMxIntDataAdapter, createMxProdDataAdapter } from "./dataAdapter";

export const getMxAdapterMapObject = (dependencies: AdapterDependencies) => {
  const depsInt = {
    ...dependencies,
    aggregatorCredentials: {
      mxInt: {
        ...dependencies.aggregatorCredentials.mxInt,
        basePath: "https://int-api.mx.com",
        vcEndpoint: "https://int-api.mx.com/",
      },
    },
  };

  const depsProd = {
    ...dependencies,
    aggregatorCredentials: {
      mxProd: {
        ...dependencies.aggregatorCredentials.mxProd,
        basePath: "https://api.mx.com",
        vcEndpoint: "https://api.mx.com/",
      },
    },
  };

  return {
    mx: {
      dataAdapter: createMxProdDataAdapter(depsProd),
      testInstitutionAdapterName: "mx_int",
      vcAdapter: createMxProdGetVC(depsProd),
      widgetAdapter: new MxAdapter({
        int: false,
        dependencies: depsProd,
      }),
    } as AdapterMap,
    mx_int: {
      dataAdapter: createMxIntDataAdapter(depsInt),
      vcAdapter: createMxIntGetVC(depsInt),
      widgetAdapter: new MxAdapter({
        int: true,
        dependencies: depsInt,
      }),
    } as AdapterMap,
  } as Record<string, AdapterMap>;
};

export * from "./models";
