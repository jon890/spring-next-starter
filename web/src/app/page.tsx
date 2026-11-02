import { connection } from "next/server";
import { Suspense } from "react";
import { fetchSystemInfo } from "@/lib/backend";

// backend 연결을 보여 주는 예시 화면이다. 새 화면을 만들 때 지우거나 바꿔도 된다.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-24">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Spring Boot + Next.js starter
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Edit <code className="font-mono">web/src/app/page.tsx</code> to start
          building.
        </p>
      </header>
      <section className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="mb-3 text-lg font-medium">Backend</h2>
        <Suspense fallback={<p>Checking the backend…</p>}>
          <BackendStatus />
        </Suspense>
      </section>
    </main>
  );
}

async function BackendStatus() {
  // 요청마다 backend 를 다시 부른다. 빌드 때 미리 그리지 않는다.
  await connection();
  const info = await fetchSystemInfo();
  if (info === null) {
    return (
      <p data-testid="backend-status" className="text-red-600">
        Not connected. Start the backend and reload this page.
      </p>
    );
  }
  return (
    <p
      data-testid="backend-status"
      className="text-green-700 dark:text-green-400"
    >
      Connected to <strong>{info.application}</strong> (server time{" "}
      {info.serverTime})
    </p>
  );
}
