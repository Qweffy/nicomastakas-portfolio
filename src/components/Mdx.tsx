import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import * as runtime from "react/jsx-runtime";

type AnchorEl = ReactElement<{ href?: string; children?: ReactNode }>;

function isAnchor(node: ReactNode): node is AnchorEl {
  return isValidElement(node) && node.type === "a";
}

/**
 * Paragraphs that contain nothing but links (the case-study "Live + source"
 * lines) render as a row of design-system buttons instead of inline text links.
 * The first link is the primary CTA; the rest are ghost. Everything else stays a
 * normal paragraph.
 */
function MdxParagraph({ children }: { children?: ReactNode }) {
  const nodes = Children.toArray(children);
  const anchors = nodes.filter(isAnchor);
  const isCtaRow =
    anchors.length > 0 &&
    nodes.every((n) => isAnchor(n) || (typeof n === "string" && /^[\s·]*$/u.test(n)));

  if (!isCtaRow) return <p>{children}</p>;

  return (
    <div className="nm-cta">
      {anchors.map((a, i) => (
        <a
          key={a.props.href ?? i}
          href={a.props.href}
          className={`nm-btn nm-btn--${i === 0 ? "primary" : "ghost"} nm-btn--lg nm-focusable`}
        >
          {a.props.children}
        </a>
      ))}
    </div>
  );
}

const mdxComponents = { p: MdxParagraph };

/**
 * Renders Velite-compiled MDX. `s.mdx()` emits a function body that, given the
 * jsx runtime, returns the component module. This is the standard Velite render
 * path; it runs at the server/build layer (these pages are fully static).
 */
export function Mdx({ code }: { code: string }) {
  const factory = new Function(code) as (rt: typeof runtime) => {
    default: (props: Record<string, unknown>) => ReactNode;
  };
  const Content = factory({ ...runtime }).default;
  return <Content components={mdxComponents} />;
}
