// configuracoes.js - Gerenciamento de Configurações

document.addEventListener("DOMContentLoaded", function() {
    // ======================
    // Estado e Configurações
    // ======================
    
    let userData = {};
    
    // Elementos DOM
    const DOM = {
        // Abas
        tabButtons: document.querySelectorAll(".tab-button"),
        tabContents: document.querySelectorAll(".tab-content"),
        
        // Formulários
        profileForm: document.getElementById("profile-form"),
        accountForm: document.getElementById("account-form"),
        preferencesForm: document.getElementById("preferences-form"),
        notificationsForm: document.getElementById("notifications-form"),
        
        // Campos do perfil
        profileName: document.getElementById("profile-name"),
        profileEmail: document.getElementById("profile-email"),
        profilePhone: document.getElementById("profile-phone"),
        profileAvatar: document.getElementById("profile-avatar"),
        avatarPreview: document.getElementById("avatar-preview"),
        
        // Campos da conta
        currentPassword: document.getElementById("current-password"),
        newPassword: document.getElementById("new-password"),
        confirmPassword: document.getElementById("confirm-password"),
        
        // Campos de preferências
        currency: document.getElementById("currency"),
        language: document.getElementById("language"),
        timezone: document.getElementById("timezone"),
        darkMode: document.getElementById("dark-mode"),
        emailReports: document.getElementById("email-reports"),
        weeklySummary: document.getElementById("weekly-summary"),
        startPage: document.getElementById("start-page"),
        
        // Campos de notificações
        alertsEmail: document.getElementById("alerts-email"),
        alertsApp: document.getElementById("alerts-app"),
        transactionsEmail: document.getElementById("transactions-email"),
        transactionsApp: document.getElementById("transactions-app"),
        budgetsEmail: document.getElementById("budgets-email"),
        budgetsApp: document.getElementById("budgets-app"),
        
        // Botões de ação
        exportDataBtn: document.getElementById("export-data"),
        importDataBtn: document.getElementById("import-data"),
        importFileInput: document.getElementById("import-file"),
        resetDataBtn: document.getElementById("reset-data"),
        deleteAccountBtn: document.getElementById("delete-account")
    };
    
    // ======================
    // Funções de Inicialização
    // ======================
    
    function init() {
        loadUserData();
        setupEventListeners();
        setupTabs();
        populateFields();
        console.log("Configurações inicializadas");
    }
    
    function loadUserData() {
        // Usar a função global se disponível
        if (window.FinanceApp && window.FinanceApp.getUserData) {
            userData = window.FinanceApp.getUserData();
        } else {
            // Fallback
            try {
                const stored = localStorage.getItem("userData");
                userData = stored ? JSON.parse(stored) : getDefaultUserData();
            } catch (error) {
                console.error("Erro ao carregar dados do usuário:", error);
                userData = getDefaultUserData();
            }
        }
    }
    
    function getDefaultUserData() {
        return {
            name: "Usuário",
            email: "usuario@example.com",
            phone: "",
            avatar: "image/defaultimg.png",
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
    }
    
    // ======================
    // Funções de Abas
    // ======================
    
    function setupTabs() {
        DOM.tabButtons.forEach(button => {
            button.addEventListener("click", function() {
                const targetTab = this.getAttribute("data-tab");
                switchTab(targetTab);
            });
        });
        
        // Ativar primeira aba por padrão
        if (DOM.tabButtons.length > 0) {
            const firstTab = DOM.tabButtons[0].getAttribute("data-tab");
            switchTab(firstTab);
        }
    }
    
    function switchTab(tabName) {
        // Remover classe ativa de todas as abas
        DOM.tabButtons.forEach(btn => btn.classList.remove("active"));
        DOM.tabContents.forEach(content => content.classList.remove("active"));
        
        // Ativar aba selecionada
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(`${tabName}-tab`);
        
        if (activeButton) activeButton.classList.add("active");
        if (activeContent) activeContent.classList.add("active");
    }
    
    // ======================
    // Funções de Preenchimento
    // ======================
    
    function populateFields() {
        // Perfil
        if (DOM.profileName) DOM.profileName.value = userData.name || "";
        if (DOM.profileEmail) DOM.profileEmail.value = userData.email || "";
        if (DOM.profilePhone) DOM.profilePhone.value = userData.phone || "";
        if (DOM.avatarPreview) DOM.avatarPreview.src = userData.avatar || "image/defaultimg.png";
        
        // Preferências
        if (DOM.currency) DOM.currency.value = userData.preferences?.currency || "BRL";
        if (DOM.language) DOM.language.value = userData.preferences?.language || "pt-BR";
        if (DOM.timezone) DOM.timezone.value = userData.preferences?.timezone || "America/Sao_Paulo";
        if (DOM.darkMode) DOM.darkMode.checked = userData.preferences?.darkMode || false;
        if (DOM.emailReports) DOM.emailReports.checked = userData.preferences?.emailReports !== false;
        if (DOM.weeklySummary) DOM.weeklySummary.checked = userData.preferences?.weeklySummary !== false;
        if (DOM.startPage) DOM.startPage.value = userData.preferences?.startPage || "dashboard";
        
        // Notificações
        if (DOM.alertsEmail) DOM.alertsEmail.checked = userData.notifications?.alertsEmail !== false;
        if (DOM.alertsApp) DOM.alertsApp.checked = userData.notifications?.alertsApp !== false;
        if (DOM.transactionsEmail) DOM.transactionsEmail.checked = userData.notifications?.transactionsEmail || false;
        if (DOM.transactionsApp) DOM.transactionsApp.checked = userData.notifications?.transactionsApp !== false;
        if (DOM.budgetsEmail) DOM.budgetsEmail.checked = userData.notifications?.budgetsEmail !== false;
        if (DOM.budgetsApp) DOM.budgetsApp.checked = userData.notifications?.budgetsApp !== false;
    }
    
    // ======================
    // Funções de Salvamento
    // ======================
    
    function saveProfile(e) {
        e.preventDefault();
        
        const name = DOM.profileName?.value?.trim();
        const email = DOM.profileEmail?.value?.trim();
        const phone = DOM.profilePhone?.value?.trim();
        
        if (!name || !email) {
            showAlert("Nome e email são obrigatórios.", "error");
            return;
        }
        
        if (!isValidEmail(email)) {
            showAlert("Email inválido.", "error");
            return;
        }
        
        userData.name = name;
        userData.email = email;
        userData.phone = phone;
        
        saveUserData();
        showAlert("Perfil atualizado com sucesso!", "success");
    }
    
    function saveAccount(e) {
        e.preventDefault();
        
        const currentPassword = DOM.currentPassword?.value;
        const newPassword = DOM.newPassword?.value;
        const confirmPassword = DOM.confirmPassword?.value;
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            showAlert("Todos os campos de senha são obrigatórios.", "error");
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showAlert("A nova senha e a confirmação não coincidem.", "error");
            return;
        }
        
        if (newPassword.length < 6) {
            showAlert("A nova senha deve ter pelo menos 6 caracteres.", "error");
            return;
        }
        
        // Simular alteração de senha (em uma aplicação real, isso seria feito no backend)
        showAlert("Senha alterada com sucesso!", "success");
        
        // Limpar campos
        if (DOM.currentPassword) DOM.currentPassword.value = "";
        if (DOM.newPassword) DOM.newPassword.value = "";
        if (DOM.confirmPassword) DOM.confirmPassword.value = "";
    }
    
    function savePreferences(e) {
        e.preventDefault();
        
        userData.preferences = {
            currency: DOM.currency?.value || "BRL",
            language: DOM.language?.value || "pt-BR",
            timezone: DOM.timezone?.value || "America/Sao_Paulo",
            darkMode: DOM.darkMode?.checked || false,
            emailReports: DOM.emailReports?.checked || false,
            weeklySummary: DOM.weeklySummary?.checked || false,
            startPage: DOM.startPage?.value || "dashboard"
        };
        
        saveUserData();
        showAlert("Preferências salvas com sucesso!", "success");
        
        // Aplicar tema escuro se necessário
        if (userData.preferences.darkMode) {
            document.body.classList.add("dark-theme");
        } else {
            document.body.classList.remove("dark-theme");
        }
    }
    
    function saveNotifications(e) {
        e.preventDefault();
        
        userData.notifications = {
            alertsEmail: DOM.alertsEmail?.checked || false,
            alertsApp: DOM.alertsApp?.checked || false,
            transactionsEmail: DOM.transactionsEmail?.checked || false,
            transactionsApp: DOM.transactionsApp?.checked || false,
            budgetsEmail: DOM.budgetsEmail?.checked || false,
            budgetsApp: DOM.budgetsApp?.checked || false
        };
        
        saveUserData();
        showAlert("Configurações de notificação salvas!", "success");
    }
    
    function saveUserData() {
        try {
            if (window.FinanceApp && window.FinanceApp.saveUserData) {
                window.FinanceApp.saveUserData(userData);
            } else {
                localStorage.setItem("userData", JSON.stringify(userData));
            }
            
            // Disparar evento para atualizar outras partes da aplicação
            window.dispatchEvent(new CustomEvent("profileUpdated", { detail: userData }));
            
            return true;
        } catch (error) {
            console.error("Erro ao salvar dados do usuário:", error);
            showAlert("Erro ao salvar dados.", "error");
            return false;
        }
    }
    
    // ======================
    // Funções de Avatar
    // ======================
    
    function handleAvatarChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith("image/")) {
            showAlert("Por favor, selecione uma imagem válida.", "error");
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) { // 2MB
            showAlert("A imagem deve ter no máximo 2MB.", "error");
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            userData.avatar = imageData;
            
            if (DOM.avatarPreview) {
                DOM.avatarPreview.src = imageData;
            }
            
            saveUserData();
            showAlert("Avatar atualizado com sucesso!", "success");
        };
        
        reader.readAsDataURL(file);
    }
    
    // ======================
    // Funções de Backup/Importação
    // ======================
    
    function exportData() {
        try {
            const data = {
                userData: userData,
                transactions: JSON.parse(localStorage.getItem("finance_transactions") || "[]"),
                categories: JSON.parse(localStorage.getItem("finance_categories") || "[]"),
                budgets: JSON.parse(localStorage.getItem("finance_budgets") || "[]"),
                alerts: JSON.parse(localStorage.getItem("finance_alerts") || "[]"),
                exportDate: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(data, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `financas_backup_${new Date().toISOString().split("T")[0]}.json`;
            link.click();
            
            showAlert("Dados exportados com sucesso!", "success");
        } catch (error) {
            console.error("Erro ao exportar dados:", error);
            showAlert("Erro ao exportar dados.", "error");
        }
    }
    
    function importData() {
        if (DOM.importFileInput) {
            DOM.importFileInput.click();
        }
    }
    
    function handleImportFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.type !== "application/json") {
            showAlert("Por favor, selecione um arquivo JSON válido.", "error");
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.userData || !data.transactions) {
                    showAlert("Arquivo de backup inválido.", "error");
                    return;
                }
                
                if (confirm("Isso substituirá todos os seus dados atuais. Deseja continuar?")) {
                    // Importar dados
                    userData = data.userData;
                    localStorage.setItem("userData", JSON.stringify(userData));
                    localStorage.setItem("finance_transactions", JSON.stringify(data.transactions || []));
                    localStorage.setItem("finance_categories", JSON.stringify(data.categories || []));
                    localStorage.setItem("finance_budgets", JSON.stringify(data.budgets || []));
                    localStorage.setItem("finance_alerts", JSON.stringify(data.alerts || []));
                    
                    // Atualizar interface
                    populateFields();
                    
                    showAlert("Dados importados com sucesso! Recarregue a página para ver as mudanças.", "success");
                }
            } catch (error) {
                console.error("Erro ao importar dados:", error);
                showAlert("Erro ao processar arquivo de backup.", "error");
            }
        };
        
        reader.readAsText(file);
    }
    
    function resetAllData() {
        if (!confirm("Isso apagará TODOS os seus dados permanentemente. Esta ação não pode ser desfeita. Deseja continuar?")) {
            return;
        }
        
        if (!confirm("Tem CERTEZA ABSOLUTA? Todos os dados serão perdidos!")) {
            return;
        }
        
        try {
            // Limpar localStorage
            localStorage.removeItem("userData");
            localStorage.removeItem("finance_transactions");
            localStorage.removeItem("finance_categories");
            localStorage.removeItem("finance_budgets");
            localStorage.removeItem("finance_alerts");
            
            showAlert("Todos os dados foram apagados. Recarregando a página...", "success");
            
            // Recarregar página após 2 segundos
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error("Erro ao resetar dados:", error);
            showAlert("Erro ao resetar dados.", "error");
        }
    }
    
    function deleteAccount() {
        if (!confirm("Isso excluirá sua conta e TODOS os dados permanentemente. Esta ação não pode ser desfeita. Deseja continuar?")) {
            return;
        }
        
        if (!confirm("Digite 'EXCLUIR' para confirmar:") !== "EXCLUIR") {
            showAlert("Confirmação incorreta. Operação cancelada.", "info");
            return;
        }
        
        resetAllData();
    }
    
    // ======================
    // Funções Auxiliares
    // ======================
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function showAlert(message, type = "info") {
        if (window.FinanceApp && window.FinanceApp.showNotification) {
            window.FinanceApp.showNotification(message, type);
        } else {
            alert(message);
        }
    }
    
    // ======================
    // Event Listeners
    // ======================
    
    function setupEventListeners() {
        // Formulários
        if (DOM.profileForm) {
            DOM.profileForm.addEventListener("submit", saveProfile);
        }
        
        if (DOM.accountForm) {
            DOM.accountForm.addEventListener("submit", saveAccount);
        }
        
        if (DOM.preferencesForm) {
            DOM.preferencesForm.addEventListener("submit", savePreferences);
        }
        
        if (DOM.notificationsForm) {
            DOM.notificationsForm.addEventListener("submit", saveNotifications);
        }
        
        // Avatar
        if (DOM.profileAvatar) {
            DOM.profileAvatar.addEventListener("change", handleAvatarChange);
        }
        
        // Botões de ação
        if (DOM.exportDataBtn) {
            DOM.exportDataBtn.addEventListener("click", exportData);
        }
        
        if (DOM.importDataBtn) {
            DOM.importDataBtn.addEventListener("click", importData);
        }
        
        if (DOM.importFileInput) {
            DOM.importFileInput.addEventListener("change", handleImportFile);
        }
        
        if (DOM.resetDataBtn) {
            DOM.resetDataBtn.addEventListener("click", resetAllData);
        }
        
        if (DOM.deleteAccountBtn) {
            DOM.deleteAccountBtn.addEventListener("click", deleteAccount);
        }
        
        // Aplicar tema escuro se necessário
        if (userData.preferences?.darkMode) {
            document.body.classList.add("dark-theme");
        }
    }
    
    // ======================
    // Inicialização
    // ======================
    
    init();
});

