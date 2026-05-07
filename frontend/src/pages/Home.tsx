import { Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

export function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">CourseSphere</span>

          <h1>Organize cursos, aulas e conteúdos em um só lugar.</h1>

          <p>
            Uma plataforma simples para criar cursos online, gerenciar aulas, acompanhar status de
            publicação e manter tudo estruturado com segurança.
          </p>
        </div>

        <div className="header-actions">
          {isAuthenticated ? (
            <Link className="button" to="/dashboard">
              Ir para dashboard
            </Link>
          ) : (
            <>
              <Link className="button button-secondary" to="/login">
                Entrar
              </Link>

              <Link className="button" to="/register">
                Começar agora
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="grid grid-2">
        <article className="card">
          <h2>Dashboard inteligente</h2>
          <p className="meta">
            Visualize todos os seus cursos, pesquise por nome e acesse rapidamente os detalhes.
          </p>

          <ul className="course-list" style={{ marginTop: 20 }}>
            <li className="course-item">
              <h3>JavaScript Basics</h3>
              <p className="meta">4 aulas cadastradas</p>
              <span className="status status-published">Publicado</span>
            </li>

            <li className="course-item">
              <h3>React Fundamentals</h3>
              <p className="meta">2 aulas publicadas</p>
              <span className="status status-draft">Rascunho</span>
            </li>
          </ul>
        </article>

        <article className="card">
          <h2>Controle completo</h2>
          <p className="meta">
            Crie cursos, organize aulas, filtre por status e mantenha permissões por usuário.
          </p>

          <div className="grid" style={{ marginTop: 20 }}>
            <div className="home-stat">
              <strong>JWT</strong>
              <span> - Autenticação segura</span>
            </div>

            <div className="home-stat">
              <strong>CRUD</strong>
              <span> - Cursos e aulas completos</span>
            </div>

            <div className="home-stat">
              <strong>API</strong>
              <span> - Instrutor convidado externo</span>
            </div>
          </div>
        </article>
      </section>

      <section className="grid grid-3">
        <article className="card">
          <span className="feature-icon">01</span>
          <h2>Gestão de cursos</h2>
          <p className="meta">
            Crie, edite, visualize e exclua cursos com validações de datas e permissões.
          </p>
        </article>

        <article className="card">
          <span className="feature-icon">02</span>
          <h2>Aulas organizadas</h2>
          <p className="meta">
            Cadastre aulas por curso, controle status e filtre entre rascunhos e publicadas.
          </p>
        </article>

        <article className="card">
          <span className="feature-icon">03</span>
          <h2>Segurança</h2>
          <p className="meta">
            Rotas protegidas com autenticação JWT e regras de acesso por criador do curso.
          </p>
        </article>
      </section>
    </main>
  );
}
