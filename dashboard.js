// Função para registrar o acesso atual no localStorage
function registrarAcesso() {
  const key = 'acessos_site';
  let acessos = JSON.parse(localStorage.getItem(key)) || [];
  acessos.push(new Date().toISOString());
  localStorage.setItem(key, JSON.stringify(acessos));
  return acessos;
}

// Função para filtrar acessos últimos N dias
function filtrarUltimosDias(acessos, dias) {
  const limite = new Date();
  limite.setDate(limite.getDate() - dias);
  return acessos.filter(a => new Date(a) >= limite);
}

// Filtra acessos do mês atual
function filtrarMesAtual(acessos) {
  const agora = new Date();
  return acessos.filter(a => {
    const d = new Date(a);
    return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
  });
}

// Conta acessos por dia dos últimos N dias
function contarAcessosPorDia(acessos, dias) {
  const hoje = new Date();
  let contagem = {};

  // Inicializa o objeto com datas dos últimos N dias no formato dd/mm
  for (let i = dias - 1; i >= 0; i--) {
    let d = new Date(hoje);
    d.setDate(d.getDate() - i);
    let key = d.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'});
    contagem[key] = 0;
  }

  // Conta os acessos que caem em cada data
  acessos.forEach(a => {
    let d = new Date(a);
    let key = d.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'});
    if (key in contagem) contagem[key]++;
  });

  return contagem;
}

// Atualiza o dashboard visual e os gráficos
function atualizarDashboard(acessos) {
  document.getElementById('total').textContent = acessos.length;

  const ult7 = filtrarUltimosDias(acessos, 7);
  document.getElementById('ultimos7dias').textContent = ult7.length;

  const mesAtual = filtrarMesAtual(acessos);
  document.getElementById('mesAtual').textContent = mesAtual.length;

  // Atualizar histórico tabela
  const tbody = document.getElementById('lista-acessos');
  tbody.innerHTML = '';
  const ultimos10 = acessos.slice(-10).reverse();
  ultimos10.forEach((ts, i) => {
    const tr = document.createElement('tr');
    const tdNum = document.createElement('td');
    tdNum.textContent = i + 1;
    const tdData = document.createElement('td');
    tdData.textContent = new Date(ts).toLocaleString('pt-BR');
    tr.appendChild(tdNum);
    tr.appendChild(tdData);
    tbody.appendChild(tr);
  });

  // Dados para gráfico de barras - últimos 7 dias
  const dadosBarra = contarAcessosPorDia(acessos, 7);
  const labelsBarra = Object.keys(dadosBarra);
  const dadosValoresBarra = Object.values(dadosBarra);

  // Destruir gráfico antigo se existir para evitar sobreposição
  if (window.graficoBarraInstance) window.graficoBarraInstance.destroy();

  const ctxBarra = document.getElementById('graficoBarra').getContext('2d');
  window.graficoBarraInstance = new Chart(ctxBarra, {
    type: 'bar',
    data: {
      labels: labelsBarra,
      datasets: [{
        label: 'Acessos',
        data: dadosValoresBarra,
        backgroundColor: '#2563eb',
        borderRadius: 5,
        barPercentage: 0.6,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: context => `Acessos: ${context.parsed.y}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });

  // Dados para gráfico pizza - proporção mês atual / outros meses
  const total = acessos.length;
  const mesAtualCount = mesAtual.length;
  const outros = total - mesAtualCount;

  // Destruir gráfico antigo se existir
  if (window.graficoPizzaInstance) window.graficoPizzaInstance.destroy();

  const ctxPizza = document.getElementById('graficoPizza').getContext('2d');
  window.graficoPizzaInstance = new Chart(ctxPizza, {
    type: 'doughnut',
    data: {
      labels: ['Mês Atual', 'Outros Meses'],
      datasets: [{
        data: [mesAtualCount, outros],
        backgroundColor: ['#2563eb', '#93c5fd'],
        hoverOffset: 30,
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#374151',
            font: { weight: '600', size: 14 }
          }
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: ctx => `${ctx.label}: ${ctx.parsed} acessos`
          }
        }
      }
    }
  });
}

// Registrar acesso e atualizar ao carregar
const acessos = registrarAcesso();
atualizarDashboard(acessos);

// Botão voltar
document.getElementById('btn-voltar').addEventListener('click', () => {
  window.location.href = 'https://tecwfc.github.io/aromatizante/'; // ajuste para sua página principal
});
