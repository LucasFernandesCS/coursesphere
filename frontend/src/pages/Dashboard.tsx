import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { listCourses } from "../services/courseService";
import type { Course } from "../types/course";

export function Dashboard() {
  const { user, logout } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCourses() {
      try {
        const data = await listCourses();

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
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main>
      <header>
        <div>
          <h1>CourseSphere</h1>
          <p>Bem-vindo, {user?.name}</p>
        </div>

        <button type="button" onClick={logout}>
          Sair
        </button>
      </header>

      <section>
        <div>
          <h2>Meus cursos</h2>

          <Link to="/courses/new">Criar novo curso</Link>
        </div>

        <input
          type="text"
          placeholder="Buscar curso por nome"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {loading && <p>Carregando cursos...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && filteredCourses.length === 0 && <p>Nenhum curso encontrado.</p>}

        {!loading && !error && filteredCourses.length > 0 && (
          <ul>
            {filteredCourses.map((course) => (
              <li key={course.id}>
                <h3>{course.name}</h3>

                {course.description && <p>{course.description}</p>}

                <p>
                  {new Date(course.startDate).toLocaleDateString("pt-BR")} até{" "}
                  {new Date(course.endDate).toLocaleDateString("pt-BR")}
                </p>

                <Link to={`/courses/${course.id}`}>Ver detalhes</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
