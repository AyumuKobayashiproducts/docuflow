import type { Metadata } from "next";
import { MarketingSimpleLayout } from "@/components/MarketingSimpleLayout";

export const metadata: Metadata = {
  title: "プライバシーポリシー | DocuFlow",
  description: "DocuFlowのプライバシーポリシーです。",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <MarketingSimpleLayout
      title="プライバシーポリシー"
      description="当社は、個人情報の保護を重要な責務と考え、以下の方針に基づき適切に取り扱います。"
    >
      <p className="text-slate-300">
        本ページは雛形です。実運用前に、必ず貴社の実態（収集項目・委託先・国外移転・問い合わせ窓口等）に合わせて調整してください。
      </p>

      <h2>1. 取得する情報</h2>
      <ul>
        <li>アカウント情報（メールアドレス等）</li>
        <li>利用状況（アクセスログ、操作履歴、端末情報等）</li>
        <li>ユーザーがアップロード/入力したコンテンツ（ドキュメント、コメント等）</li>
      </ul>

      <h2>2. 利用目的</h2>
      <ul>
        <li>本サービスの提供、本人確認、アカウント管理</li>
        <li>不正利用の防止、セキュリティ確保</li>
        <li>サービス改善、機能開発、サポート対応</li>
        <li>課金、決済、請求に関する手続き</li>
      </ul>

      <h2>3. 第三者提供</h2>
      <p>
        当社は、法令に基づく場合を除き、本人の同意なく個人情報を第三者に提供しません。
      </p>

      <h2>4. 委託</h2>
      <p>
        当社は、サービス提供に必要な範囲で、クラウドサービス事業者等に業務を委託する場合があります。
      </p>

      <h2>5. 安全管理措置</h2>
      <p>
        当社は、アクセス制御、暗号化、監査ログ等の適切な安全管理措置を講じます。
      </p>

      <h2>6. 開示・訂正・削除等</h2>
      <p>
        本人からの開示、訂正、利用停止等の請求があった場合、本人確認の上、法令に従い対応します。
      </p>

      <h2>7. お問い合わせ</h2>
      <p>
        本ポリシーに関するお問い合わせは <a href="mailto:contact@docuflow.io">contact@docuflow.io</a>{" "}
        までご連絡ください。
      </p>

      <p className="text-sm text-slate-400">最終更新日: 2025-12-16</p>
    </MarketingSimpleLayout>
  );
}


