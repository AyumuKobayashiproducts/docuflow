import type { ElementType, ReactNode } from "react";

type VisuallyHiddenProps = {
  children: ReactNode;
  as?: ElementType;
};

/**
 * スクリーンリーダー用にテキストを視覚的に隠すコンポーネント
 * アクセシビリティ向上のため、視覚的には見えないが読み上げられる要素に使用
 */
export function VisuallyHidden({
  children,
  as: Component = "span",
}: VisuallyHiddenProps) {
  return (
    <Component
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        borderWidth: 0,
      }}
    >
      {children}
    </Component>
  );
}

