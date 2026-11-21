import React from "react";

type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="mx-auto mt-24 max-w-md rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-glow">
        <h1 className="font-display text-xl text-ink">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-600">
          An unexpected error occurred. Reloading usually fixes it.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Reload page
        </button>
      </div>
    );
  }
}
