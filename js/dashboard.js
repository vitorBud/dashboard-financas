// dashboard.js - Dashboard Financeiro Funcional

document.addEventListener("DOMContentLoaded", function() {
    console.log("Dashboard carregando...");
    
    // ======================
    // Configurações Iniciais
    // ======================
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    // Função para obter dados do localStorage com tratamento de erro
    function getLocalStorageData(key, defaultValue) {
        try {
            const data = localStorage.getItem(key);
            if (data === null || data === undefined || data === "undefined") {
                console.log(`Dados não encontrados para ${key}, usando valor padrão`);
                return defaultValue;
            }
            return JSON.parse(data);
        } catch (error) {
            console.error(`Erro ao carregar dados do localStorage para ${key}:`, error);
            return defaultValue;
        }
    }

    // Banco de dados local do usuário com tratamento robusto
    const userData = {
        transactions: getLocalStorageData("finance_transactions", []),
        budgets: getLocalStorageData("finance_budgets", []),
        categories: getLocalStorageData("finance_categories", [
            { id: 1, name: "Salário", type: "income", color: "#4cc9f0" },
            { id: 2, name: "Freelance", type: "income", color: "#4895ef" },
            { id: 3, name: "Investimentos", type: "income", color: "#4361ee" },
            { id: 4, name: "Moradia", type: "expense", color: "#f72585" },
            { id: 5, name: "Alimentação", type: "expense", color: "#b5179e" },
            { id: 6, name: "Transporte", type: "expense", color: "#7209b7" },
            { id: 7, name: "Lazer", type: "expense", color: "#560bad" },
            { id: 8, name: "Saúde", type: "expense", color: "#480ca8" }
        ])
    };

    // Estado da aplicação
    let state = {
        currentDate: new Date(),
        selectedMonth: new Date().getMonth(),
        selectedYear: new Date().getFullYear(),
        cashflowChart: null,
        expensesChart: null
    };

    // ======================
    // Função showAlert Global
    // ======================
    
    function showAlert(message, type = "info") {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Criar notificação visual simples
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

    // ======================
    // Funções Principais
    // ======================
    
    function init() {
        console.log("Inicializando dashboard...");
        
        try {
            updateCurrentMonthDisplay();
            initCharts();
            loadTransactions();
            loadBudgets();
            updateSummary();
            setupEventListeners();
            populateCategories();
            
            console.log("Dashboard inicializado com sucesso!");
        } catch (error) {
            console.error("Erro ao inicializar dashboard:", error);
            showAlert("Erro ao carregar o dashboard. Verifique o console para mais detalhes.", "error");
        }
    }

    function updateCurrentMonthDisplay() {
        const currentMonthEl = document.getElementById("current-month");
        if (currentMonthEl) {
            currentMonthEl.textContent = `${monthNames[state.selectedMonth]} ${state.selectedYear}`;
        }
    }

    // ======================
    // Funções de Transações
    // ======================
    
    function loadTransactions() {
        const transactionsBody = document.getElementById("transactions-body");
        if (!transactionsBody) {
            console.warn("Elemento transactions-body não encontrado");
            return;
        }
        
        transactionsBody.innerHTML = "";
        
        const filteredTransactions = userData.transactions.filter(t => {
            const transactionDate = new Date(t.date + "T00:00:00"); 
            return transactionDate.getMonth() === state.selectedMonth && 
                transactionDate.getFullYear() === state.selectedYear;
        });
        
        if (filteredTransactions.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td colspan="5" class="empty-message">
                    <i class="fas fa-wallet"></i>
                    <p>Nenhuma transação neste período</p>
                    <button class="btn btn-text add-first-transaction">Adicionar transação</button>
                </td>
            `;
            transactionsBody.appendChild(row);
            
            const addFirstBtn = row.querySelector(".add-first-transaction");
            if (addFirstBtn) {
                addFirstBtn.addEventListener("click", openTransactionModal);
            }
            return;
        }
        
        const sortedTransactions = [...filteredTransactions].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        // Mostrar apenas as 5 mais recentes
        const recentTransactions = sortedTransactions.slice(0, 5);
        
        recentTransactions.forEach(transaction => {
            const row = document.createElement("tr");
            
            const typeClass = transaction.type === "income" ? "income" : "expense";
            const typeIcon = transaction.type === "income" ? 
                '<i class="fas fa-arrow-down positive"></i>' : 
                '<i class="fas fa-arrow-up negative"></i>';
            
            row.innerHTML = `
                <td>${transaction.description}</td>
                <td><span class="category-badge" style="background-color: ${getCategoryColor(transaction.category)}">${transaction.category}</span></td>
                <td>${formatDate(transaction.date)}</td>
                <td class="transaction-amount ${typeClass}">
                    ${typeIcon} R$ ${transaction.amount.toFixed(2)}
                </td>
                <td class="transaction-actions">
                    <button data-id="${transaction.id}" class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button data-id="${transaction.id}" class="delete-btn"><i class="fas fa-trash"></i></button>
                </td>
            `;
            
            transactionsBody.appendChild(row);
        });
        
        // Adicionar event listeners para os botões
        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const id = this.getAttribute("data-id");
                editTransaction(id);
            });
        });
        
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const id = this.getAttribute("data-id");
                deleteTransaction(id);
            });
        });
    }

    function openTransactionModal() {
        const modal = document.getElementById("transaction-modal");
        const form = document.getElementById("transaction-form");
        
        if (!modal || !form) {
            console.error("Modal ou formulário não encontrado");
            return;
        }
        
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
        
        form.reset();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = "Salvar Transação";
            submitBtn.removeAttribute("data-id");
        }
        
        const dateInput = document.getElementById("transaction-date");
        if (dateInput) {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            dateInput.value = formattedDate;
        }
        populateCategories();
    }

    function closeTransactionModal() {
        const modal = document.getElementById("transaction-modal");
        if (!modal) return;
        
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }

    function handleTransactionSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const type = document.getElementById("transaction-type")?.value;
        const amount = parseFloat(document.getElementById("transaction-amount")?.value || 0);
        const description = document.getElementById("transaction-description")?.value;
        const categoryId = parseInt(document.getElementById("transaction-category")?.value || 0);
        const date = document.getElementById("transaction-date")?.value;
        const transactionId = form.querySelector('button[type="submit"]')?.getAttribute("data-id");
        
        if (!type || !amount || !description || !categoryId || !date) {
            showAlert("Por favor, preencha todos os campos.", "error");
            return;
        }
        
        if (amount <= 0) {
            showAlert("O valor deve ser maior que zero.", "error");
            return;
        }
        
        const category = userData.categories.find(c => c.id === categoryId);
        if (!category) {
            showAlert("Categoria inválida.", "error");
            return;
        }
        
        const transactionData = {
            id: transactionId || Date.now().toString(),
            description,
            category: category.name,
            date,
            amount,
            type
        };
        
        if (transactionId) {
            const index = userData.transactions.findIndex(t => t.id === transactionId);
            if (index !== -1) {
                userData.transactions[index] = transactionData;
                showAlert("Transação atualizada com sucesso!", "success");
            }
        } else {
            userData.transactions.push(transactionData);
            showAlert("Transação adicionada com sucesso!", "success");
        }
        
        saveData();
        loadTransactions();
        updateSummary();
        updateCharts();
        closeTransactionModal();
    }

    function editTransaction(id) {
        const transaction = userData.transactions.find(t => t.id === id);
        if (!transaction) return;
        
        const typeSelect = document.getElementById("transaction-type");
        if (typeSelect) {
            typeSelect.value = transaction.type;
        }
        populateCategories();
        
        setTimeout(() => {
            const category = userData.categories.find(c => c.name === transaction.category);
            const categorySelect = document.getElementById("transaction-category");
            if (category && categorySelect) {
                categorySelect.value = category.id;
            }
            
            const amountInput = document.getElementById("transaction-amount");
            const descriptionInput = document.getElementById("transaction-description");
            const dateInput = document.getElementById("transaction-date");
            
            if (amountInput) amountInput.value = transaction.amount;
            if (descriptionInput) descriptionInput.value = transaction.description;
            if (dateInput) dateInput.value = transaction.date;
            
            const form = document.getElementById("transaction-form");
            const submitBtn = form?.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = "Atualizar Transação";
                submitBtn.setAttribute("data-id", id);
            }
            
            openTransactionModal();
        }, 100);
    }

    function deleteTransaction(id) {
        if (confirm("Tem certeza que deseja excluir esta transação?")) {
            const index = userData.transactions.findIndex(t => t.id === id);
            if (index !== -1) {
                userData.transactions.splice(index, 1);
                saveData();
                loadTransactions();
                updateSummary();
                updateCharts();
                showAlert("Transação excluída com sucesso!", "success");
            }
        }
    }

    // ======================
    // Funções de Orçamentos
    // ======================
    
    function loadBudgets() {
        const budgetsList = document.querySelector(".budgets-list");
        if (!budgetsList) {
            console.warn("Elemento budgets-list não encontrado");
            return;
        }
        
        budgetsList.innerHTML = "";
        
        if (userData.budgets.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.className = "empty-message";
            emptyMessage.innerHTML = `
                <i class="fas fa-chart-pie"></i>
                <p>Nenhum orçamento configurado</p>
                <button class="btn btn-text add-first-budget">Criar orçamento</button>
            `;
            budgetsList.appendChild(emptyMessage);
            
            const addFirstBudgetBtn = emptyMessage.querySelector(".add-first-budget");
            if (addFirstBudgetBtn) {
                addFirstBudgetBtn.addEventListener("click", openBudgetModal);
            }
            return;
        }
        
        userData.budgets.forEach(budget => {
            const spent = userData.transactions
                .filter(t => t.type === "expense" && t.category === budget.category)
                .reduce((sum, t) => sum + t.amount, 0);
            
            const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
            let progressClass = "safe";
            
            if (percentage > 75 && percentage <= 90) {
                progressClass = "warning";
            } else if (percentage > 90) {
                progressClass = "danger";
            }
            
            const budgetItem = document.createElement("div");
            budgetItem.className = "budget-item";
            budgetItem.innerHTML = `
                <div class="budget-header">
                    <span class="budget-title">${budget.category}</span>
                    <span class="budget-amount">R$ ${spent.toFixed(2)} / R$ ${budget.amount.toFixed(2)}</span>
                </div>
                <div class="budget-progress">
                    <div class="budget-progress-bar ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="budget-footer">
                    <span>${percentage.toFixed(0)}% utilizado</span>
                    <span>R$ ${Math.max(budget.amount - spent, 0).toFixed(2)} restante</span>
                </div>
            `;
            
            budgetsList.appendChild(budgetItem);
        });
    }

    function openBudgetModal() {
        showAlert("Funcionalidade de orçamentos será implementada em breve!", "info");
    }

    // ======================
    // Funções de Resumo
    // ======================
    
    function updateSummary() {
        const filteredTransactions = userData.transactions.filter(t => {
            const transactionDate = new Date(t.date + "T00:00:00");
            return transactionDate.getMonth() === state.selectedMonth && 
                transactionDate.getFullYear() === state.selectedYear;
        });
        
        const income = filteredTransactions
            .filter(t => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expense = filteredTransactions
            .filter(t => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);
        
        const balance = income - expense;
        const savings = income > 0 ? income * 0.1 : 0; // 10% do income como meta de economia
        
        const incomeEl = document.getElementById("income-value");
        const expenseEl = document.getElementById("expense-value");
        const balanceEl = document.getElementById("balance-value");
        const savingsEl = document.getElementById("savings-value");
        
        if (incomeEl) incomeEl.textContent = `R$ ${income.toFixed(2)}`;
        if (expenseEl) expenseEl.textContent = `R$ ${expense.toFixed(2)}`;
        if (balanceEl) balanceEl.textContent = `R$ ${balance.toFixed(2)}`;
        if (savingsEl) savingsEl.textContent = `R$ ${savings.toFixed(2)}`;
    }

    // ======================
    // Funções de Gráficos
    // ======================
    
    function initCharts() {
        try {
            // Verificar se Chart.js está disponível
            if (typeof Chart === 'undefined') {
                console.warn("Chart.js não está carregado. Gráficos não serão exibidos.");
                return;
            }

            const cashflowCanvas = document.getElementById("cashflow-chart");
            const expensesCanvas = document.getElementById("expenses-chart");
            
            if (cashflowCanvas) {
                const ctx = cashflowCanvas.getContext("2d");
                state.cashflowChart = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: monthNames,
                        datasets: [
                            {
                                label: "Receitas",
                                data: Array(12).fill(0),
                                borderColor: "#4cc9f0",
                                backgroundColor: "rgba(76, 201, 240, 0.1)",
                                borderWidth: 2,
                                tension: 0.3,
                                fill: true
                            },
                            {
                                label: "Despesas",
                                data: Array(12).fill(0),
                                borderColor: "#f72585",
                                backgroundColor: "rgba(247, 37, 133, 0.1)",
                                borderWidth: 2,
                                tension: 0.3,
                                fill: true
                            }
                        ]
                    },
                    options: getChartOptions("R$")
                });
            }
            
            if (expensesCanvas) {
                const ctx = expensesCanvas.getContext("2d");
                state.expensesChart = new Chart(ctx, {
                    type: "doughnut",
                    data: {
                        labels: ["Nenhuma despesa"],
                        datasets: [{
                            data: [1],
                            backgroundColor: ["#e9ecef"],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: "right",
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.label;
                                    }
                                }
                            }
                        }
                    }
                });
            }
            
            updateCharts();
        } catch (error) {
            console.error("Erro ao inicializar gráficos:", error);
        }
    }

    function updateCharts() {
        if (!state.cashflowChart || !state.expensesChart) {
            console.warn("Gráficos não inicializados");
            return;
        }
        
        try {
            const monthlyData = calculateMonthlyData();
            state.cashflowChart.data.datasets[0].data = monthlyData.income;
            state.cashflowChart.data.datasets[1].data = monthlyData.expense;
            state.cashflowChart.update();
            
            const expenseData = calculateExpenseData();
            
            if (expenseData.labels.length > 0) {
                state.expensesChart.data.labels = expenseData.labels;
                state.expensesChart.data.datasets[0].data = expenseData.values;
                state.expensesChart.data.datasets[0].backgroundColor = expenseData.colors;
                state.expensesChart.options.plugins.tooltip.callbacks.label = function(context) {
                    const label = context.label || "";
                    const value = context.raw || 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                    return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
                };
            } else {
                state.expensesChart.data.labels = ["Nenhuma despesa"];
                state.expensesChart.data.datasets[0].data = [1];
                state.expensesChart.data.datasets[0].backgroundColor = ["#e9ecef"];
            }
            
            state.expensesChart.update();
        } catch (error) {
            console.error("Erro ao atualizar gráficos:", error);
        }
    }

    function calculateMonthlyData() {
        const income = Array(12).fill(0);
        const expense = Array(12).fill(0);
        
        userData.transactions.forEach(t => {
            const date = new Date(t.date + "T00:00:00");
            const year = date.getFullYear();
            
            if (year === state.selectedYear) {
                const month = date.getMonth();
                
                if (t.type === "income") {
                    income[month] += t.amount;
                } else {
                    expense[month] += t.amount;
                }
            }
        });
        
        return { income, expense };
    }

    function calculateExpenseData() {
        const expenseCategories = {};
        const currentYear = state.selectedYear; 
        
        userData.transactions
            .filter(t => t.type === "expense" && new Date(t.date + "T00:00:00").getFullYear() === currentYear)
            .forEach(t => {
                if (expenseCategories[t.category]) {
                    expenseCategories[t.category].value += t.amount;
                } else {
                    const category = userData.categories.find(c => c.name === t.category);
                    expenseCategories[t.category] = {
                        value: t.amount,
                        color: category ? category.color : "#6c757d"
                    };
                }
            });
        
        const labels = Object.keys(expenseCategories);
        
        if (labels.length === 0) {
            return { labels: [], values: [], colors: [] };
        }
        
        const values = Object.values(expenseCategories).map(item => item.value);
        const colors = Object.values(expenseCategories).map(item => item.color);
        
        return { labels, values, colors };
    }

    // ======================
    // Funções Auxiliares
    // ======================
    
    function populateCategories() {
        const categorySelect = document.getElementById("transaction-category");
        const typeSelect = document.getElementById("transaction-type");
        
        if (!categorySelect || !typeSelect) return;
        
        categorySelect.innerHTML = '<option value="">Selecione...</option>';
        
        const selectedType = typeSelect.value;
        if (!selectedType) return;
        
        const filteredCategories = userData.categories.filter(c => c.type === selectedType);
        
        filteredCategories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }

    function formatDate(dateString) {
        const options = { day: "2-digit", month: "2-digit", year: "numeric" };
        return new Date(dateString + "T00:00:00").toLocaleDateString("pt-BR", options);
    }

    function getCategoryColor(categoryName) {
        const category = userData.categories.find(c => c.name === categoryName);
        return category ? category.color : "#6c757d";
    }

    function saveData() {
        try {
            localStorage.setItem("finance_transactions", JSON.stringify(userData.transactions));
            localStorage.setItem("finance_budgets", JSON.stringify(userData.budgets));
            localStorage.setItem("finance_categories", JSON.stringify(userData.categories));
            console.log("Dados salvos com sucesso no localStorage");
        } catch (error) {
            console.error("Erro ao salvar dados:", error);
            showAlert("Erro ao salvar dados no navegador.", "error");
        }
    }

    function getChartOptions(prefix = "") {
        return {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || "";
                            if (label) {
                                label += ": ";
                            }
                            if (context.parsed.y !== null) {
                                label += prefix + " " + context.parsed.y.toFixed(2);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return prefix + " " + value;
                        }
                    }
                }
            },
            interaction: {
                mode: "nearest",
                axis: "x",
                intersect: false
            }
        };
    }

    // ======================
    // Event Listeners
    // ======================
    
    function setupEventListeners() {
        // Navegação de mês
        const prevMonthBtn = document.getElementById("prev-month");
        const nextMonthBtn = document.getElementById("next-month");
        
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener("click", () => {
                state.selectedMonth--;
                if (state.selectedMonth < 0) {
                    state.selectedMonth = 11;
                    state.selectedYear--;
                }
                updateCurrentMonthDisplay();
                loadTransactions();
                updateSummary();
                updateCharts();
            });
        }
        
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener("click", () => {
                state.selectedMonth++;
                if (state.selectedMonth > 11) {
                    state.selectedMonth = 0;
                    state.selectedYear++;
                }
                updateCurrentMonthDisplay();
                loadTransactions();
                updateSummary();
                updateCharts();
            });
        }
        
        // Modal de transação
        const addTransactionBtn = document.getElementById("add-transaction-btn");
        if (addTransactionBtn) {
            addTransactionBtn.addEventListener("click", openTransactionModal);
        }
        
        const closeModalBtns = document.querySelectorAll(".close-modal");
        closeModalBtns.forEach(btn => {
            btn.addEventListener("click", closeTransactionModal);
        });
        
        const cancelTransactionBtn = document.getElementById("cancel-transaction");
        if (cancelTransactionBtn) {
            cancelTransactionBtn.addEventListener("click", closeTransactionModal);
        }
        
        // Formulário de transação
        const transactionForm = document.getElementById("transaction-form");
        if (transactionForm) {
            transactionForm.addEventListener("submit", handleTransactionSubmit);
        }
        
        const transactionTypeSelect = document.getElementById("transaction-type");
        if (transactionTypeSelect) {
            transactionTypeSelect.addEventListener("change", populateCategories);
        }
        
        // Fechar modal clicando fora
        const modal = document.getElementById("transaction-modal");
        if (modal) {
            window.addEventListener("click", function(event) {
                if (event.target === modal) {
                    closeTransactionModal();
                }
            });
        }
        
        // Seletor de período do gráfico
        const chartPeriodSelect = document.getElementById("chart-period");
        if (chartPeriodSelect) {
            chartPeriodSelect.addEventListener("change", updateCharts);
        }
    }

    // ======================
    // Inicialização
    // ======================
    
    init();
});

