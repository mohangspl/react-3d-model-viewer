import React from "react";

export class ErrorBoundary extends React.Component<
  { onError: (error: string) => void; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    this.props.onError(error?.message || "Unknown error");
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
} 