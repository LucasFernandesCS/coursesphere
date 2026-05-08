import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { listAllCourses, listCourses } from "../services/courseService";
import type { Course } from "../types/course";

type CourseView = "mine" | "all";

export function Dashboard() {
  const { user, logout } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [view, setView] = useState<CourseView>("mine");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCourses() {
      try {
        setLoading(true);
        setError("");

        const data = view === "mine" ? await listCourses() : await listAllCourses();

        if (isMounted) {
          setCourses(data);
        }
      } catch {
        if (isMounted) {
          setError("Não foi possível carregar os cursos.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      isMounted = false;
    };
  }, [view]);

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <h1>CourseSphere</h1>
          <p>Bem-vindo, {user?.name}</p>
        </div>

        <div className="header-actions">
          <Link className="button" to="/courses/new">
            Criar novo curso
          </Link>

          <button className="button button-secondary" type="button" onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      <section className="card">
        <div className="page-header" style={{ padding: 0, border: 0, boxShadow: "none" }}>
          <div>
            <h2>{view === "mine" ? "Meus cursos" : "Todos os cursos"}</h2>
            <p>
              {view === "mine"
                ? "Gerencie os cursos criados por você."
                : "Explore todos os cursos cadastrados na plataforma."}
            </p>
          </div>

          <div className="header-actions">
            <button
              className={`button ${view === "mine" ? "" : "button-secondary"}`}
              type="button"
              onClick={() => setView("mine")}
            >
              Meus cursos
            </button>

            <button
              className={`button ${view === "all" ? "" : "button-secondary"}`}
              type="button"
              onClick={() => setView("all")}
            >
              Todos os cursos
            </button>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: 16 }}>
          <label htmlFor="search">Buscar curso</label>
          <input
            id="search"
            className="input"
            type="text"
            placeholder="Digite o nome do curso"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading && <p className="meta">Carregando cursos...</p>}

        {error && <p className="alert">{error}</p>}

        {!loading && !error && filteredCourses.length === 0 && (
          <div className="empty-state">Nenhum curso encontrado.</div>
        )}

        {!loading && !error && filteredCourses.length > 0 && (
          <ul className="course-list" style={{ marginTop: 20 }}>
            {filteredCourses.map((course) => (
              <li className="course-item" key={course.id}>
                <h3>{course.name}</h3>

                {course.description && <p>{course.description}</p>}

                <p className="meta">
                  {new Date(course.startDate).toLocaleDateString("pt-BR")} até{" "}
                  {new Date(course.endDate).toLocaleDateString("pt-BR")}
                </p>

                <p className="meta">Criador: {course.creator?.name || "Não informado"}</p>

                <p className="meta">Aulas publicadas: {course._count?.lessons ?? 0}</p>

                <div>
                  <Link className="button button-secondary" to={`/courses/${course.id}`}>
                    Ver detalhes
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
