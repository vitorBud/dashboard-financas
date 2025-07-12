// relatorios.js - Página de Relatórios

document.addEventListener("DOMContentLoaded", function() {
    // ======================
    // Configurações e Estado
    // ======================
    
    let transactions = [];
    let categories = [];
    let budgets = [];
    let currentChart = null;
    let currentReportData = {};
    
    // Elementos DOM
    const DOM = {
        // Filtros e controles
        periodSelect: document.getElementById("report-period"),
        customDates: document.getElementById("custom-report-dates"),
        startDate: document.getElementById("report-start-date"),
        endDate: document.getElementById("report-end-date"),
        reportType: document.getElementById("report-type"),
        applyFiltersBtn: document.getElementById("apply-filters"),
        
        // Botões de ação
        generatePdfBtn: document.getElementById("generate-report"),
        exportExcelBtn: document.getElementById("export-report"),
        
        // Gráfico e resumo
        chartCanvas: document.getElementById("main-report-chart"),
        totalIncome: document.getElementById("total-income"),
        totalExpense: document.getElementById("total-expense"),
        reportBalance: document.getElementById("report-balance"),
        reportSavings: document.getElementById("report-savings"),
        
        // Tabela de detalhes
        detailsBody: document.getElementById("report-details-body")
    };
    
    // ======================
    // Funções de Inicialização
    // ======================
    
    function init() {
        loadData();
        setupEventListeners();
        setDefaultPeriod();
        generateReport();
        console.log("Página de relatórios inicializada");
    }
    
    function loadData() {
        transactions = JSON.parse(localStorage.getItem("finance_transactions") || "[]");
        categories = JSON.parse(localStorage.getItem("finance_categories") || "[]");
        budgets = JSON.parse(localStorage.getItem("finance_budgets") || "[]");
    }
    
    function setDefaultPeriod() {
        if (DOM.periodSelect) {
            DOM.periodSelect.value = "this-month";
        }
        updateDateInputs();
    }
    
    // ======================
    // Funções de Filtros
    // ======================
    
    function updateDateInputs() {
        const period = DOM.periodSelect?.value;
        
        if (period === "custom") {
            if (DOM.customDates) {
                DOM.customDates.style.display = "flex";
            }
        } else {
            if (DOM.customDates) {
                DOM.customDates.style.display = "none";
            }
        }
    }
    
    function getDateRange() {
        const period = DOM.periodSelect?.value;
        const now = new Date();
        let startDate, endDate;
        
        switch (period) {
            case "this-month":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case "last-month":
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case "this-year":
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            case "last-year":
                startDate = new Date(now.getFullYear() - 1, 0, 1);
                endDate = new Date(now.getFullYear() - 1, 11, 31);
                break;
            case "custom":
                if (DOM.startDate?.value && DOM.endDate?.value) {
                    startDate = new Date(DOM.startDate.value);
                    endDate = new Date(DOM.endDate.value);
                } else {
                    // Fallback para este mês se datas customizadas não estão definidas
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                }
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }
        
        return { startDate, endDate };
    }
    
    function filterTransactionsByDate(transactions, startDate, endDate) {
        return transactions.filter(t => {
            const transactionDate = new Date(t.date + "T00:00:00");
            return transactionDate >= startDate && transactionDate <= endDate;
        });
    }
    
    // ======================
    // Funções de Geração de Relatórios
    // ======================
    
    function generateReport() {
        const { startDate, endDate } = getDateRange();
        const filteredTransactions = filterTransactionsByDate(transactions, startDate, endDate);
        const reportType = DOM.reportType?.value || "cashflow";
        
        currentReportData = {
            transactions: filteredTransactions,
            startDate,
            endDate,
            type: reportType
        };
        
        updateSummary(filteredTransactions);
        updateChart(reportType, filteredTransactions, startDate, endDate);
        updateDetailsTable(filteredTransactions);
    }
    
    function updateSummary(filteredTransactions) {
        const income = filteredTransactions
            .filter(t => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expense = filteredTransactions
            .filter(t => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);
        
        const balance = income - expense;
        const savings = income > 0 ? income * 0.1 : 0; // Meta de 10% de economia
        
        if (DOM.totalIncome) DOM.totalIncome.textContent = `R$ ${income.toFixed(2)}`;
        if (DOM.totalExpense) DOM.totalExpense.textContent = `R$ ${expense.toFixed(2)}`;
        if (DOM.reportBalance) {
            DOM.reportBalance.textContent = `R$ ${balance.toFixed(2)}`;
            DOM.reportBalance.className = balance >= 0 ? "positive" : "negative";
        }
        if (DOM.reportSavings) DOM.reportSavings.textContent = `R$ ${savings.toFixed(2)}`;
    }
    
    function updateChart(reportType, filteredTransactions, startDate, endDate) {
        if (!DOM.chartCanvas) return;
        
        // Destruir gráfico anterior se existir
        if (currentChart) {
            currentChart.destroy();
        }
        
        const ctx = DOM.chartCanvas.getContext("2d");
        
        switch (reportType) {
            case "cashflow":
                currentChart = createCashflowChart(ctx, filteredTransactions, startDate, endDate);
                break;
            case "expenses":
                currentChart = createExpensesChart(ctx, filteredTransactions);
                break;
            case "income":
                currentChart = createIncomeChart(ctx, filteredTransactions);
                break;
            case "budgets":
                currentChart = createBudgetsChart(ctx, filteredTransactions);
                break;
            default:
                currentChart = createCashflowChart(ctx, filteredTransactions, startDate, endDate);
        }
    }
    
    function createCashflowChart(ctx, transactions, startDate, endDate) {
        const monthlyData = calculateMonthlyData(transactions, startDate, endDate);
        
        return new Chart(ctx, {
            type: "line",
            data: {
                labels: monthlyData.labels,
                datasets: [
                    {
                        label: "Receitas",
                        data: monthlyData.income,
                        borderColor: "#4cc9f0",
                        backgroundColor: "rgba(76, 201, 240, 0.1)",
                        borderWidth: 3,
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: "Despesas",
                        data: monthlyData.expenses,
                        borderColor: "#f72585",
                        backgroundColor: "rgba(247, 37, 133, 0.1)",
                        borderWidth: 3,
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: "Saldo",
                        data: monthlyData.balance,
                        borderColor: "#4361ee",
                        backgroundColor: "rgba(67, 97, 238, 0.1)",
                        borderWidth: 3,
                        tension: 0.3,
                        fill: false
                    }
                ]
            },
            options: getChartOptions("R$")
        });
    }
    
    function createExpensesChart(ctx, transactions) {
        const expenseData = calculateCategoryData(transactions, "expense");
        
        return new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: expenseData.labels,
                datasets: [{
                    data: expenseData.values,
                    backgroundColor: expenseData.colors,
                    borderWidth: 2,
                    borderColor: "#fff"
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
                                const label = context.label || "";
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    function createIncomeChart(ctx, transactions) {
        const incomeData = calculateCategoryData(transactions, "income");
        
        return new Chart(ctx, {
            type: "bar",
            data: {
                labels: incomeData.labels,
                datasets: [{
                    label: "Receitas por Categoria",
                    data: incomeData.values,
                    backgroundColor: incomeData.colors,
                    borderWidth: 1,
                    borderColor: "#fff"
                }]
            },
            options: getChartOptions("R$")
        });
    }
    
    function createBudgetsChart(ctx, transactions) {
        const budgetData = calculateBudgetPerformance(transactions);
        
        return new Chart(ctx, {
            type: "bar",
            data: {
                labels: budgetData.labels,
                datasets: [
                    {
                        label: "Orçado",
                        data: budgetData.budgeted,
                        backgroundColor: "#4cc9f0",
                        borderWidth: 1
                    },
                    {
                        label: "Gasto",
                        data: budgetData.spent,
                        backgroundColor: "#f72585",
                        borderWidth: 1
                    }
                ]
            },
            options: getChartOptions("R$")
        });
    }
    
    // ======================
    // Funções de Cálculo de Dados
    // ======================
    
    function calculateMonthlyData(transactions, startDate, endDate) {
        const months = [];
        const income = [];
        const expenses = [];
        const balance = [];
        
        // Determinar quantos meses cobrir
        const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                          (endDate.getMonth() - startDate.getMonth()) + 1;
        
        for (let i = 0; i < monthsDiff; i++) {
            const currentDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
            const monthName = currentDate.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
            months.push(monthName);
            
            const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            
            const monthTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date + "T00:00:00");
                return transactionDate >= monthStart && transactionDate <= monthEnd;
            });
            
            const monthIncome = monthTransactions
                .filter(t => t.type === "income")
                .reduce((sum, t) => sum + t.amount, 0);
            
            const monthExpenses = monthTransactions
                .filter(t => t.type === "expense")
                .reduce((sum, t) => sum + t.amount, 0);
            
            income.push(monthIncome);
            expenses.push(monthExpenses);
            balance.push(monthIncome - monthExpenses);
        }
        
        return { labels: months, income, expenses, balance };
    }
    
    function calculateCategoryData(transactions, type) {
        const categoryTotals = {};
        
        transactions
            .filter(t => t.type === type)
            .forEach(t => {
                if (categoryTotals[t.category]) {
                    categoryTotals[t.category] += t.amount;
                } else {
                    categoryTotals[t.category] = t.amount;
                }
            });
        
        const labels = Object.keys(categoryTotals);
        const values = Object.values(categoryTotals);
        const colors = labels.map(label => {
            const category = categories.find(c => c.name === label);
            return category ? category.color : "#6c757d";
        });
        
        return { labels, values, colors };
    }
    
    function calculateBudgetPerformance(transactions) {
        const labels = [];
        const budgeted = [];
        const spent = [];
        
        budgets.forEach(budget => {
            const categoryTransactions = transactions.filter(t => 
                t.type === "expense" && t.category === budget.category
            );
            
            const totalSpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
            
            labels.push(budget.category);
            budgeted.push(budget.amount);
            spent.push(totalSpent);
        });
        
        return { labels, budgeted, spent };
    }
    
    function updateDetailsTable(transactions) {
        if (!DOM.detailsBody) return;
        
        DOM.detailsBody.innerHTML = "";
        
        const categoryData = {};
        
        // Agrupar por categoria
        transactions.forEach(t => {
            if (!categoryData[t.category]) {
                categoryData[t.category] = {
                    income: 0,
                    expense: 0
                };
            }
            
            if (t.type === "income") {
                categoryData[t.category].income += t.amount;
            } else {
                categoryData[t.category].expense += t.amount;
            }
        });
        
        // Ordenar por saldo (maior para menor)
        const sortedCategories = Object.entries(categoryData)
            .sort(([,a], [,b]) => (b.income - b.expense) - (a.income - a.expense));
        
        if (sortedCategories.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td colspan="4" class="empty-message">
                    <i class="fas fa-chart-bar"></i>
                    <p>Nenhum dado encontrado para o período selecionado</p>
                </td>
            `;
            DOM.detailsBody.appendChild(row);
            return;
        }
        
        sortedCategories.forEach(([category, data]) => {
            const balance = data.income - data.expense;
            const row = document.createElement("tr");
            
            row.innerHTML = `
                <td>
                    <span class="category-badge" style="background-color: ${getCategoryColor(category)}">
                        ${category}
                    </span>
                </td>
                <td class="positive">R$ ${data.income.toFixed(2)}</td>
                <td class="negative">R$ ${data.expense.toFixed(2)}</td>
                <td class="${balance >= 0 ? 'positive' : 'negative'}">R$ ${balance.toFixed(2)}</td>
            `;
            
            DOM.detailsBody.appendChild(row);
        });
    }
    
    // ======================
    // Funções de Exportação
    // ======================
    
    function generatePDF() {
        showAlert("Funcionalidade de geração de PDF será implementada em breve!", "info");
    }
    
    function exportExcel() {
        if (!currentReportData.transactions || currentReportData.transactions.length === 0) {
            showAlert("Nenhum dado para exportar.", "warning");
            return;
        }
        
        const csvContent = generateReportCSV(currentReportData.transactions);
        downloadCSV(csvContent, `relatorio_${formatDateForFilename(new Date())}.csv`);
        showAlert("Relatório exportado com sucesso!", "success");
    }
    
    function generateReportCSV(transactions) {
        const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor"];
        const rows = transactions.map(t => [
            formatDate(t.date),
            t.description,
            t.category,
            t.type === "income" ? "Receita" : "Despesa",
            t.amount.toFixed(2)
        ]);
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(","))
            .join("\n");
        
        return csvContent;
    }
    
    function downloadCSV(content, filename) {
        const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
    
    // ======================
    // Funções Auxiliares
    // ======================
    
    function getCategoryColor(categoryName) {
        const category = categories.find(c => c.name === categoryName);
        return category ? category.color : "#6c757d";
    }
    
    function formatDate(dateString) {
        const options = { day: "2-digit", month: "2-digit", year: "numeric" };
        return new Date(dateString + "T00:00:00").toLocaleDateString("pt-BR", options);
    }
    
    function formatDateForFilename(date) {
        return date.toISOString().split('T')[0];
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
                            return prefix + " " + value.toFixed(0);
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
        // Filtros de período
        if (DOM.periodSelect) {
            DOM.periodSelect.addEventListener("change", function() {
                updateDateInputs();
                generateReport();
            });
        }
        
        if (DOM.startDate) {
            DOM.startDate.addEventListener("change", function() {
                if (DOM.periodSelect?.value === "custom") {
                    generateReport();
                }
            });
        }
        
        if (DOM.endDate) {
            DOM.endDate.addEventListener("change", function() {
                if (DOM.periodSelect?.value === "custom") {
                    generateReport();
                }
            });
        }
        
        // Tipo de relatório
        if (DOM.reportType) {
            DOM.reportType.addEventListener("change", generateReport);
        }
        
        // Botão aplicar filtros
        if (DOM.applyFiltersBtn) {
            DOM.applyFiltersBtn.addEventListener("click", generateReport);
        }
        
        // Botões de exportação
        if (DOM.generatePdfBtn) {
            DOM.generatePdfBtn.addEventListener("click", generatePDF);
        }
        
        if (DOM.exportExcelBtn) {
            DOM.exportExcelBtn.addEventListener("click", exportExcel);
        }
    }
    
    // ======================
    // Inicialização
    // ======================
    
    init();
});

