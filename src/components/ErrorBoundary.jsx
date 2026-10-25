import { Component } from 'react';

/** Keeps a failing optional widget (3D, chat…) from taking the whole page down. */
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { if (import.meta.env.DEV) console.error(error); }
  render() { return this.state.failed ? (this.props.fallback ?? null) : this.props.children; }
}
