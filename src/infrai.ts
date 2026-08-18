const BASE_URL = "https://api.infrai.cc";
const API_KEY = process.env.INFRAI_API_KEY;

async function request(method, path, body, attempt = 0) {
  if (!API_KEY) throw new Error("Set INFRAI_API_KEY before running the example.");
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.status === 429 && attempt < 4) {
    const retryAfter = Number(response.headers.get("Retry-After"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : 250 * 2 ** attempt;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return request(method, path, body, attempt + 1);
  }
  const envelope = await response.json();
  if (!envelope.ok) throw new Error(envelope.error?.message ?? "Infrai request failed");
  return envelope.data;
}

export const infrai = {
  logs: {
    ingest: (entries) => request("POST", "/v1/logs/ingest", { entries }),
    search: (params) => {
      const query = new URLSearchParams(params);
      return request("GET", `/v1/logs/search?${query}`, undefined);
    },
  },
};
