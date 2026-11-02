// backend 를 부르는 서버 전용 도우미다. 브라우저에서 직접 부르지 않으므로 CORS 설정이 필요 없다.
import "server-only";

export type SystemInfo = {
  application: string;
  serverTime: string;
};

// 주소는 실행 환경에서 받는다. 값이 없거나 비었으면 로컬에서 띄운 backend 를 부른다.
function backendUrl(): string {
  return process.env.BACKEND_URL || "http://localhost:8080";
}

export async function fetchSystemInfo(): Promise<SystemInfo | null> {
  try {
    const response = await fetch(`${backendUrl()}/api/system/info`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as SystemInfo;
  } catch {
    return null;
  }
}
