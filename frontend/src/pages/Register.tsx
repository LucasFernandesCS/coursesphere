import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      await register({
        name,
        email,
        password,
      });

      navigate("/dashboard");
    } catch {
      setError("Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>CourseSphere</h1>
      <h2>Criar conta</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Nome</label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>

      <p>
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </main>
  );
}
