import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createCourse, getCourse, updateCourse } from "../services/courseService";
import { useAuth } from "../contexts/useAuth";

function todayInputValue() {
  return new Date().toISOString().split("T")[0];
}

function formatDateInputValue(date: string) {
  return new Date(date).toISOString().split("T")[0];
}

export function CourseForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const isEditing = Boolean(id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(isEditing || authLoading);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCourse() {
      if (!id || authLoading) {
        return;
      }

      try {
        const course = await getCourse(id);

        if (course.creatorId !== user?.id) {
          navigate(`/courses/${course.id}`);
          return;
        }

        if (isMounted) {
          setName(course.name);
          setDescription(course.description || "");
          setStartDate(formatDateInputValue(course.startDate));
          setEndDate(formatDateInputValue(course.endDate));
        }
      } catch {
        if (isMounted) {
          setError("Não foi possível carregar o curso.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCourse();

    return () => {
      isMounted = false;
    };
  }, [id, navigate, user?.id, authLoading]);

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedStartDate = new Date(startDate);
    selectedStartDate.setHours(0, 0, 0, 0);

    if (selectedStartDate < today) {
      setError("A data de início deve ser hoje ou uma data futura.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError("A data de fim deve ser igual ou posterior à data de início.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      if (id) {
        const course = await updateCourse(id, {
          name,
          description,
          startDate,
          endDate,
        });

        navigate(`/courses/${course.id}`);
        return;
      }

      const course = await createCourse({
        name,
        description,
        startDate,
        endDate,
      });

      navigate(`/courses/${course.id}`);
    } catch {
      setError(
        isEditing ? "Não foi possível atualizar o curso." : "Não foi possível criar o curso."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="page">
        <section className="card">
          <p className="meta">Carregando curso...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>{isEditing ? "Editar curso" : "Novo curso"}</h1>
          <p>
            {isEditing
              ? "Atualize as informações principais do curso."
              : "Crie um curso e organize suas aulas em seguida."}
          </p>
        </div>

        <div className="header-actions">
          <Link className="button button-secondary" to={id ? `/courses/${id}` : "/dashboard"}>
            {id ? "Voltar para detalhes" : "Voltar para dashboard"}
          </Link>
        </div>
      </header>

      <section className="card">
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome</label>
            <input
              className="input"
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={3}
              placeholder="Ex.: Node.js Fundamentals"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              className="textarea"
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descreva brevemente o objetivo do curso"
            />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label htmlFor="startDate">Data de início</label>
              <input
                className="input"
                id="startDate"
                type="date"
                min={todayInputValue()}
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">Data de fim</label>
              <input
                className="input"
                id="endDate"
                type="date"
                min={startDate || todayInputValue()}
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="alert">{error}</p>}

          <div className="actions">
            <button className="button" type="submit" disabled={submitting}>
              {submitting
                ? isEditing
                  ? "Salvando..."
                  : "Criando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Criar curso"}
            </button>

            <Link className="button button-secondary" to={id ? `/courses/${id}` : "/dashboard"}>
              Cancelar
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
