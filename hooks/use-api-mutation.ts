import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { sdk } from "@farcaster/miniapp-sdk";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface UseApiMutationOptions<TData, TVariables>
  extends Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn"> {
  url: string | ((variables: TVariables) => string);
  method?: HttpMethod;
  isProtected?: boolean;
  body?: (variables: TVariables) => unknown;
}

export const useApiMutation = <TData, TVariables = unknown>(
  options: UseApiMutationOptions<TData, TVariables>
) => {
  const {
    url,
    method = "POST",
    isProtected = true,
    ...mutationOptions
  } = options;

  return useMutation<TData, Error, TVariables>({
    ...mutationOptions,
    mutationFn: async (variables) => {
      const resolvedUrl = typeof url === "function" ? url(variables) : url;
      const resolvedBody = options.body ? options.body(variables) : null;
      
      // Use Quick Auth fetch for protected routes, regular fetch for public routes
      const response = isProtected
        ? await sdk.quickAuth.fetch(resolvedUrl, {
            method,
            headers: {
              "Content-Type": "application/json",
            },
            ...(resolvedBody ? { body: JSON.stringify(resolvedBody) } : {}),
          })
        : await fetch(resolvedUrl, {
            method,
            headers: {
              "Content-Type": "application/json",
            },
            ...(resolvedBody ? { body: JSON.stringify(resolvedBody) } : {}),
          });

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        let errorData: any = null;
        try {
          errorData = await response.json();
          if (errorData.error || errorData.message) {
            errorMessage = errorData.error || errorData.message;
          }
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).data = errorData;
        throw error;
      }

      return response.json();
    },
  });
};
