import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type DailyCount = {
  date: string;
  count: number;
};

type UserActivity = {
  user_id: string | null;
  count: number;
};

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("docuhub_ai_user_id")?.value ?? null;

  if (!userId) {
    redirect("/auth/login");
  }

  // 直近30日の日別ドキュメント作成数
  const { data: dailyDocs } = await supabase.rpc("get_daily_document_counts_last_30_days", {
    p_user_id: userId,
  });

  // ユーザーごとのアクティビティ数（同一組織内を想定）
  const { data: userActivities } = await supabase.rpc("get_user_activity_counts_last_30_days", {
    p_user_id: userId,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-sm font-semibold text-slate-900">
            チーム利用分析（ベータ）
          </h1>
          <p className="text-xs text-slate-500">
            直近30日の利用状況をざっくり可視化したページです。
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            日別ドキュメント作成数（直近30日）
          </h2>
          {(!dailyDocs || dailyDocs.length === 0) ? (
            <p className="text-xs text-slate-500">
              まだ直近30日に作成されたドキュメントがありません。
            </p>
          ) : (
            <ul className="space-y-1 text-xs text-slate-700">
              {(dailyDocs as DailyCount[]).map((row) => (
                <li key={row.date} className="flex items-center gap-2">
                  <span className="w-20 text-slate-500">{row.date}</span>
                  <div className="relative h-2 flex-1 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(100, row.count * 10)}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="w-8 text-right text-slate-600">
                    {row.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            ユーザー別アクティビティ数（直近30日）
          </h2>
          {(!userActivities || userActivities.length === 0) ? (
            <p className="text-xs text-slate-500">
              まだアクティビティデータが十分にありません。
            </p>
          ) : (
            <table className="w-full table-fixed text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2">User</th>
                  <th className="py-2 w-32 text-right">Activity Count</th>
                </tr>
              </thead>
              <tbody>
                {(userActivities as UserActivity[]).map((row) => (
                  <tr key={row.user_id ?? "unknown"} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-2">
                      {row.user_id === userId ? (
                        <span className="font-medium text-emerald-600">あなた</span>
                      ) : (
                        <span className="text-slate-700">
                          ユーザー {row.user_id?.slice(0, 8) ?? "unknown"}
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-right text-slate-700">
                      {row.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}


