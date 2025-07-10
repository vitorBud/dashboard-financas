// navigation.js - Sistema de navegação entre páginas

// ======================
// Configuração de Páginas
// ======================

const pageConfig = {
    dashboard: {
        title: 'Dashboard',
        url: 'dashboard.html',
        icon: 'fas fa-home',
        description: 'Visão geral das suas finanças'
    },
    transacoes: {
        title: 'Transações',
        url: 'transacoes.html',
        icon: 'fas fa-wallet',
        description: 'Gerencie suas receitas e despesas'
    },
    orcamentos: {
        title: 'Orçamentos',
        url: 'orcamentos.html',
        icon: 'fas fa-chart-pie',
        description: 'Controle seus gastos por categoria'
    },
    relatorios: {
        title: 'Relatórios',
        url: 'relatorios.html',
        icon: 'fas fa-chart-bar',
        description: 'Análises detalhadas das suas finanças'
    },
    categorias: {
        title: 'Categorias',
        url: 'categorias.html',
        icon: 'fas fa-tags',
        description: 'Organize suas transações por categoria'
    },
    configuracoes: {
        title: 'Configurações',
        url: 'configuracoes.html',
        icon: 'fas fa-cog',
        description: 'Personalize sua experiência'
    }
};

// ======================
// Funções de Navegação
// ======================

// Função para navegar para uma página
function navigateTo(pageKey) {
    const page = pageConfig[pageKey];
    if (page) {
        // Salvar página atual no histórico
        const currentPage = getCurrentPage();
        saveNavigationHistory(currentPage);
        
        // Navegar para a nova página
        window.location.href = page.url;
    } else {
        console.error(`Página não encontrada: ${pageKey}`);
    }
}

// Função para voltar à página anterior
function goBack() {
    const history = getNavigationHistory();
    if (history.length > 0) {
        const previousPage = history.pop();
        saveNavigationHistory(null, history);
        navigateTo(previousPage);
    } else {
        // Se não há histórico, voltar ao dashboard
        navigateTo('dashboard');
    }
}

// Função para salvar histórico de navegação
function saveNavigationHistory(page, customHistory = null) {
    try {
        let history = customHistory || getNavigationHistory();
        
        if (page && !history.includes(page)) {
            history.push(page);
            
            // Manter apenas os últimos 10 itens
            if (history.length > 10) {
                history = history.slice(-10);
            }
        }
        
        localStorage.setItem('navigation_history', JSON.stringify(history));
    } catch (error) {
        console.error('Erro ao salvar histórico de navegação:', error);
    }
}

// Função para obter histórico de navegação
function getNavigationHistory() {
    try {
        const history = localStorage.getItem('navigation_history');
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Erro ao carregar histórico de navegação:', error);
        return [];
    }
}

// ======================
// Breadcrumbs
// ======================

// Função para gerar breadcrumbs
function generateBreadcrumbs() {
    const currentPage = getCurrentPage();
    const history = getNavigationHistory();
    const breadcrumbContainer = document.getElementById('breadcrumbs');
    
    if (!breadcrumbContainer) return;
    
    let breadcrumbs = [];
    
    // Sempre incluir o dashboard como primeiro item
    if (currentPage !== 'dashboard') {
        breadcrumbs.push({
            key: 'dashboard',
            title: pageConfig.dashboard.title,
            url: pageConfig.dashboard.url,
            current: false
        });
    }
    
    // Adicionar página anterior se existir
    if (history.length > 0) {
        const previousPage = history[history.length - 1];
        if (previousPage !== 'dashboard' && previousPage !== currentPage) {
            const prevConfig = pageConfig[previousPage];
            if (prevConfig) {
                breadcrumbs.push({
                    key: previousPage,
                    title: prevConfig.title,
                    url: prevConfig.url,
                    current: false
                });
            }
        }
    }
    
    // Adicionar página atual
    const currentConfig = pageConfig[currentPage];
    if (currentConfig) {
        breadcrumbs.push({
            key: currentPage,
            title: currentConfig.title,
            url: currentConfig.url,
            current: true
        });
    }
    
    // Renderizar breadcrumbs
    renderBreadcrumbs(breadcrumbs, breadcrumbContainer);
}

