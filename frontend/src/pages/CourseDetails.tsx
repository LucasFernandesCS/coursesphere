import { Link, useParams } from "react-router-dom";

export function CourseDetails() {
  const { id } = useParams();

  return (
    <main>
      <h1>Detalhes do curso</h1>
      <p>ID do curso: {id}</p>

      <Link to="/dashboard">Voltar</Link>
    </main>
  );
}
