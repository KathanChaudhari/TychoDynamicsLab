import {
    Component,
  } from "react";
  
  import ErrorFallback from "./ErrorFallback.jsx";
  
  export default class AppErrorBoundary extends Component {
    constructor(props) {
      super(props);
  
      this.state = {
        error: null,
        resetKey: 0,
      };
    }
  
    static getDerivedStateFromError(
      error
    ) {
      return {
        error,
      };
    }
  
    componentDidCatch(
      error,
      errorInfo
    ) {
      console.error(
        "React application error:",
        error,
        errorInfo
      );
    }
  
    handleRetry = () => {
      this.setState(
        (current) => ({
          error: null,
          resetKey:
            current.resetKey + 1,
        })
      );
    };
  
    render() {
      const {
        error,
        resetKey,
      } = this.state;
  
      if (error) {
        return (
          <ErrorFallback
            title="Interface failure"
            message="The simulation interface stopped unexpectedly. You can try rebuilding the interface or reload the page."
            error={error}
            onRetry={
              this.handleRetry
            }
          />
        );
      }
  
      return (
        <div key={resetKey}>
          {this.props.children}
        </div>
      );
    }
  }