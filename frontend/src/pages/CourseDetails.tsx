import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteCourse, getCourse } from "../services/courseService";
import {
  createLesson,
  deleteLesson,
  listLessonsByCourse,
  updateLesson,
} from "../services/lessonService";
import { getGuestInstructor } from "../services/guestInstructorService";
import type { Course } from "../types/course";
import type { Lesson, LessonStatus } from "../types/lesson";
import type { GuestInstructor } from "../types/guestInstructor";
import { useAuth } from "../contexts/useAuth";

type StatusFilter = "all" | LessonStatus;

export function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<LessonStatus>("draft");
  const [videoUrl, setVideoUrl] = useState("");
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [creatingLesson, setCreatingLesson] = useState(false);
  const [error, setError] = useState("");

  const [guestInstructor, setGuestInstructor] = useState<GuestInstructor | null>(null);
  const [guestInstructorLoading, setGuestInstructorLoading] = useState(true);

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

    async function loadGuestInstructor() {
      try {
        const instructorData = await getGuestInstructor();

        if (isMounted) {
          setGuestInstructor(instructorData);
        }
      } catch {
        if (isMounted) {
          setGuestInstructor(null);
        }
      } finally {
        if (isMounted) {
          setGuestInstructorLoading(false);
        }
      }
    }

    loadCourseDetails();
    loadGuestInstructor();

    return () => {
      isMounted = false;
    };
  }, [id]);

  function resetLessonForm() {
    setEditingLessonId(null);
    setTitle("");
    setStatus("draft");
    setVideoUrl("");
  }

  function handleEditLesson(lesson: Lesson) {
    setEditingLessonId(lesson.id);
    setTitle(lesson.title);
    setStatus(lesson.status);
    setVideoUrl(lesson.videoUrl || "");
    setError("");
  }

  async function handleSubmitLesson(event: FormEvent) {
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

      if (editingLessonId) {
        const updatedLesson = await updateLesson(editingLessonId, {
          title,
          status,
          videoUrl: videoUrl || undefined,
        });

        setLessons((currentLessons) =>
          currentLessons.map((lesson) => (lesson.id === editingLessonId ? updatedLesson : lesson))
        );

        resetLessonForm();
        return;
      }

      const lesson = await createLesson(id, {
        title,
        status,
        videoUrl: videoUrl || undefined,
      });

      setLessons((currentLessons) => [lesson, ...currentLessons]);
      resetLessonForm();
    } catch {
      setError(
        editingLessonId ? "Não foi possível atualizar a aula." : "Não foi possível criar a aula."
      );
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

      if (editingLessonId === lessonId) {
        resetLessonForm();
      }
    } catch {
      setError("Não foi possível excluir a aula.");
    }
  }

  const filteredLessons =
    statusFilter === "all" ? lessons : lessons.filter((lesson) => lesson.status === statusFilter);

  if (loading) {
    return (
      <main className="page">
        <section className="card">
          <p className="meta">Carregando detalhes do curso...</p>
        </section>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="page">
        <section className="card">
          <p>Curso não encontrado.</p>
          <Link className="button button-secondary" to="/dashboard">
            Voltar para dashboard
          </Link>
        </section>
      </main>
    );
  }

  const isCourseCreator = course.creatorId === user?.id;

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <Link className="button button-ghost" to="/dashboard">
            Voltar para dashboard
          </Link>

          <h1>{course.name}</h1>

          {course.description && <p>{course.description}</p>}

          <p className="meta">
            {new Date(course.startDate).toLocaleDateString("pt-BR")} até{" "}
            {new Date(course.endDate).toLocaleDateString("pt-BR")}
          </p>
        </div>

        {isCourseCreator && (
          <div className="header-actions">
            <Link className="button button-secondary" to={`/courses/${course.id}/edit`}>
              Editar curso
            </Link>

            <button className="button button-danger" type="button" onClick={handleDeleteCourse}>
              Excluir curso
            </button>
          </div>
        )}
      </header>

      {error && <p className="alert">{error}</p>}

      <section className="card">
        <h2>Instrutor convidado</h2>

        {guestInstructorLoading && <p className="meta">Carregando instrutor convidado...</p>}

        {!guestInstructorLoading && guestInstructor && (
          <article className="instructor">
            <img src={guestInstructor.picture} alt={guestInstructor.name} width={96} height={96} />

            <div>
              <h3>{guestInstructor.name}</h3>
              <p className="meta">{guestInstructor.email}</p>
              <p className="meta">{guestInstructor.country}</p>
            </div>
          </article>
        )}

        {!guestInstructorLoading && !guestInstructor && (
          <p className="meta">Não foi possível carregar um instrutor convidado.</p>
        )}
      </section>

      {isCourseCreator && (
        <section className="card">
          <h2>{editingLessonId ? "Editar aula" : "Criar aula"}</h2>

          <form className="form" onSubmit={handleSubmitLesson}>
            <div className="form-group">
              <label htmlFor="title">Título</label>
              <input
                className="input"
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                minLength={3}
                placeholder="Ex.: Introdução ao conteúdo"
              />
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  className="select"
                  id="status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as LessonStatus)}
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="videoUrl">URL do vídeo</label>
                <input
                  className="input"
                  id="videoUrl"
                  type="url"
                  value={videoUrl}
                  onChange={(event) => setVideoUrl(event.target.value)}
                  placeholder="https://example.com/video"
                />
              </div>
            </div>

            <div className="actions">
              <button className="button" type="submit" disabled={creatingLesson}>
                {creatingLesson
                  ? editingLessonId
                    ? "Salvando..."
                    : "Criando..."
                  : editingLessonId
                    ? "Salvar alterações"
                    : "Criar aula"}
              </button>

              {editingLessonId && (
                <button className="button button-secondary" type="button" onClick={resetLessonForm}>
                  Cancelar edição
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      <section className="card">
        <div className="page-header" style={{ padding: 0, border: 0, boxShadow: "none" }}>
          <div>
            <h2>Aulas</h2>
            <p>Gerencie as aulas vinculadas a este curso.</p>
          </div>

          <div className="form-group">
            <label htmlFor="statusFilter">Filtrar por status</label>
            <select
              className="select"
              id="statusFilter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            >
              <option value="all">Todas</option>
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </select>
          </div>
        </div>

        {filteredLessons.length === 0 && (
          <div className="empty-state">Nenhuma aula encontrada.</div>
        )}

        {filteredLessons.length > 0 && (
          <ul className="lesson-list" style={{ marginTop: 20 }}>
            {filteredLessons.map((lesson) => (
              <li className="lesson-item" key={lesson.id}>
                <h3>{lesson.title}</h3>

                <span
                  className={`status ${
                    lesson.status === "draft" ? "status-draft" : "status-published"
                  }`}
                >
                  {lesson.status === "draft" ? "Rascunho" : "Publicado"}
                </span>

                {lesson.videoUrl && (
                  <p className="meta">
                    Vídeo:{" "}
                    <a href={lesson.videoUrl} target="_blank" rel="noreferrer">
                      {lesson.videoUrl}
                    </a>
                  </p>
                )}

                {isCourseCreator && (
                  <div className="actions">
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() => handleEditLesson(lesson)}
                    >
                      Editar aula
                    </button>

                    <button
                      className="button button-danger"
                      type="button"
                      onClick={() => handleDeleteLesson(lesson.id)}
                    >
                      Excluir aula
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
