import { Suspense, useEffect, useState } from "react";
import { store } from "./store";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { ErrorBoundary } from "./components/ErrorBoundry";
import { Layout } from "./Layout/Layout";
import "./index.scss";
import "ag-grid-community/styles/ag-grid.css";
import "react-toastify/dist/ReactToastify.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import AppInitializer from "./AppInitializer";
import { isUserLoggedIn } from "./utils/auth";
import { showToastMessage } from "./utils/helpers";
import { setupSessionTimeout } from "./utils/SessionTimeOutManager";
import { axiosInstance } from "./utils/axios";

const OurFallbackComponent = ({
  error,
  componentStack,
  resetErrorBoundary,
}: any) => (
  <div>
    <h1>
      An error occurred:
      {error.message}
    </h1>
    <h1>
      An error occurred:
      {componentStack}
    </h1>
    <button type="button" onClick={resetErrorBoundary}>
      Try again
    </button>
  </div>
);

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const isLoggedIn = () => {
    return isUserLoggedIn();
  };

  useEffect(() => {
    const handleLogout = async () => {
      if (isLoggedIn()) {
        await  axiosInstance.post('/logout')
        showToastMessage("Session Time Out", "success");
        localStorage.removeItem('auth-user');
        localStorage.removeItem('user-token');
        window.location.reload();
      }
    };

    const cleanup = setupSessionTimeout(handleLogout);

    return () => {
      cleanup();
    };
  }, []);
  return (
    <div>
      <Provider store={store}>
      <ErrorBoundary FallbackComponent={OurFallbackComponent}>
        <AppInitializer onInitialized={() => setIsInitialized(true)}>
            <Suspense fallback={<h1 className="lazy-loading"> Loading....</h1>}>
              {isInitialized && <Layout />}
            </Suspense>
            <ToastContainer />
        </AppInitializer>
        </ErrorBoundary>
      </Provider>
    </div>
  );
};

export default App;
