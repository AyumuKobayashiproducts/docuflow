import type { Metadata } from "next";
import Link from "next/link";
import { MarketingSimpleLayout } from "@/components/MarketingSimpleLayout";
import { getPreferredLocale } from "@/lib/serverLocale";

export const metadata: Metadata = {
  title: "サポート | DocuFlow",
  description: "DocuFlowのサポート・お問い合わせ窓口です。",
  alternates: { canonical: "/support" },
};

export default async function SupportPage() {
  const locale = await getPreferredLocale();
  const loginHref = locale === "en" ? "/en/auth/login" : "/auth/login";
  return (
    <MarketingSimpleLayout
      title="サポート"
      description="困ったときはここから。よくある質問とお問い合わせ窓口をまとめています。"
    >
      <h2>お問い合わせ</h2>
      <ul>
        <li>
          メール:{" "}
          <a href="mailto:contact@docuflow.io">
            contact@docuflow.io
          </a>
        </li>
        <li>
          営業:{" "}
          <a href="mailto:sales@docuflow.io">
            sales@docuflow.io
          </a>
        </li>
      </ul>

      <h2>よくある質問</h2>
      <h3>無料トライアルにクレジットカードは必要？</h3>
      <p>不要です。まずは14日間、カード登録なしで試せます。</p>

      <h3>解約はどこから？</h3>
      <p>
        アプリ内の「設定 → 課金」から請求ポータルへ移動できます。{" "}
        <Link href={loginHref}>ログイン</Link>して操作してください。
      </p>

      <h3>セキュリティについて</h3>
      <p>
        監査ログ（<code>activity_logs</code>）や、共有リンクの期限、権限管理（RBAC）などを実装しています。
      </p>

      <h2>法的情報</h2>
      <ul>
        <li>
          <Link href="/terms">利用規約</Link>
        </li>
        <li>
          <Link href="/privacy">プライバシーポリシー</Link>
        </li>
        <li>
          <Link href="/tokusho">特定商取引法に基づく表記</Link>
        </li>
      </ul>
    </MarketingSimpleLayout>
  );
}


