import { useEffect, useState } from "react";
import { buscarProprietarios, criarProprietario, type Proprietario } from "../services/api";

export function CadastroProprietariosPage() {
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
  });

  async function carregarProprietarios() {
    try {
      const dados = await buscarProprietarios();
      setProprietarios(dados);
    } catch (error) {
      setErro("Não foi possível carregar os proprietários.");
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarProprietarios();
  }, []);

  async function enviarFormulario(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");

    if (!form.nome.trim() || !form.telefone.trim()) {
      setErro("Nome e telefone são obrigatórios.");
      return;
    }

    try {
      setSalvando(true);
      await criarProprietario(form);
      setMensagem("Proprietário cadastrado com sucesso!");
      setForm({ nome: "", telefone: "", email: "" });
      await carregarProprietarios();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao cadastrar proprietário.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="breadcrumb">PetzIn / Cadastros</span>
          <h1>Proprietários</h1>
        </div>
      </div>

      <section className="content-section">
        <div className="section-header">
          <div>
            <h2>Novo proprietário</h2>
            <p>Cadastre os dados do responsável pelos pets.</p>
          </div>
        </div>

        {erro && <p className="error-message">{erro}</p>}
        {mensagem && <p className="success-message">{mensagem}</p>}

        <form className="stacked-form" onSubmit={enviarFormulario}>
          <div className="form-group">
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              value={form.nome}
              onChange={(event) => setForm({ ...form, nome: event.target.value })}
              placeholder="Ex: Maria Souza"
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefone">Telefone</label>
            <input
              id="telefone"
              value={form.telefone}
              onChange={(event) => setForm({ ...form, telefone: event.target.value })}
              placeholder="(92) 99999-9999"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="maria@email.com"
            />
          </div>

          <button type="submit" className="submit-button" disabled={salvando}>
            {salvando ? "Salvando..." : "Cadastrar proprietário"}
          </button>
        </form>
      </section>

      <section className="content-section">
        <div className="section-header">
          <div>
            <h2>Proprietários cadastrados</h2>
            <p>Lista atualizada dos responsáveis.</p>
          </div>
        </div>

        {carregando ? (
          <p className="message">Carregando...</p>
        ) : proprietarios.length === 0 ? (
          <p className="empty-text">Nenhum proprietário cadastrado.</p>
        ) : (
          <div className="simple-list">
            {proprietarios.map((proprietario) => (
              <div key={proprietario.id} className="list-item">
                <div className="list-avatar">{proprietario.nome.charAt(0).toUpperCase()}</div>
                <div>
                  <strong>{proprietario.nome}</strong>
                  <small>{proprietario.telefone}</small>
                  {proprietario.email && <small>{proprietario.email}</small>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
