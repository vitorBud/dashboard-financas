// shared.js - Funcionalidades compartilhadas entre todas as páginas

// ======================
// Sistema de Navegação
// ======================

// Função para carregar o sidebar e ativar o link correto
function loadSidebar(activePage) {
    fetch("sidebar.html")
        .then(response => response.text())
        .then(data => {
            const sidebarPlaceholder = document.getElementById("sidebar-placeholder");
            if (sidebarPlaceholder) {
                sidebarPlaceholder.innerHTML = data;

                // Ativar link da página atual
                if (activePage) {
                    const activeLink = document.querySelector(`.${activePage}-link`);
                    if (activeLink) {
                        activeLink.classList.add("active");
                    }
                }

                // Carregar dados do usuário
                loadUserProfile();

                // 🔥 ADICIONAR FUNCIONALIDADE DO BOTÃO AQUI
                const toggleBtn = document.getElementById('menu-toggle');
                const sidebar = document.getElementById('sidebar');

                if (toggleBtn && sidebar) {
                    toggleBtn.addEventListener('click', () => {
                        sidebar.classList.toggle('active');
                    });
                }
            }
        })
        .catch(error => {
            console.error("Erro ao carregar sidebar:", error);
        });
}

// ======================
// Sistema de Dados do Usuário
// ======================

// Dados padrão do usuário
const defaultUserData = {
    name: "Usuário",
    email: "usuario@example.com",
    avatar: "image/defaultimg.png",
    phone: "",
    preferences: {
        currency: "BRL",
        language: "pt-BR",
        timezone: "America/Sao_Paulo",
        darkMode: false,
        emailReports: true,
        weeklySummary: true,
        startPage: "dashboard"
    },
    notifications: {
        alertsEmail: true,
        alertsApp: true,
        transactionsEmail: false,
        transactionsApp: true,
        budgetsEmail: true,
        budgetsApp: true
    }
};

// Função para carregar dados do usuário
function getUserData() {
    try {
        const userData = localStorage.getItem("userData");
        return userData ? JSON.parse(userData) : defaultUserData;
    } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        return defaultUserData;
    }
}

// Função para salvar dados do usuário
function saveUserData(userData) {
    try {
        localStorage.setItem("userData", JSON.stringify(userData));
        
        // Disparar evento para atualizar outras partes da aplicação
        window.dispatchEvent(new CustomEvent("profileUpdated", { detail: userData }));
        
        return true;
    } catch (error) {
        console.error("Erro ao salvar dados do usuário:", error);
        return false;
    }
}

// Função para carregar perfil do usuário no sidebar
function loadUserProfile() {
    const userData = getUserData();
    
    const userNameEl = document.querySelector(".user-name");
    const userEmailEl = document.querySelector(".user-email");
    const userAvatarEl = document.querySelector(".user-profile-img");
    
    if (userNameEl) userNameEl.textContent = userData.name;
    if (userEmailEl) userEmailEl.textContent = userData.email;
    if (userAvatarEl) userAvatarEl.src = userData.avatar;
}

// Função para atualizar perfil do usuário no sidebar
function updateUserProfile(userData) {
    const userNameEl = document.querySelector(".user-name");
    const userEmailEl = document.querySelector(".user-email");
    const userAvatarEl = document.querySelector(".user-profile-img");
    
    if (userNameEl) userNameEl.textContent = userData.name;
    if (userEmailEl) userEmailEl.textContent = userData.email;
    if (userAvatarEl) userAvatarEl.src = userData.avatar;
}

// ======================
// Sistema de Dados Financeiros
// ======================

// Categorias padrão
const defaultCategories = [
    { id: 1, name: "Salário", type: "income", color: "#4cc9f0", icon: "money-bill-wave" },
    { id: 2, name: "Freelance", type: "income", color: "#4895ef", icon: "laptop" },
    { id: 3, name: "Investimentos", type: "income", color: "#4361ee", icon: "chart-line" },
    { id: 4, name: "Moradia", type: "expense", color: "#f72585", icon: "home" },
    { id: 5, name: "Alimentação", type: "expense", color: "#b5179e", icon: "utensils" },
    { id: 6, name: "Transporte", type: "expense", color: "#7209b7", icon: "car" },
    { id: 7, name: "Lazer", type: "expense", color: "#560bad", icon: "film" },
    { id: 8, name: "Saúde", type: "expense", color: "#480ca8", icon: "heartbeat" }
];

// Função para obter categorias
function getCategories() {
    try {
        const categories = localStorage.getItem("finance_categories");
        return categories ? JSON.parse(categories) : defaultCategories;
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        return defaultCategories;
    }
}

// Função para salvar categorias
function saveCategories(categories) {
    try {
        localStorage.setItem("finance_categories", JSON.stringify(categories));
        return true;
    } catch (error) {
        console.error("Erro ao salvar categorias:", error);
        return false;
    }
}

// Função para obter transações
function getTransactions() {
    try {
        const transactions = localStorage.getItem("finance_transactions");
        return transactions ? JSON.parse(transactions) : [];
    } catch (error) {
        console.error("Erro ao carregar transações:", error);
        return [];
    }
}

// Função para salvar transações
function saveTransactions(transactions) {
    try {
        localStorage.setItem("finance_transactions", JSON.stringify(transactions));
        return true;
    } catch (error) {
        console.error("Erro ao salvar transações:", error);
        return false;
    }
}

// Função para obter orçamentos
function getBudgets() {
    try {
        const budgets = localStorage.getItem("finance_budgets");
        return budgets ? JSON.parse(budgets) : [];
    } catch (error) {
        console.error("Erro ao carregar orçamentos:", error);
        return [];
    }
}

