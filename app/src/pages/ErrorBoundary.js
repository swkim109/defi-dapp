import React, { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hasError: false,
            errorMsg: ''
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, errorMsg: error.toString() };
    }

    componentDidCatch(error) {
        console.error(error.toString());
    }

    render() {

        if (this.state.hasError) {
            return (
                <h1>ERROR!</h1>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
