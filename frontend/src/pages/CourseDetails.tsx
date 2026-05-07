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

        <Link className="button-link" to={`/courses/${course.id}/edit`}>
          Editar curso
        </Link>

        <button type="button" onClick={handleDeleteCourse}>
          Excluir curso
        </button>
      </header>

      {error && <p>{error}</p>}

      <section>
        <h2>Instrutor convidado sugerido</h2>

        {guestInstructorLoading && <p>Carregando instrutor convidado...</p>}

        {!guestInstructorLoading && guestInstructor && (
          <article>
            <img src={guestInstructor.picture} alt={guestInstructor.name} width={96} height={96} />

            <div>
              <h3>{guestInstructor.name}</h3>
              <p>{guestInstructor.email}</p>
              <p>{guestInstructor.country}</p>
            </div>
          </article>
        )}

        {!guestInstructorLoading && !guestInstructor && (
          <p>Não foi possível carregar um instrutor convidado.</p>
        )}
      </section>

      <section>
        <h2>{editingLessonId ? "Editar aula" : "Criar aula"}</h2>

        <form onSubmit={handleSubmitLesson}>
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
            {creatingLesson
              ? editingLessonId
                ? "Salvando..."
                : "Criando..."
              : editingLessonId
                ? "Salvar alterações"
                : "Criar aula"}
          </button>

          {editingLessonId && (
            <button type="button" onClick={resetLessonForm}>
              Cancelar edição
            </button>
          )}
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

                <button type="button" onClick={() => handleEditLesson(lesson)}>
                  Editar aula
                </button>

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
