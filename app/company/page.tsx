import type { Metadata } from "next";
import { MarketingSimpleLayout } from "@/components/MarketingSimpleLayout";

export const metadata: Metadata = {
  title: "会社概要 | DocuFlow",
  description: "DocuFlowの運営情報（会社概要）です。",
  alternates: { canonical: "/company" },
};

export default function CompanyPage() {
  return (
    <MarketingSimpleLayout
      title="会社概要"
      description="運営情報のページです。実運用前に必ず貴社情報へ置き換えてください。"
    >
      <p className="text-slate-300">
        ※ 雛形です。法人名・所在地・代表者・連絡先・事業内容などを貴社情報へ差し替えてください。
      </p>

      <h2>会社名</h2>
      <p>DocuFlow（法人名を記載）</p>

      <h2>所在地</h2>
      <p>（住所を記載）</p>

      <h2>代表者</h2>
      <p>（氏名を記載）</p>

      <h2>事業内容</h2>
      <ul>
        <li>AI要約ドキュメントワークスペースの提供</li>
        <li>関連するソフトウェア開発・運用</li>
      </ul>

      <h2>お問い合わせ</h2>
      <p>
        <a href="mailto:contact@docuflow.io">contact@docuflow.io</a>
      </p>
    </MarketingSimpleLayout>
  );
}


