import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
                    <h1 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h1>
                    <p className="mb-6 text-muted-foreground max-w-md">
                        {this.state.error?.message || "An unexpected error occurred."}
                    </p>
                    <Button onClick={() => window.location.reload()}>Reload Page</Button>
                    <Button variant="outline" className="mt-2" onClick={() => window.location.href = "/"}>
                        Go Home
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
