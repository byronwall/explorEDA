import { Component, type ReactNode } from "react";

/**
 * Keeps one chart's failure inside that chart. A host page with several
 * charts keeps the others when one config cannot draw, such as a mistyped
 * `type`. A new config (a new `resetKey`) tries again.
 */
export class ChartErrorBoundary extends Component<
  { resetKey: string; children: ReactNode },
  { error?: Error; key: string }
> {
  state: { error?: Error; key: string } = { key: this.props.resetKey };

  static getDerivedStateFromProps(
    props: { resetKey: string },
    state: { error?: Error; key: string }
  ) {
    return props.resetKey === state.key
      ? null
      : { error: undefined, key: props.resetKey };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <p className="eda-standalone eda-standalone-error" role="alert">
          This chart can't draw: {this.state.error.message}
        </p>
      );
    }
    return this.props.children;
  }
}
