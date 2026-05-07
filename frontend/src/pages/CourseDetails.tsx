import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteCourse, getCourse } from "../services/courseService";
import { createLesson, deleteLesson, listLessonsByCourse } from "../services/lessonService";
import type { Course } from "../types/course";
import type { Lesson, LessonStatus } from "../types/lesson";

type StatusFilter = "all" | LessonStatus;

export function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<LessonStatus>("draft");
  const [videoUrl, setVideoUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [creatingLesson, setCreatingLesson] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCourseDetails() {
      if (!id) {
        return;
      }

      try {
        const [courseData, lessonsData] = await Promise.all([
          getCourse(id),
          listLessonsByCourse(id),
        ]);

        if (isMounted) {
          setCourse(courseData);
          setLessons(lessonsData);
        }
      } catch {
        if (isMounted) {
          setError("Não foi possível carregar os detalhes do curso.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCourseDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleCreateLesson(event: FormEvent) {
    event.preventDefault();

    if (!id) {
      return;
    }

    if (title.trim().length < 3) {
      setError("O título da aula deve ter pelo menos 3 caracteres.");
      return;
    }

    try {
      setCreatingLesson(true);
      setError("");

      const lesson = await createLesson(id, {
        title,
        status,
        videoUrl: videoUrl || undefined,
      });

      setLessons((currentLessons) => [lesson, ...currentLessons]);
      setTitle("");
      setStatus("draft");
      setVideoUrl("");
    } catch {
      setError("Não foi possível criar a aula.");
    } finally {
      setCreatingLesson(false);
    }
  }

  async function handleDeleteCourse() {
    if (!course) {
      return;
    }

    const confirmed = window.confirm("Tem certeza que deseja excluir este curso?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteCourse(course.id);

      navigate("/dashboard");
    } catch {
      setError("Não foi possível excluir o curso.");
    }
  }

  async function handleDeleteLesson(lessonId: string) {
    const confirmed = window.confirm("Tem certeza que deseja excluir esta aula?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteLesson(lessonId);

      setLessons((currentLessons) => currentLessons.filter((lesson) => lesson.id !== lessonId));
    } catch {
      setError("Não foi possível excluir a aula.");
    }
  }

  const filteredLessons =
    statusFilter === "all" ? lessons : lessons.filter((lesson) => lesson.status === statusFilter);

  if (loading) {
    return (
      <main>
        <p>Carregando detalhes do curso...</p>
      </main>
    );
  }

  if (!course) {
    return (
      <main>
        <p>Curso não encontrado.</p>
        <Link to="/dashboard">Voltar para dashboard</Link>
      </main>
    );
  }

  return (
    <main>
      <header>
        <Link to="/dashboard">Voltar para dashboard</Link>

        <h1>{course.name}</h1>

        {course.description && <p>{course.description}</p>}

        <p>
          {new Date(course.startDate).toLocaleDateString("pt-BR")} até{" "}
          {new Date(course.endDate).toLocaleDateString("pt-BR")}
        </p>

        <button type="button" onClick={handleDeleteCourse}>
          Excluir curso
        </button>
      </header>

      {error && <p>{error}</p>}

      <section>
        <h2>Criar aula</h2>

        <form onSubmit={handleCreateLesson}>
          <div>
            <label htmlFor="title">Título</label>
            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              minLength={3}
            />
          </div>

          <div>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value as LessonStatus)}
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </select>
          </div>

          <div>
            <label htmlFor="videoUrl">URL do vídeo</label>
            <input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              placeholder="https://example.com/video"
            />
          </div>

          <button type="submit" disabled={creatingLesson}>
            {creatingLesson ? "Criando..." : "Criar aula"}
          </button>
        </form>
      </section>

      <section>
        <div>
          <h2>Aulas</h2>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          >
            <option value="all">Todas</option>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </select>
        </div>

        {filteredLessons.length === 0 && <p>Nenhuma aula encontrada.</p>}

        {filteredLessons.length > 0 && (
          <ul>
            {filteredLessons.map((lesson) => (
              <li key={lesson.id}>
                <h3>{lesson.title}</h3>

                <p>Status: {lesson.status === "draft" ? "Rascunho" : "Publicado"}</p>

                {lesson.videoUrl && (
                  <p>
                    Vídeo:{" "}
                    <a href={lesson.videoUrl} target="_blank" rel="noreferrer">
                      {lesson.videoUrl}
                    </a>
                  </p>
                )}

                <button type="button" onClick={() => handleDeleteLesson(lesson.id)}>
                  Excluir aula
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
