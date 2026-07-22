const baseURL = import.meta.env.VITE_API_URL;

export type ApiResponse<T> = {
  data: T;
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);

    this.name = "ApiError";

    this.status = status;
    this.code = code;
  }
}

function buildUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${baseURL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResponse<T>> {
  const isFormData = init.body instanceof FormData;

  const response = await fetch(buildUrl(path), {
    credentials: "include",
    ...init,
    headers: {
      Accept: "application/json",
      ...(isFormData
        ? {}
        : init.body
          ? { "Content-Type": "application/json" }
          : {}),
      ...(init.headers ?? {}),
    },
  });

  if (response.status === 204) {
    return { data: undefined as T };
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const error = body as ApiErrorResponse | null;

    throw new ApiError(
      response.status,
      error?.error?.code ?? "UNKNOWN_ERROR",
      error?.error?.message ?? response.statusText,
    );
  }

  return body as ApiResponse<T>;
}

function prepareBody(body: unknown): BodyInit | undefined {
  if (body === undefined) return undefined;

  if (body instanceof FormData) {
    return body;
  }

  return JSON.stringify(body);
}

export const api = {
  get<T>(path: string, init?: Omit<RequestInit, "method" | "body">) {
    return request<T>(path, {
      method: "GET",
      ...init,
    });
  },

  post<T, B = unknown>(
    path: string,
    body?: B,
    init?: Omit<RequestInit, "method" | "body">,
  ) {
    return request<T>(path, {
      method: "POST",
      body: prepareBody(body),
      ...init,
    });
  },

  put<T, B = unknown>(
    path: string,
    body?: B,
    init?: Omit<RequestInit, "method" | "body">,
  ) {
    return request<T>(path, {
      method: "PUT",
      body: prepareBody(body),
      ...init,
    });
  },

  patch<T, B = unknown>(
    path: string,
    body?: B,
    init?: Omit<RequestInit, "method" | "body">,
  ) {
    return request<T>(path, {
      method: "PATCH",
      body: prepareBody(body),
      ...init,
    });
  },

  delete<T>(path: string, init?: Omit<RequestInit, "method" | "body">) {
    return request<T>(path, {
      method: "DELETE",
      ...init,
    });
  },
};