// Função para salvar orçamentos
function saveBudgets(budgets) {
    try {
        localStorage.setItem("finance_budgets", JSON.stringify(budgets));
        return true;
    } catch (error) {
        console.error("Erro ao salvar orçamentos:", error);
        return false;
    }
}

// Função para obter alertas
function getAlerts() {
    try {
        const alerts = localStorage.getItem("finance_alerts");
        return alerts ? JSON.parse(alerts) : [];
    } catch (error) {
        console.error("Erro ao carregar alertas:", error);
        return [];
    }
}

// Função para salvar alertas
function saveAlerts(alerts) {
    try {
        localStorage.setItem("finance_alerts", JSON.stringify(alerts));
        return true;
    } catch (error) {
        console.error("Erro ao salvar alertas:", error);
        return false;
    }
}

// ======================
// Funções Utilitárias
// ======================

// Função para formatar data
function formatDate(dateString, format = "dd/mm/yyyy") {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    
    switch (format) {
        case "dd/mm/yyyy":
            return `${day}/${month}/${year}`;
        case "yyyy-mm-dd":
            return `${year}-${month}-${day}`;
        case "long":
            return date.toLocaleDateString("pt-BR", { 
                day: "numeric", 
                month: "long", 
                year: "numeric" 
            });
        default:
            return `${day}/${month}/${year}`;
    }
}

// Função para formatar moeda
function formatCurrency(value, currency = "BRL") {
    const userData = getUserData();
    const userCurrency = userData.preferences?.currency || currency;
    
    const formatters = {
        "BRL": new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }),
        "USD": new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
        "EUR": new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }),
        "GBP": new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" })
    };
    
    const formatter = formatters[userCurrency] || formatters["BRL"];
    return formatter.format(value);
}

// Função para mostrar notificações
function showNotification(message, type = "info", duration = 3000) {
    // Remover notificações existentes
    const existingNotifications = document.querySelectorAll(".notification");
    existingNotifications.forEach(notification => notification.remove());
    
    // Criar nova notificação
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Adicionar ao DOM
    document.body.appendChild(notification);
    
    // Remover automaticamente após o tempo especificado
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

// Função auxiliar para ícones de notificação
function getNotificationIcon(type) {
    const icons = {
        "success": "check-circle",
        "error": "exclamation-circle",
        "warning": "exclamation-triangle",
        "info": "info-circle"
    };
    return icons[type] || "info-circle";
}

// Função para validar formulários
function validateForm(formElement) {
    const requiredFields = formElement.querySelectorAll("[required]");
    let isValid = true;
    
    requiredFields.forEach(field => {
        const errorElement = document.getElementById(field.getAttribute("aria-describedby"));
        
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add("error");
            if (errorElement) {
                errorElement.textContent = "Este campo é obrigatório";
                errorElement.style.display = "block";
            }
        } else {
            field.classList.remove("error");
            if (errorElement) {
                errorElement.textContent = "";
                errorElement.style.display = "none";
            }
        }
    });
    
    return isValid;
}

// Função para limpar formulários
function clearForm(formElement) {
    const inputs = formElement.querySelectorAll("input, select, textarea");
    inputs.forEach(input => {
        if (input.type === "checkbox" || input.type === "radio") {
            input.checked = false;
        } else {
            input.value = "";
        }
        input.classList.remove("error");
    });
    
    const errorElements = formElement.querySelectorAll(".error-message");
    errorElements.forEach(error => {
        error.textContent = "";
        error.style.display = "none";
    });
}

// ======================
// Sistema de Modais
// ======================

// Função para abrir modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        
        // Focar no primeiro elemento focável
        const focusableElement = modal.querySelector("input, select, textarea, button");
        if (focusableElement) {
            focusableElement.focus();
        }
    }
}

// Função para fechar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "auto";
    }
}

// ======================
// Inicialização
// ======================

// Event listeners globais
document.addEventListener("DOMContentLoaded", function() {
    // Carregar sidebar automaticamente
    const currentPage = getCurrentPage();
    loadSidebar(currentPage);
    
    // Fechar modais ao clicar fora
    window.addEventListener("click", function(event) {
        if (event.target.classList.contains("modal")) {
            closeModal(event.target.id);
        }
    });
    
    // Fechar modais com ESC
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            const openModal = document.querySelector(".modal[style*=\"flex\"]");
            if (openModal) {
                closeModal(openModal.id);
            }
        }
    });
    
    // Event listeners para botões de fechar modal
    document.addEventListener("click", function(event) {
        if (event.target.classList.contains("close-modal")) {
            const modal = event.target.closest(".modal");
            if (modal) {
                closeModal(modal.id);
            }
        }
    });
    
    // Listener para atualizações de perfil
    window.addEventListener("profileUpdated", function(event) {
        updateUserProfile(event.detail);
    });
});

// Função para detectar a página atual
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split("/").pop().split(".")[0];
    
    // Mapear nomes de arquivo para classes CSS
    const pageMap = {
        "dashboard": "dashboard",
        "transacoes": "transacoes",
        "orcamentos": "orcamentos",
        "relatorios": "relatorios",
        "categorias": "categorias",
        "alertas": "alertas",
        "configuracoes": "configuracoes"
    };
    
    return pageMap[filename] || "dashboard";
}

// Exportar funções para uso global
window.FinanceApp = {
    loadSidebar,
    getUserData,
    saveUserData,
    updateUserProfile,
    getCategories,
    saveCategories,
    getTransactions,
    saveTransactions,
    getBudgets,
    saveBudgets,
    getAlerts,
    saveAlerts,
    formatDate,
    formatCurrency,
    showNotification,
    validateForm,
    clearForm,
    openModal,
    closeModal,
    getCurrentPage
};

