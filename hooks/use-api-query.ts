import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { sdk } from "@farcaster/miniapp-sdk";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface UseApiQueryOptions<TData, TBody = unknown>
  extends Omit<UseQueryOptions<TData>, "queryFn"> {
  url: string;
  method?: HttpMethod;
  body?: TBody;
  isProtected?: boolean;
  enabled?: boolean;
}

export const useApiQuery = <TData, TBody = unknown>(
  options: UseApiQueryOptions<TData, TBody>
) => {
  const {
    url,
    method = "GET",
    body,
    isProtected = false,
    enabled = true,
    ...queryOptions
  } = options;

  return useQuery<TData>({
    ...queryOptions,
    queryFn: async () => {
      // Use Quick Auth fetch for protected routes, regular fetch for public routes
      const response = isProtected
        ? await sdk.quickAuth.fetch(url, {
            method,
            headers: {
              ...(body && { "Content-Type": "application/json" }),
            },
            ...(body && { body: JSON.stringify(body) }),
          })
        : await fetch(url, {
            method,
            headers: {
              ...(body && { "Content-Type": "application/json" }),
            },
            ...(body && { body: JSON.stringify(body) }),
          });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return response.json();
    },
  });
};
