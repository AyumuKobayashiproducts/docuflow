import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function SecuritySettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Logo />
            <p className="text-sm text-slate-600">セキュリティ設定</p>
          </div>
          <Link
            href="/settings"
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            ← 設定トップへ戻る
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            認証・認可
          </h2>
          <p className="text-xs text-slate-600">
            現在は Supabase Auth によるメール&パスワード認証と、RLS ベースの
            RBAC を採用しています。詳細は{" "}
            <Link
              href="/docs/#/security"
              className="font-medium text-emerald-600 underline-offset-2 hover:underline"
            >
              Security ドキュメント
            </Link>
            を参照してください。
          </p>
        </section>

        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            2段階認証（2FA）
          </h2>
          <p className="text-xs text-slate-600">
            TOTP アプリ（Google Authenticator など）による 2FA
            対応を想定しています。現在は UI の設計のみを行い、実装は今後の拡張として位置付けています。
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-[11px] text-slate-700">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-400 text-[10px] text-white">
              🔒
            </span>
            Coming soon: TOTP ベースの 2段階認証
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            SSO（Single Sign-On）
          </h2>
          <p className="text-xs text-slate-600">
            Google Workspace / Microsoft Entra ID などの IdP と連携した SSO
            対応を想定しています。組織 (`organizations`) 単位で SSO
            を有効化する設計です。
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-[11px] text-slate-700">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-400 text-[10px] text-white">
              🌐
            </span>
            Coming soon: Google Workspace / Entra ID SSO
          </div>
        </section>
      </main>
    </div>
  );
}


