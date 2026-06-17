import type { ReactNode } from "react";
import * as runtime from "react/jsx-runtime";

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
  return <Content />;
}