// Função para renderizar breadcrumbs
function renderBreadcrumbs(breadcrumbs, container) {
    const breadcrumbHTML = breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        if (isLast || item.current) {
            return `<span class="breadcrumb-current">${item.title}</span>`;
        } else {
            return `<a href="${item.url}" class="breadcrumb-link">${item.title}</a>`;
        }
    }).join('<span class="breadcrumb-separator"><i class="fas fa-chevron-right"></i></span>');
    
    container.innerHTML = `
        <nav aria-label="Breadcrumb" class="breadcrumb-nav">
            ${breadcrumbHTML}
        </nav>
    `;
}

// ======================
// Menu de Navegação Rápida
// ======================

// Função para criar menu de navegação rápida
function createQuickNavMenu() {
    const quickNavContainer = document.getElementById('quick-nav');
    if (!quickNavContainer) return;
    
    const currentPage = getCurrentPage();
    const menuItems = Object.entries(pageConfig)
        .filter(([key]) => key !== currentPage)
        .map(([key, config]) => `
            <button class="quick-nav-item" onclick="navigateTo('${key}')" title="${config.description}">
                <i class="${config.icon}"></i>
                <span>${config.title}</span>
            </button>
        `).join('');
    
    quickNavContainer.innerHTML = `
        <div class="quick-nav-menu">
            <button class="quick-nav-toggle" onclick="toggleQuickNav()">
                <i class="fas fa-th"></i>
                <span>Menu Rápido</span>
            </button>
            <div class="quick-nav-dropdown" id="quick-nav-dropdown">
                ${menuItems}
            </div>
        </div>
    `;
}

// Função para alternar menu de navegação rápida
function toggleQuickNav() {
    const dropdown = document.getElementById('quick-nav-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// ======================
// Atalhos de Teclado
// ======================

// Configuração de atalhos de teclado
const keyboardShortcuts = {
    'Alt+1': 'dashboard',
    'Alt+2': 'transacoes',
    'Alt+3': 'orcamentos',
    'Alt+4': 'relatorios',
    'Alt+5': 'categorias',
    'Alt+6': 'configuracoes'
};

// Função para configurar atalhos de teclado
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        const shortcut = [];
        
        if (event.altKey) shortcut.push('Alt');
        if (event.ctrlKey) shortcut.push('Ctrl');
        if (event.shiftKey) shortcut.push('Shift');
        
        shortcut.push(event.key);
        
        const shortcutString = shortcut.join('+');
        const targetPage = keyboardShortcuts[shortcutString];
        
        if (targetPage) {
            event.preventDefault();
            navigateTo(targetPage);
        }
        
        // Atalho para voltar (Alt + Backspace)
        if (event.altKey && event.key === 'Backspace') {
            event.preventDefault();
            goBack();
        }
    });
}

// ======================
// Indicadores de Página Ativa
// ======================

// Função para atualizar indicadores visuais da página ativa
function updateActivePageIndicators() {
    const currentPage = getCurrentPage();
    
    // Atualizar título da página
    const pageConfig = window.pageConfig || {};
    const currentConfig = pageConfig[currentPage];
    if (currentConfig) {
        document.title = `Finanças - ${currentConfig.title}`;
    }
    
    // Atualizar meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
    }
    if (currentConfig) {
        metaDescription.content = currentConfig.description;
    }
    
    // Atualizar classe do body para CSS específico da página
    document.body.className = `page-${currentPage}`;
}

// ======================
// Inicialização
// ======================

// Função para inicializar sistema de navegação
function initNavigation() {
    updateActivePageIndicators();
    generateBreadcrumbs();
    createQuickNavMenu();
    setupKeyboardShortcuts();
    
    // Fechar menu rápido ao clicar fora
    document.addEventListener('click', function(event) {
        const quickNav = document.querySelector('.quick-nav-menu');
        const dropdown = document.getElementById('quick-nav-dropdown');
        
        if (quickNav && dropdown && !quickNav.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initNavigation);

// Exportar funções para uso global
window.Navigation = {
    navigateTo,
    goBack,
    generateBreadcrumbs,
    createQuickNavMenu,
    toggleQuickNav,
    updateActivePageIndicators,
    pageConfig
};



