"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowserClient";
import { Logo } from "@/components/Logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    const { data, error: signInError } =
      await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      });

    setLoading(false);

    if (signInError) {
      setError("メールアドレスまたはパスワードが正しくありません。");
      return;
    }

    document.cookie = "docuhub_ai_auth=1; path=/;";

    const userId = data.user?.id;
    if (userId) {
      document.cookie = `docuhub_ai_user_id=${userId}; path=/;`;
    }

    setStatus("ログインしました。");

    const redirectTo = searchParams.get("redirectTo") || "/app";
    router.replace(redirectTo);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setStatus(null);
    setOauthLoading(true);

    try {
      const redirectToParam = searchParams.get("redirectTo") || "/app";
      const callbackUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(
              redirectToParam
            )}`
          : undefined;

      const { error: signInError } =
        await supabaseBrowser.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: callbackUrl,
          },
        });

      if (signInError) {
        console.error("Google login error:", signInError);
        setError(
          "Google ログインに失敗しました。少し時間をおいてからもう一度お試しください。"
        );
        setOauthLoading(false);
      }
      // 成功時は Supabase 側でリダイレクトされる
    } catch (e) {
      console.error("Google login unexpected error:", e);
      setError(
        "Google ログイン中に問題が発生しました。もう一度お試しください。"
      );
      setOauthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-sky-500 to-violet-600 animate-gradient" />
        
        {/* Mesh Pattern Overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 0%, transparent 50%)`
          }} />
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/20 rounded-full animate-spin-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] border border-white/10 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '20s' }} />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-xl font-bold text-white shadow-lg">
                DF
              </div>
              <span className="text-3xl font-bold text-white">DocuFlow</span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              AI が文書を<br />
              <span className="text-white/90">一瞬で整理</span>
            </h1>
            
            <p className="text-lg text-white/80 mb-10 max-w-md leading-relaxed">
              PDF・Word ファイルをアップロードするだけ。
              GPT-4 が内容を要約し、タグを自動生成。
              スマートなドキュメント管理を実現します。
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              {["AI 自動要約", "スマートタグ", "全文検索", "共有リンク"].map((feature, i) => (
                <span 
                  key={feature}
                  className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium text-white border border-white/20 animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
          
          {/* Testimonial */}
          <div className="mt-16 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 animate-fade-in-up stagger-4">
            <p className="text-white/90 italic mb-4">
              &ldquo;議事録や仕様書の整理が劇的に楽になりました。
              AI 要約のおかげで必要な情報にすぐアクセスできます。&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-sm">
                K
              </div>
              <div>
                <p className="text-white font-medium text-sm">Kenta Yamamoto</p>
                <p className="text-white/60 text-xs">Product Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
        {/* Mobile Header */}
        <header className="lg:hidden px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <Logo />
        </header>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Welcome */}
            <div className="text-center mb-10 animate-fade-in-up">
              <div className="lg:hidden flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-sky-500 to-violet-500 text-2xl font-bold text-white shadow-xl">
                  DF
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                おかえりなさい
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                アカウントにログインして続けましょう
              </p>
            </div>

            {/* Alerts */}
            {status && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300 animate-fade-in-scale border border-emerald-200 dark:border-emerald-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-800">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-medium">{status}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-300 animate-shake border border-red-200 dark:border-red-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-800">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5 animate-fade-in-up stagger-2">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  メールアドレス
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input pl-12 h-12"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  パスワード
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pl-12 pr-12 h-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded-md border-slate-300 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                    ログイン状態を保持
                  </span>
                </label>
                <Link
                  href="/auth/forgot"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                >
                  パスワードを忘れた？
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full h-12 text-base font-semibold relative overflow-hidden group"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>ログイン中...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>ログイン</span>
                    <svg className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="divider my-8">または</div>

            {/* Social Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={oauthLoading}
              className="btn btn-secondary w-full h-12 mb-4 flex items-center justify-center gap-2"
            >
              {oauthLoading ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Google でログイン中...</span>
                </>
              ) : (
                <>
                  {/* 簡易Googleアイコン（4色のG） */}
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
                    <span className="text-[11px] font-bold text-slate-800">
                      G
                    </span>
                  </span>
                  <span>Google でログイン</span>
                </>
              )}
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              アカウントをお持ちでないですか？{" "}
              <Link
                href="/auth/signup"
                className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors underline-offset-2 hover:underline"
              >
                新規登録
              </Link>
            </p>

            {/* Trust Badges */}
            <div className="mt-10 flex items-center justify-center gap-6 text-slate-400 animate-fade-in stagger-6">
              <div className="flex items-center gap-1.5 text-xs">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>SSL暗号化</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>安全なログイン</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-center text-xs text-slate-500 dark:text-slate-500">
            © 2024 DocuFlow. AI 要約で、PDF / Word 資料を一瞬で整理
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-sky-500 to-violet-500 text-2xl font-bold text-white shadow-xl animate-pulse">
              DF
            </div>
            <div className="h-1.5 w-32 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-emerald-500 rounded-full animate-shimmer" />
            </div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
