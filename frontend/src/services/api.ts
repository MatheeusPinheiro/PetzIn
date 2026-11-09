const API_URL = "http://127.0.0.1:8000/api";

export type Proprietario = {
  id: number;
  nome: string;
  telefone?: string;
  email?: string;
};

export type Pet = {
  id: number;
  nome: string;
  raca: string;
  proprietario: number;
};

export type Canil = {
  id: number;
  numero: number;
  ativo: boolean;
};

export type Reserva = {
  id: number;
  proprietario_nome: string;
  data_entrada: string;
  data_saida: string;
  status: string;
  valor_total: number | string;
};

type Endpoint = "proprietarios" | "pets" | "canis" | "reservas";

async function buscarDados<T>(endpoint: Endpoint): Promise<T> {
  const resposta = await fetch(`${API_URL}/${endpoint}/`);

  if (!resposta.ok) {
    throw new Error(`Erro ao consultar ${endpoint}`);
  }

  return (await resposta.json()) as T;
}

async function enviarDados<T>(endpoint: Endpoint, payload: Record<string, unknown>): Promise<T> {
  const resposta = await fetch(`${API_URL}/${endpoint}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    const mensagem =
      typeof dados === "object" && dados !== null
        ? Object.values(dados)
            .flatMap((valor) => (Array.isArray(valor) ? valor : [String(valor)]))
            .join(" ") || `Não foi possível cadastrar ${endpoint}.`
        : `Não foi possível cadastrar ${endpoint}.`;

    throw new Error(mensagem);
  }

  return dados as T;
}

export async function buscarProprietarios(): Promise<Proprietario[]> {
  return buscarDados<Proprietario[]>("proprietarios");
}

export async function buscarPets(): Promise<Pet[]> {
  return buscarDados<Pet[]>("pets");
}

export async function buscarCanis(): Promise<Canil[]> {
  return buscarDados<Canil[]>("canis");
}

export async function buscarReservas(): Promise<Reserva[]> {
  return buscarDados<Reserva[]>("reservas");
}

export async function criarProprietario(payload: {
  nome: string;
  telefone: string;
  email?: string;
}) {
  return enviarDados<Proprietario>("proprietarios", payload);
}

export async function criarPet(payload: {
  nome: string;
  raca: string;
  proprietario: number;
}) {
  return enviarDados<Pet>("pets", payload);
}

export async function criarCanil(payload: {
  numero: number;
  ativo: boolean;
}) {
  return enviarDados<Canil>("canis", payload);
}

export type ReservaPayload = {
  proprietario: number;
  pets: number[];
  data_entrada: string;
  data_saida: string;
};

export async function criarReserva(payload: ReservaPayload) {
  return enviarDados<Reserva>("reservas", payload);
}