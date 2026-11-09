import { useEffect, useState } from "react";
import {
  FaUser,
  FaDog,
  FaCalendarCheck,
} from "react-icons/fa6";
import { buscarProprietarios, buscarPets, buscarReservas, type Proprietario, type Pet, type Reserva } from "../services/api";

function formatCurrency(value: number | string) {
  return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
}

function formatDateBR(value: string) {
  if (!value) return "";

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

export function DashboardPage() {
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
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
        setErro("Não foi possível conectar à API. Verifique se o Django está rodando.");
        console.error(error);
      } finally {
        setCarregando(false);
      }
    }

    void carregarDados();
  }, []);

  return (
    <>
      <header className="topbar">
        <div>
          <span className="breadcrumb">PetzIn / Painel</span>
          <h1>Visão geral</h1>
        </div>

        <div className="user-info">
          <span className="user-avatar">A</span>
          <span>Administrador</span>
        </div>
      </header>

      <section className="welcome">
        <div>
          <span className="welcome-label">PAINEL DE CONTROLE</span>
          <h2>Bem-vindo ao PetzIn!</h2>
          <p>Gerencie seus hóspedes e reservas em um só lugar.</p>
        </div>

        <span className="welcome-icon">🐕</span>
      </section>

      {carregando && <p className="message">Carregando informações...</p>}
      {erro && <p className="error-message">{erro}</p>}

      {!carregando && (
        <>
          <section className="stats">
            <div className="stat-card">
              <div className="stat-icon blue"><FaUser /></div>
              <span>Proprietários</span>
              <strong>{proprietarios.length}</strong>
              <small>Cadastrados no sistema</small>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange"><FaDog /></div>
              <span>Pets</span>
              <strong>{pets.length}</strong>
              <small>Hóspedes cadastrados</small>
            </div>

            <div className="stat-card">
              <div className="stat-icon green"><FaCalendarCheck /></div>
              <span>Reservas</span>
              <strong>{reservas.length}</strong>
              <small>Reservas registradas</small>
            </div>
          </section>

          <section className="content-section">
            <div className="section-header">
              <div>
                <h2>Reservas recentes</h2>
                <p>Acompanhe as últimas hospedagens cadastradas.</p>
              </div>
            </div>

            {reservas.length === 0 ? (
              <div className="empty-state">
                <span>📋</span>
                <p>Nenhuma reserva cadastrada ainda.</p>
              </div>
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
                        <td>{formatCurrency(reserva.valor_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
