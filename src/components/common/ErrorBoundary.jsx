import React from "react";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-[#fdfbf7] px-4 py-12">
                    <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-red-100 bg-white p-8 text-center shadow-lg">
                        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 text-4xl shadow-inner">
                            ⚠️
                        </div>
                        <h1 className="text-2xl font-black text-gray-900">
                            Something went wrong
                        </h1>
                        <p className="mt-3 text-sm leading-relaxed text-gray-600">
                            An unexpected issue occurred while loading this view. The application caught this error safely so your data remains intact.
                        </p>
                        {this.state.error?.message && (
                            <div className="mt-4 rounded-xl bg-gray-50 p-3 text-left font-mono text-xs text-gray-600 border border-gray-200 overflow-x-auto">
                                {this.state.error.message}
                            </div>
                        )}
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <button
                                onClick={this.handleReload}
                                className="rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 active:scale-[0.98]"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => {
                                    this.handleReset();
                                    window.location.href = "/dashboard";
                                }}
                                className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-[0.98]"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
