import { useAuth } from "../contexts/useAuth";

export function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <main>
      <h1>Dashboard</h1>

      <p>Bem-vindo, {user?.name}</p>

      <button type="button" onClick={logout}>
        Sair
      </button>
    </main>
  );
}
