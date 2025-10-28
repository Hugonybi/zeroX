export type HttpClient = {
	request<TResponse>(path: string, init?: RequestInit): Promise<TResponse>;
	get<TResponse>(path: string, init?: RequestInit): Promise<TResponse>;
	post<TResponse>(path: string, body?: unknown, init?: RequestInit): Promise<TResponse>;
	put<TResponse>(path: string, body?: unknown, init?: RequestInit): Promise<TResponse>;
	patch<TResponse>(path: string, body?: unknown, init?: RequestInit): Promise<TResponse>;
	delete<TResponse>(path: string, init?: RequestInit): Promise<TResponse>;
};

export type AuthTokenProvider = () => string | null | undefined | Promise<string | null | undefined>;

export type HttpClientOptions = {
	baseHeaders?: HeadersInit;
	getAuthToken?: AuthTokenProvider;
	onRequest?: (input: RequestInfo | URL, init: RequestInit) => void;
	onResponse?: (response: Response) => void;
};

export class HttpError extends Error {
	public readonly status: number;
	public readonly statusText: string;
	public readonly body: unknown;

	constructor(message: string, status: number, statusText: string, body: unknown) {
		super(message);
		this.name = "HttpError";
		this.status = status;
		this.statusText = statusText;
		this.body = body;
	}
}

export function createHttpClient(baseUrl: string, options: HttpClientOptions = {}): HttpClient {
	if (!baseUrl) {
		throw new Error("Expected a baseUrl when creating the HTTP client.");
	}

	const trimmedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

	const resolveJson = async (response: Response) => {
		const contentType = response.headers.get("content-type");
		if (contentType && contentType.includes("application/json")) {
			try {
				return await response.json();
			} catch (error) {
				// Fall through to return undefined when parsing fails (e.g. empty body)
				console.warn("Failed to parse JSON response", error);
			}
		}
		return undefined;
	};

	const buildHeaders = async (initial?: HeadersInit) => {
		const headers = new Headers(options.baseHeaders ?? {});
		if (initial) {
			new Headers(initial).forEach((value, key) => {
				headers.set(key, value);
			});
		}

		// For cookie-based auth, we don't need to set Authorization header
		// The browser will automatically send cookies with credentials: 'include'

		return headers;
	};

	const prepareBody = (body: unknown, headers: Headers): BodyInit => {
		if (
			body instanceof FormData ||
			body instanceof Blob ||
			body instanceof ArrayBuffer ||
			body instanceof URLSearchParams ||
			(typeof ReadableStream !== "undefined" && body instanceof ReadableStream)
		) {
			return body;
		}

		if (typeof body === "string") {
			if (!headers.has("content-type")) {
				headers.set("content-type", "text/plain;charset=UTF-8");
			}
			return body;
		}

		if (!headers.has("content-type")) {
			headers.set("content-type", "application/json");
		}

		return JSON.stringify(body);
	};

		const send = async <TResponse>(method: string, path: string, body?: unknown, init: RequestInit = {}) => {
			const headers = await buildHeaders(init.headers);
			if (!headers.has("accept")) {
				headers.set("accept", "application/json");
			}

			let finalBody = init.body ?? undefined;
			if (body !== undefined) {
				finalBody = prepareBody(body, headers);
			}

			const requestInit: RequestInit = {
				...init,
				method,
				headers,
				body: finalBody,
				credentials: 'include', // Include cookies in requests
			};

			const url = `${trimmedBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;

			options.onRequest?.(url, requestInit);

			let response = await fetch(url, requestInit);

			// Handle 401 - try to refresh token once
			if (response.status === 401) {
				try {
					// Attempt to refresh the session
					await fetch(`${trimmedBaseUrl}/auth/refresh`, {
						method: 'POST',
						credentials: 'include',
					});
					// Retry the original request
					response = await fetch(url, requestInit);
				} catch (refreshError) {
					// Refresh failed, continue with original 401 response
					console.warn('Token refresh failed:', refreshError);
				}
			}

			options.onResponse?.(response);

			if (!response.ok) {
				const errorBody = await resolveJson(response);
				throw new HttpError("Request failed", response.status, response.statusText, errorBody);
			}

			if (response.status === 204) {
				return undefined as TResponse;
			}

			const data = await resolveJson(response);
			return data as TResponse;
		};	return {
		request: <TResponse>(path: string, init?: RequestInit) => send<TResponse>(init?.method ?? "GET", path, undefined, init),
		get: <TResponse>(path: string, init?: RequestInit) => send<TResponse>("GET", path, undefined, init),
		post: <TResponse>(path: string, body?: unknown, init?: RequestInit) => send<TResponse>("POST", path, body, init),
		put: <TResponse>(path: string, body?: unknown, init?: RequestInit) => send<TResponse>("PUT", path, body, init),
		patch: <TResponse>(path: string, body?: unknown, init?: RequestInit) => send<TResponse>("PATCH", path, body, init),
		delete: <TResponse>(path: string, init?: RequestInit) => send<TResponse>("DELETE", path, undefined, init),
	};
}
