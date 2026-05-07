import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createCourse } from "../services/courseService";

export function CourseForm() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (name.trim().length < 3) {
      setError("O nome do curso deve ter pelo menos 3 caracteres.");
      return;
    }

    if (!startDate || !endDate) {
      setError("Informe a data de início e a data de fim.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError("A data de fim deve ser igual ou posterior à data de início.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const course = await createCourse({
        name,
        description,
        startDate,
        endDate,
      });

      navigate(`/courses/${course.id}`);
    } catch {
      setError("Não foi possível criar o curso.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <header>
        <h1>Novo curso</h1>
        <Link to="/dashboard">Voltar para dashboard</Link>
      </header>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Nome</label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength={3}
          />
        </div>

        <div>
          <label htmlFor="description">Descrição</label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="startDate">Data de início</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="endDate">Data de fim</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            required
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar curso"}
        </button>
      </form>
    </main>
  );
}
