import { useEffect, useState } from "react";
import { buscarCanis, criarCanil, type Canil } from "../services/api";

export function CadastroCanisPage() {
  const [canis, setCanis] = useState<Canil[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [form, setForm] = useState({
    numero: "",
    ativo: true,
  });

  async function carregarCanis() {
    try {
      const dados = await buscarCanis();
      setCanis(dados);
    } catch (error) {
      setErro("Não foi possível carregar os canis.");
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarCanis();
  }, []);

  async function enviarFormulario(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");

    if (!form.numero) {
      setErro("Informe o número do canil.");
      return;
    }

    try {
      setSalvando(true);
      await criarCanil({
        numero: Number(form.numero),
        ativo: form.ativo,
      });

      setMensagem("Canil cadastrado com sucesso!");
      setForm({ numero: "", ativo: true });
      await carregarCanis();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao cadastrar canil.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="breadcrumb">PetzIn / Cadastros</span>
          <h1>Canis</h1>
        </div>
      </div>

      <section className="content-section">
        <div className="section-header">
          <div>
            <h2>Novo canil</h2>
            <p>Cadastre cada espaço disponível do hotel para pets.</p>
          </div>
        </div>

        {erro && <p className="error-message">{erro}</p>}
        {mensagem && <p className="success-message">{mensagem}</p>}

        <form className="stacked-form" onSubmit={enviarFormulario}>
          <div className="form-group">
            <label htmlFor="canil-numero">Número</label>
            <input
              id="canil-numero"
              type="number"
              min={1}
              value={form.numero}
              onChange={(event) => setForm({ ...form, numero: event.target.value })}
              placeholder="Ex: 1"
            />
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(event) => setForm({ ...form, ativo: event.target.checked })}
            />
            <span>Canil ativo</span>
          </label>

          <button type="submit" className="submit-button" disabled={salvando}>
            {salvando ? "Salvando..." : "Cadastrar canil"}
          </button>
        </form>
      </section>

      <section className="content-section">
        <div className="section-header">
          <div>
            <h2>Canis cadastrados</h2>
            <p>Lista dos espaços ativos e inativos.</p>
          </div>
        </div>

        {carregando ? (
          <p className="message">Carregando...</p>
        ) : canis.length === 0 ? (
          <p className="empty-text">Nenhum canil cadastrado.</p>
        ) : (
          <div className="simple-list">
            {canis.map((canil) => (
              <div key={canil.id} className="list-item">
                <div className="list-avatar">{canil.numero}</div>
                <div>
                  <strong>Canil {canil.numero}</strong>
                  <small>{canil.ativo ? "Ativo" : "Inativo"}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
