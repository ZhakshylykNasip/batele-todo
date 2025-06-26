import Link from "next/link";
import { LatestPost } from "~/app/_components/post";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] px-4 text-white">
        <div className="container flex flex-col items-center justify-center gap-10 py-16">
          <h1 className="text-center text-5xl font-extrabold tracking-tight sm:text-[4rem]">
            Добро пожаловать в{" "}
            <span className="text-[hsl(280,100%,70%)]">Batele Todo</span>
          </h1>

          <p className="max-w-2xl text-center text-xl text-gray-300">
            {session
              ? "Вы успешно вошли. Ниже показаны последние задачи."
              : "Чтобы пользоваться Todo, пожалуйста, нажмите кнопку «Войти» ниже."}
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href={session ? "/todos" : "/api/auth/signin"}
              className="rounded-full bg-white/10 px-8 py-3 text-lg font-semibold transition hover:bg-white/20"
            >
              {session ? "Перейти к задачам" : "Войти"}
            </Link>

            {!session && (
              <Link
                href="https://github.com/ZhakshylykNasip"
                target="_blank"
                className="rounded-full border border-white/20 px-6 py-3 text-white/80 transition hover:border-white/40 hover:text-white/100"
              >
                Подробнее о проекте
              </Link>
            )}
          </div>

          {hello && (
            <p className="text-md mt-2 text-white/60 italic">
              {hello.greeting}
            </p>
          )}

          {session?.user && (
            <div className="mt-10 w-full max-w-xl">
              <LatestPost />
            </div>
          )}
        </div>
      </main>
    </HydrateClient>
  );
}
