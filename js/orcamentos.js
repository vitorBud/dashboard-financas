// orcamentos.js - Página de Orçamentos

document.addEventListener("DOMContentLoaded", function() {
    // ======================
    // Configurações e Estado
    // ======================
    
    let budgets = [];
    let transactions = [];
    let categories = [];
    let editingBudgetId = null;
    let currentPeriod = "monthly";
    
    // Elementos DOM
    const DOM = {
        // Controles de período
        periodSelect: document.getElementById("budget-period"),
        
        // Cards de resumo
        totalBudgeted: document.getElementById("total-budgeted"),
        totalSpent: document.getElementById("total-spent"),
        totalRemaining: document.getElementById("total-remaining"),
        utilizationRate: document.getElementById("utilization-rate"),
        
        // Lista de orçamentos
        budgetsList: document.getElementById("budgets-list"),
        sortBtn: document.getElementById("sort-budgets"),
        
        // Modal
        modal: document.getElementById("budget-modal"),
        modalTitle: document.getElementById("modal-budget-title"),
        form: document.getElementById("budget-form"),
        categorySelect: document.getElementById("budget-category"),
        amountInput: document.getElementById("budget-amount"),
        budgetPeriodSelect: document.getElementById("budget-period"),
        
        // Botões
        addBtn: document.getElementById("add-budget"),
        cancelBtn: document.getElementById("cancel-budget"),
        closeBtn: document.querySelector(".close-modal")
    };
    
    // ======================
    // Funções de Inicialização
    // ======================
    
    function init() {
        loadData();
        setupEventListeners();
        populateCategorySelect();
        updateSummary();
        renderBudgets();
        console.log("Página de orçamentos inicializada");
    }
    
    function loadData() {
        budgets = JSON.parse(localStorage.getItem("finance_budgets") || "[]");
        transactions = JSON.parse(localStorage.getItem("finance_transactions") || "[]");
        categories = JSON.parse(localStorage.getItem("finance_categories") || "[]");
    }
    
    function populateCategorySelect() {
        if (!DOM.categorySelect) return;
        
        DOM.categorySelect.innerHTML = '<option value="">Selecione...</option>';
        
        // Apenas categorias de despesa podem ter orçamentos
        const expenseCategories = categories.filter(c => c.type === "expense");
        
        expenseCategories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.name;
            option.textContent = category.name;
            DOM.categorySelect.appendChild(option);
        });
    }
    
    // ======================
    // Funções de Cálculo
    // ======================
    
    function getCurrentPeriodTransactions() {
        const now = new Date();
        let startDate, endDate;
        
        switch (currentPeriod) {
            case "monthly":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case "quarterly":
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
                break;
            case "yearly":
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }
        
        return transactions.filter(t => {
            const transactionDate = new Date(t.date + "T00:00:00");
            return transactionDate >= startDate && transactionDate <= endDate;
        });
    }
    
    function calculateBudgetSpent(budget) {
        const periodTransactions = getCurrentPeriodTransactions();
        return periodTransactions
            .filter(t => t.type === "expense" && t.category === budget.category)
            .reduce((sum, t) => sum + t.amount, 0);
    }
    
    function updateSummary() {
        const periodBudgets = budgets.filter(b => b.period === currentPeriod);
        
        const totalBudgeted = periodBudgets.reduce((sum, b) => sum + b.amount, 0);
        let totalSpent = 0;
        
        periodBudgets.forEach(budget => {
            totalSpent += calculateBudgetSpent(budget);
        });
        
        const totalRemaining = Math.max(totalBudgeted - totalSpent, 0);
        const utilization = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
        
        if (DOM.totalBudgeted) DOM.totalBudgeted.textContent = `R$ ${totalBudgeted.toFixed(2)}`;
        if (DOM.totalSpent) DOM.totalSpent.textContent = `R$ ${totalSpent.toFixed(2)}`;
        if (DOM.totalRemaining) DOM.totalRemaining.textContent = `R$ ${totalRemaining.toFixed(2)}`;
        if (DOM.utilizationRate) DOM.utilizationRate.textContent = `${utilization.toFixed(0)}%`;
    }
    
    // ======================
    // Funções de Renderização
    // ======================
    
    function renderBudgets() {
        if (!DOM.budgetsList) return;
        
        DOM.budgetsList.innerHTML = "";
        
        const periodBudgets = budgets.filter(b => b.period === currentPeriod);
        
        if (periodBudgets.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.className = "empty-message";
            emptyMessage.innerHTML = `
                <i class="fas fa-chart-pie"></i>
                <p>Nenhum orçamento ${getPeriodLabel(currentPeriod)} configurado</p>
                <button class="btn btn-text add-first-budget">Criar primeiro orçamento</button>
            `;
            DOM.budgetsList.appendChild(emptyMessage);
            
            const addFirstBtn = emptyMessage.querySelector(".add-first-budget");
            if (addFirstBtn) {
                addFirstBtn.addEventListener("click", openModal);
            }
            return;
        }
        
        // Ordenar orçamentos por utilização (maior para menor)
        const sortedBudgets = [...periodBudgets].sort((a, b) => {
            const spentA = calculateBudgetSpent(a);
            const spentB = calculateBudgetSpent(b);
            const utilizationA = a.amount > 0 ? (spentA / a.amount) * 100 : 0;
            const utilizationB = b.amount > 0 ? (spentB / b.amount) * 100 : 0;
            return utilizationB - utilizationA;
        });
        
        sortedBudgets.forEach(budget => {
            const budgetCard = createBudgetCard(budget);
            DOM.budgetsList.appendChild(budgetCard);
        });
    }
    
    function createBudgetCard(budget) {
        const spent = calculateBudgetSpent(budget);
        const remaining = Math.max(budget.amount - spent, 0);
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
        
        let progressClass = "safe";
        let statusIcon = "check-circle";
        let statusText = "No limite";
        
        if (percentage > 75 && percentage <= 90) {
            progressClass = "warning";
            statusIcon = "exclamation-triangle";
            statusText = "Atenção";
        } else if (percentage > 90 && percentage <= 100) {
            progressClass = "danger";
            statusIcon = "exclamation-circle";
            statusText = "Limite próximo";
        } else if (percentage > 100) {
            progressClass = "exceeded";
            statusIcon = "times-circle";
            statusText = "Limite excedido";
        }
        
        const card = document.createElement("div");
        card.className = "budget-card";
        
        const category = categories.find(c => c.name === budget.category);
        const categoryColor = category ? category.color : "#6c757d";
        
        card.innerHTML = `
            <div class="budget-header">
                <div class="budget-category">
                    <div class="category-icon" style="background-color: ${categoryColor}">
                        <i class="fas fa-${category?.icon || 'tag'}"></i>
                    </div>
                    <div class="category-info">
                        <h4>${budget.category}</h4>
                        <span class="budget-period">${getPeriodLabel(budget.period)}</span>
                    </div>
                </div>
                <div class="budget-status ${progressClass}">
                    <i class="fas fa-${statusIcon}"></i>
                    <span>${statusText}</span>
                </div>
                <div class="budget-actions">
                    <button class="btn-icon edit-budget" data-id="${budget.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-budget" data-id="${budget.id}" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="budget-amounts">
                <div class="amount-item">
                    <span class="amount-label">Orçado</span>
                    <span class="amount-value">R$ ${budget.amount.toFixed(2)}</span>
                </div>
                <div class="amount-item">
                    <span class="amount-label">Gasto</span>
                    <span class="amount-value spent">R$ ${spent.toFixed(2)}</span>
                </div>
                <div class="amount-item">
                    <span class="amount-label">Restante</span>
                    <span class="amount-value ${remaining > 0 ? 'remaining' : 'exceeded'}">
                        R$ ${remaining.toFixed(2)}
                    </span>
                </div>
            </div>
            
            <div class="budget-progress">
                <div class="progress-bar">
                    <div class="progress-fill ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="progress-info">
                    <span class="progress-percentage">${percentage.toFixed(1)}%</span>
                    <span class="progress-text">utilizado</span>
                </div>
            </div>
        `;
        
        // Adicionar event listeners
        const editBtn = card.querySelector(".edit-budget");
        const deleteBtn = card.querySelector(".delete-budget");
        
        if (editBtn) {
            editBtn.addEventListener("click", function() {
                const id = parseInt(this.getAttribute("data-id"));
                editBudget(id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener("click", function() {
                const id = parseInt(this.getAttribute("data-id"));
                deleteBudget(id);
            });
        }
        
        return card;
    }
    
    // ======================
    // Funções do Modal
    // ======================
    
    function openModal() {
        if (!DOM.modal) return;
        
        DOM.modal.style.display = "flex";
        document.body.style.overflow = "hidden";
        
        // Resetar formulário
        if (DOM.form) DOM.form.reset();
        
        // Configurar período padrão
        if (DOM.budgetPeriodSelect) {
            DOM.budgetPeriodSelect.value = currentPeriod;
        }
        
        // Configurar título
        if (DOM.modalTitle) {
            DOM.modalTitle.textContent = editingBudgetId ? "Editar Orçamento" : "Criar Orçamento";
        }
        
        populateCategorySelect();
    }
    
    function closeModal() {
        if (!DOM.modal) return;
        
        DOM.modal.style.display = "none";
        document.body.style.overflow = "auto";
        editingBudgetId = null;
    }
    
    // ======================
    // Funções CRUD
    // ======================
    
    function addBudget() {
        editingBudgetId = null;
        openModal();
    }
    
    function editBudget(id) {
        const budget = budgets.find(b => b.id === id);
        if (!budget) return;
        
        editingBudgetId = id;
        
        // Preencher formulário
        if (DOM.categorySelect) DOM.categorySelect.value = budget.category;
        if (DOM.amountInput) DOM.amountInput.value = budget.amount;
        if (DOM.budgetPeriodSelect) DOM.budgetPeriodSelect.value = budget.period;
        
        openModal();
    }
    
    function deleteBudget(id) {
        const budget = budgets.find(b => b.id === id);
        if (!budget) return;
        
        if (!confirm(`Tem certeza que deseja excluir o orçamento de "${budget.category}"?`)) {
            return;
        }
        
        const index = budgets.findIndex(b => b.id === id);
        if (index !== -1) {
            budgets.splice(index, 1);
            saveData();
            updateSummary();
            renderBudgets();
            showAlert("Orçamento excluído com sucesso!", "success");
        }
    }
    
    function saveBudget(e) {
        e.preventDefault();
        
        const category = DOM.categorySelect?.value?.trim();
        const amount = parseFloat(DOM.amountInput?.value || 0);
        const period = DOM.budgetPeriodSelect?.value;
        
        // Validação
        if (!category || !amount || !period) {
            showAlert("Por favor, preencha todos os campos.", "error");
            return;
        }
        
        if (amount <= 0) {
            showAlert("O valor deve ser maior que zero.", "error");
            return;
        }
        
        // Verificar se já existe orçamento para esta categoria e período
        const existingBudget = budgets.find(b => 
            b.category === category && 
            b.period === period && 
            b.id !== editingBudgetId
        );
        
        if (existingBudget) {
            showAlert("Já existe um orçamento para esta categoria neste período.", "error");
            return;
        }
        
        const budgetData = {
            id: editingBudgetId || Date.now(),
            category,
            amount,
            period,
            createdAt: editingBudgetId ? 
                budgets.find(b => b.id === editingBudgetId)?.createdAt : 
                new Date().toISOString()
        };
        
        if (editingBudgetId) {
            const index = budgets.findIndex(b => b.id === editingBudgetId);
            if (index !== -1) {
                budgets[index] = budgetData;
                showAlert("Orçamento atualizado com sucesso!", "success");
            }
        } else {
            budgets.push(budgetData);
            showAlert("Orçamento criado com sucesso!", "success");
        }
        
        saveData();
        updateSummary();
        renderBudgets();
        closeModal();
    }
    
    // ======================
    // Funções Auxiliares
    // ======================
    
    function getPeriodLabel(period) {
        const labels = {
            "monthly": "Mensal",
            "quarterly": "Trimestral",
            "yearly": "Anual"
        };
        return labels[period] || period;
    }
    
    function saveData() {
        try {
            localStorage.setItem("finance_budgets", JSON.stringify(budgets));
        } catch (error) {
            console.error("Erro ao salvar dados:", error);
            showAlert("Erro ao salvar dados.", "error");
        }
    }
    
    function showAlert(message, type = "info") {
        if (window.FinanceApp && window.FinanceApp.showNotification) {
            window.FinanceApp.showNotification(message, type);
        } else {
            // Fallback para notificação simples
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'error' ? '#f72585' : type === 'success' ? '#4cc9f0' : '#6c757d'};
                color: white;
                padding: 15px 20px;
                border-radius: 5px;
                z-index: 10000;
                font-family: Arial, sans-serif;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            `;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        }
    }
    
    // ======================
    // Event Listeners
    // ======================
    
    function setupEventListeners() {
        // Seletor de período
        if (DOM.periodSelect) {
            DOM.periodSelect.addEventListener("change", function() {
                currentPeriod = this.value;
                updateSummary();
                renderBudgets();
            });
        }
        
        // Botão adicionar orçamento
        if (DOM.addBtn) {
            DOM.addBtn.addEventListener("click", addBudget);
        }
        
        // Botão ordenar (funcionalidade futura)
        if (DOM.sortBtn) {
            DOM.sortBtn.addEventListener("click", function() {
                showAlert("Funcionalidade de ordenação personalizada será implementada em breve!", "info");
            });
        }
        
        // Modal
        if (DOM.closeBtn) {
            DOM.closeBtn.addEventListener("click", closeModal);
        }
        
        if (DOM.cancelBtn) {
            DOM.cancelBtn.addEventListener("click", closeModal);
        }
        
        if (DOM.form) {
            DOM.form.addEventListener("submit", saveBudget);
        }
        
        // Fechar modal ao clicar fora
        window.addEventListener("click", function(event) {
            if (event.target === DOM.modal) {
                closeModal();
            }
        });
        
        // Fechar modal com ESC
        document.addEventListener("keydown", function(event) {
            if (event.key === "Escape" && DOM.modal && DOM.modal.style.display === "flex") {
                closeModal();
            }
        });
    }
    
    // ======================
    // Inicialização
    // ======================
    
    init();
});

