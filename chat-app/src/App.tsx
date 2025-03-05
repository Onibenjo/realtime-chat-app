import { Routes, Route, Navigate } from "react-router";
import { Login } from "./components/Login";
import { CookiesProvider, useCookies } from "react-cookie";
import ChatInterface from "./components/ChatInterface";

function App() {
  const [cookies] = useCookies(["user"]);

  const username = cookies.user;

  return (
    <CookiesProvider>
      <Routes>
        <Route
          path="/"
          element={username ? <Navigate to="/chats" /> : <Login />}
        />
        <Route
          path="/chats"
          element={
            username ? (
              <ChatInterface username={username} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </CookiesProvider>
  );
}

export default App;
