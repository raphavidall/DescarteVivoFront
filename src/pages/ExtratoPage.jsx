import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const ExtratoPage = () => {
  const navigate = useNavigate();
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('user'));
    setUser(localUser);

    async function fetchExtrato() {
        try {
            const res = await api.get('/transacoes');
            setTransacoes(res.data);
        } catch (error) {
            console.error("Erro ao carregar extrato");
        } finally {
            setLoading(false);
        }
    }
    fetchExtrato();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="bg-black text-white py-6 px-4 mb-6">
          <div className="container mx-auto flex items-center gap-4">
              <button onClick={() => navigate('/perfil')} className="hover:text-brand-green">
                  <ArrowLeft size={24} />
              </button>
              <h1 className="text-2xl font-black uppercase tracking-wide">Extrato de Moedas</h1>
          </div>
      </div>

      <main className="container mx-auto px-4 md:px-6 max-w-3xl">
        
        {loading ? <div className="text-center py-10">Carregando...</div> : (
            <div className="space-y-4">
                {transacoes.length === 0 && (
                    <div className="text-center text-gray-500 py-10">Nenhuma movimentação encontrada.</div>
                )}

                {transacoes.map((t) => {
                    // Lógica: É Entrada ou Saída?
                    const isEntrada = t.id_destino === user?.id;
                    const valor = t.valor.toFixed(2);
                    
                    // Formata Data
                    const data = new Date(t.data_transacao).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    });

                    // Título amigável
                    let titulo = "";
                    if (t.tipo.includes("RESERVA")) titulo = "Reserva de Saldo (Bloqueio)";
                    else if (t.tipo.includes("PAGAMENTO")) titulo = isEntrada ? "Pagamento Recebido" : "Pagamento Efetuado";
                    else if (t.tipo.includes("ESTORNO")) titulo = "Estorno / Devolução";
                    else titulo = t.tipo.replace(/_/g, ' ');

                    return (
                        <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                            
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isEntrada ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {isEntrada ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 capitalize text-sm md:text-base">{titulo.toLowerCase()}</h3>
                                    <p className="text-xs text-gray-500">{data}</p>
                                </div>
                            </div>

                            <div className={`font-black text-lg ${isEntrada ? 'text-green-600' : 'text-red-600'}`}>
                                {isEntrada ? '+' : '-'} {valor}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </main>
    </div>
  );
};

export default ExtratoPage;