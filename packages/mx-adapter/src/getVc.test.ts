import { http, HttpResponse } from "msw";
import axios from "mx-platform-node/node_modules/axios";

import { getVC } from "./getVc";
import type { AdapterDependencies } from "./models";

import {
  MX_INTEGRATION_VC_GET_ACCOUNTS_PATH,
  MX_VC_GET_ACCOUNTS_PATH,
} from "./test/handlers";
import { mxVcAccountsData } from "./test/testData/mxVcData";
import { server } from "./test/testServer";

import { aggregatorCredentials } from "./test/testData/aggregatorCredentials";
import { createClient } from "./test/utils/cacheClient";
import { logClient } from "./test/utils/logClient";

const accountsPath = "users/userId/members/connectionId/accounts";

const dependencies: AdapterDependencies = {
  logClient,
  cacheClient: createClient(),
  aggregatorCredentials,
  envConfig: {
    HOSTURL: undefined,
  },
};

describe("mx vc", () => {
  describe("MxVcClient", () => {
    it("makes a request with the prod configuration and authorization and returns the verifiable credential", async () => {
      let auth;

      server.use(
        http.get(MX_VC_GET_ACCOUNTS_PATH, ({ request }) => {
          auth = request.headers.get("Authorization");
          return HttpResponse.json({ verifiableCredential: mxVcAccountsData });
        }),
      );

      const response = await getVC(accountsPath, true, dependencies);

      expect(response).toEqual(mxVcAccountsData);

      expect(auth).toEqual(
        "Basic " +
          Buffer.from(
            aggregatorCredentials.mxProd.username +
              ":" +
              aggregatorCredentials.mxProd.password,
          ).toString("base64"),
      );
    });

    it("makes a request with the integration configuration and authorization", async () => {
      let auth;

      server.use(
        http.get(MX_INTEGRATION_VC_GET_ACCOUNTS_PATH, ({ request }) => {
          auth = request.headers.get("Authorization");
          return HttpResponse.json({ verifiableCredential: mxVcAccountsData });
        }),
      );

      const response = await getVC(accountsPath, false, dependencies);

      expect(response).toEqual(mxVcAccountsData);

      expect(auth).toEqual(
        "Basic " +
          Buffer.from(
            aggregatorCredentials.mxInt.username +
              ":" +
              aggregatorCredentials.mxInt.password,
          ).toString("base64"),
      );
    });

    it("throws an error on request failure", async () => {
      server.use(
        http.get(
          MX_VC_GET_ACCOUNTS_PATH,
          () => new HttpResponse(null, { status: 400 }),
        ),
      );

      await expect(
        async () => await getVC(accountsPath, true, dependencies),
      ).rejects.toThrow();
    });

    it("doesn't configure axios proxy when PROXY_HOST is not defined", async () => {
      const axiosCreateSpy = jest.spyOn(axios, "create");

      server.use(
        http.get(
          MX_VC_GET_ACCOUNTS_PATH,
          () => new HttpResponse(null, { status: 400 }),
        ),
      );

      await expect(
        async () => await getVC(accountsPath, true, dependencies),
      ).rejects.toThrow();

      expect(axiosCreateSpy).not.toHaveBeenCalled();
    });

    const mockEnvConfigWithProxy = {
      PROXY_HOST: "fakehost.server.com",
      PROXY_PORT: "80",
      PROXY_USERNAME: "username",
      PROXY_PASSWORD: "password",
    };

    it("configures axios to use proxy server when PROXY_HOST is defined", async () => {
      const axiosCreateSpy = jest.spyOn(axios, "create");

      server.use(
        http.get(MX_VC_GET_ACCOUNTS_PATH, ({ request }) => {
          request.headers.get("Authorization");
          return HttpResponse.json({ verifiableCredential: mxVcAccountsData });
        }),
      );

      // Expected to fail because the proxy is fake
      await expect(
        async () =>
          await getVC(accountsPath, true, {
            ...dependencies,
            envConfig: mockEnvConfigWithProxy,
          }),
      ).rejects.toThrow();

      expect(axiosCreateSpy).toHaveBeenCalledWith({
        proxy: {
          host: mockEnvConfigWithProxy.PROXY_HOST,
          port: parseInt(mockEnvConfigWithProxy.PROXY_PORT),
          auth: {
            username: mockEnvConfigWithProxy.PROXY_USERNAME,
            password: mockEnvConfigWithProxy.PROXY_PASSWORD,
          },
        },
      });
    });
  });
});
