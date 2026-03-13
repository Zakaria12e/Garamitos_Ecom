import { useState } from "react";
import { AppProvider } from "./context/AppContext";
import Header from "./components/layout/Header";

function App() {
  const [count, setCount] = useState(0);

  return (
    <AppProvider>
      <Header />
      <div className="app">
        <h1>React App</h1>
        <p>Counter: {count}</p>
        <button onClick={() => setCount(count + 1)}>
          Increase
        </button>
      </div>
    </AppProvider>
  );
}

export default App;
