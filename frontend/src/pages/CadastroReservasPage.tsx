import { useEffect, useState } from "react";
import { buscarProprietarios, buscarPets, buscarReservas, criarReserva, type Pet, type Proprietario, type Reserva } from "../services/api";

function formatDateBR(value: string) {
  if (!value) return "";

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

export function CadastroReservasPage() {
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [proprietarioSelecionado, setProprietarioSelecionado] = useState("");
  const [petsSelecionados, setPetsSelecionados] = useState<string[]>([]);
  const [dataEntrada, setDataEntrada] = useState("");
  const [dataSaida, setDataSaida] = useState("");

  async function carregarDados() {
    try {
      const [dadosProprietarios, dadosPets, dadosReservas] = await Promise.all([
        buscarProprietarios(),
        buscarPets(),
        buscarReservas(),
      ]);

      setProprietarios(dadosProprietarios);
      setPets(dadosPets);
      setReservas(dadosReservas);
    } catch (error) {
      setErro("Não foi possível carregar os dados da reserva.");
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  const petsDoProprietario = pets.filter(
    (pet) => String(pet.proprietario) === proprietarioSelecionado
  );

  function selecionarPet(id: string) {
    setPetsSelecionados((selecionados) => {
      if (selecionados.includes(id)) {
        return selecionados.filter((petId) => petId !== id);
      }

      return [...selecionados, id];
    });
  }

  async function enviarFormulario(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");

    if (!proprietarioSelecionado) {
      setErro("Selecione um proprietário.");
      return;
    }

    if (petsSelecionados.length === 0) {
      setErro("Selecione pelo menos um pet.");
      return;
    }

    if (!dataEntrada || !dataSaida) {
      setErro("Informe as datas de entrada e saída.");
      return;
    }

    if (dataSaida <= dataEntrada) {
      setErro("A data de saída deve ser posterior à entrada.");
      return;
    }

    try {
      setSalvando(true);
      await criarReserva({
        proprietario: Number(proprietarioSelecionado),
        pets: petsSelecionados.map(Number),
        data_entrada: dataEntrada,
        data_saida: dataSaida,
      });

      setMensagem("Reserva criada com sucesso!");
      setProprietarioSelecionado("");
      setPetsSelecionados([]);
      setDataEntrada("");
      setDataSaida("");
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao criar reserva.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="breadcrumb">PetzIn / Cadastros</span>
          <h1>Reservas</h1>
        </div>
      </div>

      <section className="content-section">
        <div className="section-header">
          <div>
            <h2>Nova reserva</h2>
            <p>Agende a hospedagem para os pets.</p>
          </div>
        </div>

        {erro && <p className="error-message">{erro}</p>}
        {mensagem && <p className="success-message">{mensagem}</p>}

        <form className="stacked-form" onSubmit={enviarFormulario}>
          <div className="form-group">
            <label htmlFor="reserva-proprietario">Proprietário</label>
            <select
              id="reserva-proprietario"
              value={proprietarioSelecionado}
              onChange={(event) => {
                setProprietarioSelecionado(event.target.value);
                setPetsSelecionados([]);
              }}
            >
              <option value="">Selecione um proprietário</option>
              {proprietarios.map((proprietario) => (
                <option key={proprietario.id} value={proprietario.id}>
                  {proprietario.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Pets</label>
            {!proprietarioSelecionado ? (
              <p className="form-hint">Selecione primeiro o proprietário.</p>
            ) : petsDoProprietario.length === 0 ? (
              <p className="form-hint">Esse proprietário ainda não tem pets cadastrados.</p>
            ) : (
              <div className="pets-selection">
                {petsDoProprietario.map((pet) => (
                  <label key={pet.id} className="pet-option">
                    <input
                      type="checkbox"
                      checked={petsSelecionados.includes(String(pet.id))}
                      onChange={() => selecionarPet(String(pet.id))}
                    />
                    <span>
                      <strong>{pet.nome}</strong>
                      <small>{pet.raca}</small>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="form-dates">
            <div className="form-group">
              <label htmlFor="entrada">Data de entrada</label>
              <input
                id="entrada"
                type="date"
                value={dataEntrada}
                onChange={(event) => setDataEntrada(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="saida">Data de saída</label>
              <input
                id="saida"
                type="date"
                value={dataSaida}
                min={dataEntrada || undefined}
                onChange={(event) => setDataSaida(event.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={salvando}>
            {salvando ? "Criando reserva..." : "Confirmar reserva"}
          </button>
        </form>
      </section>

      <section className="content-section">
        <div className="section-header">
          <div>
            <h2>Reservas recentes</h2>
            <p>Últimas reservas registradas no sistema.</p>
          </div>
        </div>

        {carregando ? (
          <p className="message">Carregando...</p>
        ) : reservas.length === 0 ? (
          <p className="empty-text">Nenhuma reserva cadastrada.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Reserva</th>
                  <th>Proprietário</th>
                  <th>Entrada</th>
                  <th>Saída</th>
                  <th>Status</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {reservas.slice(0, 5).map((reserva) => (
                  <tr key={reserva.id}>
                    <td>#{reserva.id}</td>
                    <td>{reserva.proprietario_nome}</td>
                    <td>{formatDateBR(reserva.data_entrada)}</td>
                    <td>{formatDateBR(reserva.data_saida)}</td>
                    <td>
                      <span className={`status ${reserva.status.toLowerCase()}`}>
                        {reserva.status}
                      </span>
                    </td>
                    <td>R$ {Number(reserva.valor_total).toFixed(2).replace(".", ",")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
