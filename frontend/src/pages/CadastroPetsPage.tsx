import { useEffect, useState } from "react";
import { buscarPets, buscarProprietarios, criarPet, type Pet, type Proprietario } from "../services/api";

export function CadastroPetsPage() {
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [form, setForm] = useState({
    nome: "",
    raca: "",
    proprietario: "",
  });

  async function carregarDados() {
    try {
      const [dadosProprietarios, dadosPets] = await Promise.all([
        buscarProprietarios(),
        buscarPets(),
      ]);

      setProprietarios(dadosProprietarios);
      setPets(dadosPets);
    } catch (error) {
      setErro("Não foi possível carregar os dados de pets e proprietários.");
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  async function enviarFormulario(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");

    if (!form.nome.trim() || !form.raca.trim() || !form.proprietario) {
      setErro("Nome, raça e proprietário são obrigatórios.");
      return;
    }

    try {
      setSalvando(true);
      await criarPet({
        nome: form.nome,
        raca: form.raca,
        proprietario: Number(form.proprietario),
      });

      setMensagem("Pet cadastrado com sucesso!");
      setForm({ nome: "", raca: "", proprietario: "" });
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao cadastrar pet.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="breadcrumb">PetzIn / Cadastros</span>
          <h1>Pets</h1>
        </div>
      </div>

      <section className="content-section">
        <div className="section-header">
          <div>
            <h2>Novo pet</h2>
            <p>Associe o pet ao proprietário correto.</p>
          </div>
        </div>

        {erro && <p className="error-message">{erro}</p>}
        {mensagem && <p className="success-message">{mensagem}</p>}

        <form className="stacked-form" onSubmit={enviarFormulario}>
          <div className="form-group">
            <label htmlFor="pet-nome">Nome</label>
            <input
              id="pet-nome"
              value={form.nome}
              onChange={(event) => setForm({ ...form, nome: event.target.value })}
              placeholder="Ex: Rex"
            />
          </div>

          <div className="form-group">
            <label htmlFor="pet-raca">Raça</label>
            <input
              id="pet-raca"
              value={form.raca}
              onChange={(event) => setForm({ ...form, raca: event.target.value })}
              placeholder="Ex: Labrador"
            />
          </div>

          <div className="form-group">
            <label htmlFor="pet-proprietario">Proprietário</label>
            <select
              id="pet-proprietario"
              value={form.proprietario}
              onChange={(event) => setForm({ ...form, proprietario: event.target.value })}
            >
              <option value="">Selecione um proprietário</option>
              {proprietarios.map((proprietario) => (
                <option key={proprietario.id} value={proprietario.id}>
                  {proprietario.nome}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="submit-button" disabled={salvando}>
            {salvando ? "Salvando..." : "Cadastrar pet"}
          </button>
        </form>
      </section>

      <section className="content-section">
        <div className="section-header">
          <div>
            <h2>Pets cadastrados</h2>
            <p>Lista dos animais cadastrados no sistema.</p>
          </div>
        </div>

        {carregando ? (
          <p className="message">Carregando...</p>
        ) : pets.length === 0 ? (
          <p className="empty-text">Nenhum pet cadastrado.</p>
        ) : (
          <div className="simple-list">
            {pets.map((pet) => (
              <div key={pet.id} className="list-item">
                <div className="list-avatar pet-avatar">🐾</div>
                <div>
                  <strong>{pet.nome}</strong>
                  <small>{pet.raca}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
