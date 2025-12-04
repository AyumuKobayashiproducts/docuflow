import { describe, expect, it } from "vitest";
import {
  filterDocuments,
  type FilterableDocument as Document,
} from "../lib/filterDocuments";

const baseDoc = (overrides: Partial<Document>): Document => ({
  id: "1",
  title: "サンプル",
  category: "メモ",
  raw_content: "本文",
  summary: "要約",
  tags: ["タグ"],
  created_at: new Date().toISOString(),
  user_id: "user-1",
  is_favorite: false,
  is_pinned: false,
  ...overrides,
});

describe("filterDocuments", () => {
  describe("基本フィルタリング", () => {
    it("空のクエリとカテゴリのときは全件返す", () => {
      const docs: Document[] = [
        baseDoc({ id: "1", title: "A" }),
        baseDoc({ id: "2", title: "B" }),
      ];

      const result = filterDocuments(docs, "", "");
      expect(result).toHaveLength(2);
    });

    it("タイトルでフィルタできる", () => {
      const docs: Document[] = [
        baseDoc({ id: "1", title: "Next.js 入門" }),
        baseDoc({ id: "2", title: "React メモ" }),
      ];

      const result = filterDocuments(docs, "next.js", "");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("タグでフィルタできる", () => {
      const docs: Document[] = [
        baseDoc({ id: "1", tags: ["設計", "API"] }),
        baseDoc({ id: "2", tags: ["デザイン"] }),
      ];

      const result = filterDocuments(docs, "api", "");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("カテゴリでフィルタできる", () => {
      const docs: Document[] = [
        baseDoc({ id: "1", category: "議事録" }),
        baseDoc({ id: "2", category: "仕様書" }),
      ];

      const result = filterDocuments(docs, "", "議事録");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("全文検索とカテゴリを組み合わせてフィルタできる", () => {
      const docs: Document[] = [
        baseDoc({
          id: "1",
          title: "API 設計",
          category: "仕様書",
          raw_content: "ユーザー登録のAPI仕様です。",
        }),
        baseDoc({
          id: "2",
          title: "議事録",
          category: "議事録",
          raw_content: "MTGのメモです。",
        }),
      ];

      const result = filterDocuments(docs, "api", "仕様書");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("要約でフィルタできる", () => {
      const docs: Document[] = [
        baseDoc({ id: "1", summary: "AIを使った要約機能" }),
        baseDoc({ id: "2", summary: "データベース設計" }),
      ];

      const result = filterDocuments(docs, "AI", "");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("大文字小文字を区別しない検索ができる", () => {
      const docs: Document[] = [
        baseDoc({ id: "1", title: "NEXT.JS 入門" }),
        baseDoc({ id: "2", title: "react メモ" }),
      ];

      const result = filterDocuments(docs, "Next.js", "");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });
  });

  describe("お気に入り・ピン留めフィルタ", () => {
    it("お気に入りのみフィルタできる", () => {
      const docs: Document[] = [
        baseDoc({ id: "1", is_favorite: true }),
        baseDoc({ id: "2", is_favorite: false }),
        baseDoc({ id: "3", is_favorite: true }),
      ];

      const result = filterDocuments(docs, "", "", true, false);
      expect(result).toHaveLength(2);
      expect(result.map((d) => d.id)).toEqual(["1", "3"]);
    });

    it("ピン留めのみフィルタできる", () => {
      const docs: Document[] = [
        baseDoc({ id: "1", is_pinned: false }),
        baseDoc({ id: "2", is_pinned: true }),
        baseDoc({ id: "3", is_pinned: true }),
      ];

      const result = filterDocuments(docs, "", "", false, true);
      expect(result).toHaveLength(2);
      expect(result.map((d) => d.id)).toEqual(["2", "3"]);
    });

    it("お気に入りとピン留めの両方でフィルタできる", () => {
      const docs: Document[] = [
        baseDoc({ id: "1", is_favorite: true, is_pinned: true }),
        baseDoc({ id: "2", is_favorite: true, is_pinned: false }),
        baseDoc({ id: "3", is_favorite: false, is_pinned: true }),
        baseDoc({ id: "4", is_favorite: false, is_pinned: false }),
      ];

      const result = filterDocuments(docs, "", "", true, true);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("テキスト検索とお気に入りを組み合わせてフィルタできる", () => {
      const docs: Document[] = [
        baseDoc({ id: "1", title: "API設計", is_favorite: true }),
        baseDoc({ id: "2", title: "API仕様", is_favorite: false }),
        baseDoc({ id: "3", title: "DB設計", is_favorite: true }),
      ];

      const result = filterDocuments(docs, "API", "", true, false);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });
  });

  describe("エッジケース", () => {
    it("空のドキュメント配列を渡すと空配列を返す", () => {
      const result = filterDocuments([], "test", "");
      expect(result).toHaveLength(0);
    });

    it("undefinedのクエリでも動作する", () => {
      const docs: Document[] = [baseDoc({ id: "1" })];
      const result = filterDocuments(docs, undefined, undefined);
      expect(result).toHaveLength(1);
    });

    it("nullのタグでも動作する", () => {
      const docs: Document[] = [
        baseDoc({ id: "1", tags: null }),
        baseDoc({ id: "2", tags: ["タグ"] }),
      ];

      const result = filterDocuments(docs, "タグ", "");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    it("nullのsummaryやraw_contentでも動作する", () => {
      const docs: Document[] = [
        baseDoc({ id: "1", summary: null, raw_content: null, title: "テスト" }),
      ];

      const result = filterDocuments(docs, "テスト", "");
      expect(result).toHaveLength(1);
    });

    it("空白のみのクエリは無視される", () => {
      const docs: Document[] = [
        baseDoc({ id: "1" }),
        baseDoc({ id: "2" }),
      ];

      const result = filterDocuments(docs, "   ", "");
      expect(result).toHaveLength(2);
    });

    it("空白のみのカテゴリは無視される", () => {
      const docs: Document[] = [
        baseDoc({ id: "1", category: "メモ" }),
        baseDoc({ id: "2", category: "議事録" }),
      ];

      const result = filterDocuments(docs, "", "   ");
      expect(result).toHaveLength(2);
    });
  });
});
