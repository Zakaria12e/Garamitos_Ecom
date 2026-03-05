import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <h1>React App</h1>
      <p>Counter: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increase
      </button>
    </div>
  );
}

export default App;