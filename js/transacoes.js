// transacoes.js - Página de Transações

document.addEventListener("DOMContentLoaded", function() {
    // ======================
    // Configurações e Estado
    // ======================
    
    let currentPage = 1;
    const itemsPerPage = 10;
    let filteredTransactions = [];
    let allTransactions = [];
    let categories = [];
    
    // Elementos DOM
    const DOM = {
        tableBody: document.getElementById("transactions-table-body"),
        totalTransactions: document.getElementById("total-transactions"),
        transactionsBalance: document.getElementById("transactions-balance"),
        pageInfo: document.getElementById("page-info"),
        prevPageBtn: document.getElementById("prev-page"),
        nextPageBtn: document.getElementById("next-page"),
        
        // Filtros
        typeFilter: document.getElementById("transaction-type-filter"),
        categoryFilter: document.getElementById("category-filter"),
        dateRangeFilter: document.getElementById("date-range-filter"),
        customDateRange: document.getElementById("custom-date-range"),
        startDate: document.getElementById("start-date"),
        endDate: document.getElementById("end-date"),
        clearFiltersBtn: document.getElementById("clear-filters"),
        
        // Modal
        modal: document.getElementById("transaction-modal"),
        modalTitle: document.getElementById("modal-transaction-title"),
        form: document.getElementById("transaction-form"),
        typeSelect: document.getElementById("transaction-type"),
        amountInput: document.getElementById("transaction-amount"),
        descriptionInput: document.getElementById("transaction-description"),
        categorySelect: document.getElementById("transaction-category"),
        dateInput: document.getElementById("transaction-date"),
        
        // Botões
        addBtn: document.getElementById("add-transaction"),
        exportBtn: document.getElementById("export-transactions"),
        cancelBtn: document.getElementById("cancel-transaction"),
        closeBtn: document.querySelector(".close-modal")
    };
    
    let editingTransactionId = null;
    
    // ======================
    // Funções de Inicialização
    // ======================
    
    function init() {
        loadData();
        setupEventListeners();
        populateCategoryFilter();
        applyFilters();
        console.log("Página de transações inicializada");
    }
    
    function loadData() {
        allTransactions = JSON.parse(localStorage.getItem("finance_transactions") || "[]");
        categories = JSON.parse(localStorage.getItem("finance_categories") || "[]");
        filteredTransactions = [...allTransactions];
    }
    
    // ======================
    // Funções de Filtros
    // ======================
    
    function populateCategoryFilter() {
        if (!DOM.categoryFilter) return;
        
        DOM.categoryFilter.innerHTML = '<option value="all">Todas</option>';
        
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.name;
            option.textContent = category.name;
            DOM.categoryFilter.appendChild(option);
        });
    }
    
    function applyFilters() {
        filteredTransactions = [...allTransactions];
        
        // Filtro por tipo
        const typeFilter = DOM.typeFilter?.value;
        if (typeFilter && typeFilter !== "all") {
            filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
        }
        
        // Filtro por categoria
        const categoryFilter = DOM.categoryFilter?.value;
        if (categoryFilter && categoryFilter !== "all") {
            filteredTransactions = filteredTransactions.filter(t => t.category === categoryFilter);
        }
        
        // Filtro por data
        const dateRangeFilter = DOM.dateRangeFilter?.value;
        if (dateRangeFilter) {
            const now = new Date();
            let startDate, endDate;
            
            switch (dateRangeFilter) {
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
                case "custom":
                    if (DOM.startDate?.value && DOM.endDate?.value) {
                        startDate = new Date(DOM.startDate.value);
                        endDate = new Date(DOM.endDate.value);
                    }
                    break;
            }
            
            if (startDate && endDate) {
                filteredTransactions = filteredTransactions.filter(t => {
                    const transactionDate = new Date(t.date);
                    return transactionDate >= startDate && transactionDate <= endDate;
                });
            }
        }
        
        currentPage = 1;
        updateTable();
        updateSummary();
        updatePagination();
    }
    
    function clearFilters() {
        if (DOM.typeFilter) DOM.typeFilter.value = "all";
        if (DOM.categoryFilter) DOM.categoryFilter.value = "all";
        if (DOM.dateRangeFilter) DOM.dateRangeFilter.value = "this-month";
        if (DOM.customDateRange) DOM.customDateRange.style.display = "none";
        if (DOM.startDate) DOM.startDate.value = "";
        if (DOM.endDate) DOM.endDate.value = "";
        
        applyFilters();
    }
    
    // ======================
    // Funções da Tabela
    // ======================
    
    function updateTable() {
        if (!DOM.tableBody) return;
        
        DOM.tableBody.innerHTML = "";
        
        if (filteredTransactions.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td colspan="6" class="empty-message">
                    <i class="fas fa-search"></i>
                    <p>Nenhuma transação encontrada</p>
                    <button class="btn btn-text" onclick="clearFilters()">Limpar filtros</button>
                </td>
            `;
            DOM.tableBody.appendChild(row);
            return;
        }
        
        // Ordenar por data (mais recente primeiro)
        const sortedTransactions = [...filteredTransactions].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        // Paginação
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageTransactions = sortedTransactions.slice(startIndex, endIndex);
        
        pageTransactions.forEach(transaction => {
            const row = document.createElement("tr");
            
            const typeClass = transaction.type === "income" ? "income" : "expense";
            const typeIcon = transaction.type === "income" ? 
                '<i class="fas fa-arrow-down"></i>' : 
                '<i class="fas fa-arrow-up"></i>';
            const typeText = transaction.type === "income" ? "Receita" : "Despesa";
            
            row.innerHTML = `
                <td>${formatDate(transaction.date)}</td>
                <td>${transaction.description}</td>
                <td>
                    <span class="category-badge" style="background-color: ${getCategoryColor(transaction.category)}">
                        ${transaction.category}
                    </span>
                </td>
                <td class="transaction-type ${typeClass}">
                    ${typeIcon} ${typeText}
                </td>
                <td class="transaction-amount ${typeClass}">
                    R$ ${transaction.amount.toFixed(2)}
                </td>
                <td class="transaction-actions">
                    <button class="btn-icon edit-btn" data-id="${transaction.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-btn" data-id="${transaction.id}" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            DOM.tableBody.appendChild(row);
        });
        
        // Adicionar event listeners para os botões de ação
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
    
    function updateSummary() {
        const totalTransactions = filteredTransactions.length;
        const balance = filteredTransactions.reduce((sum, t) => {
            return sum + (t.type === "income" ? t.amount : -t.amount);
        }, 0);
        
        if (DOM.totalTransactions) {
            DOM.totalTransactions.textContent = totalTransactions;
        }
        
        if (DOM.transactionsBalance) {
            DOM.transactionsBalance.textContent = `R$ ${balance.toFixed(2)}`;
            DOM.transactionsBalance.className = balance >= 0 ? "positive" : "negative";
        }
    }
    
    function updatePagination() {
        const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
        
        if (DOM.pageInfo) {
            DOM.pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        }
        
        if (DOM.prevPageBtn) {
            DOM.prevPageBtn.disabled = currentPage <= 1;
        }
        
        if (DOM.nextPageBtn) {
            DOM.nextPageBtn.disabled = currentPage >= totalPages;
        }
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
        
        // Definir data padrão
        if (DOM.dateInput) {
            DOM.dateInput.valueAsDate = new Date();
        }
        
        // Popular categorias
        populateModalCategories();
        
        // Configurar título
        if (DOM.modalTitle) {
            DOM.modalTitle.textContent = editingTransactionId ? "Editar Transação" : "Adicionar Transação";
        }
    }
    
    function closeModal() {
        if (!DOM.modal) return;
        
        DOM.modal.style.display = "none";
        document.body.style.overflow = "auto";
        editingTransactionId = null;
    }
    
    function populateModalCategories() {
        if (!DOM.categorySelect || !DOM.typeSelect) return;
        
        DOM.categorySelect.innerHTML = '<option value="">Selecione...</option>';
        
        const selectedType = DOM.typeSelect.value;
        if (!selectedType) return;
        
        const filteredCategories = categories.filter(c => c.type === selectedType);
        
        filteredCategories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            DOM.categorySelect.appendChild(option);
        });
    }
    
    // ======================
    // Funções CRUD
    // ======================
    
    function addTransaction() {
        editingTransactionId = null;
        openModal();
    }
    
    function editTransaction(id) {
        const transaction = allTransactions.find(t => t.id === id);
        if (!transaction) return;
        
        editingTransactionId = id;
        
        // Preencher formulário
        if (DOM.typeSelect) DOM.typeSelect.value = transaction.type;
        populateModalCategories();
        
        setTimeout(() => {
            const category = categories.find(c => c.name === transaction.category);
            if (category && DOM.categorySelect) {
                DOM.categorySelect.value = category.id;
            }
            
            if (DOM.amountInput) DOM.amountInput.value = transaction.amount;
            if (DOM.descriptionInput) DOM.descriptionInput.value = transaction.description;
            if (DOM.dateInput) DOM.dateInput.value = transaction.date;
            
            openModal();
        }, 100);
    }
    
    function deleteTransaction(id) {
        if (!confirm("Tem certeza que deseja excluir esta transação?")) return;
        
        const index = allTransactions.findIndex(t => t.id === id);
        if (index !== -1) {
            allTransactions.splice(index, 1);
            saveData();
            loadData();
            applyFilters();
            showAlert("Transação excluída com sucesso!", "success");
        }
    }
    
    function saveTransaction(e) {
        e.preventDefault();
        
        const type = DOM.typeSelect?.value;
        const amount = parseFloat(DOM.amountInput?.value || 0);
        const description = DOM.descriptionInput?.value?.trim();
        const categoryId = parseInt(DOM.categorySelect?.value || 0);
        const date = DOM.dateInput?.value;
        
        // Validação
        if (!type || !amount || !description || !categoryId || !date) {
            showAlert("Por favor, preencha todos os campos.", "error");
            return;
        }
        
        if (amount <= 0) {
            showAlert("O valor deve ser maior que zero.", "error");
            return;
        }
        
        const category = categories.find(c => c.id === categoryId);
        if (!category) {
            showAlert("Categoria inválida.", "error");
            return;
        }
        
        const transactionData = {
            id: editingTransactionId || Date.now().toString(),
            description,
            category: category.name,
            date,
            amount,
            type
        };
        
        if (editingTransactionId) {
            const index = allTransactions.findIndex(t => t.id === editingTransactionId);
            if (index !== -1) {
                allTransactions[index] = transactionData;
                showAlert("Transação atualizada com sucesso!", "success");
            }
        } else {
            allTransactions.push(transactionData);
            showAlert("Transação adicionada com sucesso!", "success");
        }
        
        saveData();
        loadData();
        applyFilters();
        closeModal();
    }
    
    // ======================
    // Funções de Exportação
    // ======================
    
    function exportTransactions() {
        if (filteredTransactions.length === 0) {
            showAlert("Nenhuma transação para exportar.", "warning");
            return;
        }
        
        const csvContent = generateCSV(filteredTransactions);
        downloadCSV(csvContent, "transacoes.csv");
        showAlert("Transações exportadas com sucesso!", "success");
    }
    
    function generateCSV(transactions) {
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
    
    function formatDate(dateString) {
        const options = { day: "2-digit", month: "2-digit", year: "numeric" };
        return new Date(dateString + "T00:00:00").toLocaleDateString("pt-BR", options);
    }
    
    function getCategoryColor(categoryName) {
        const category = categories.find(c => c.name === categoryName);
        return category ? category.color : "#6c757d";
    }
    
    function saveData() {
        try {
            localStorage.setItem("finance_transactions", JSON.stringify(allTransactions));
        } catch (error) {
            console.error("Erro ao salvar dados:", error);
            showAlert("Erro ao salvar dados.", "error");
        }
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
        // Filtros
        if (DOM.typeFilter) {
            DOM.typeFilter.addEventListener("change", applyFilters);
        }
        
        if (DOM.categoryFilter) {
            DOM.categoryFilter.addEventListener("change", applyFilters);
        }
        
        if (DOM.dateRangeFilter) {
            DOM.dateRangeFilter.addEventListener("change", function() {
                if (this.value === "custom") {
                    DOM.customDateRange.style.display = "block";
                } else {
                    DOM.customDateRange.style.display = "none";
                }
                applyFilters();
            });
        }
        
        if (DOM.startDate) {
            DOM.startDate.addEventListener("change", applyFilters);
        }
        
        if (DOM.endDate) {
            DOM.endDate.addEventListener("change", applyFilters);
        }
        
        if (DOM.clearFiltersBtn) {
            DOM.clearFiltersBtn.addEventListener("click", clearFilters);
        }
        
        // Paginação
        if (DOM.prevPageBtn) {
            DOM.prevPageBtn.addEventListener("click", function() {
                if (currentPage > 1) {
                    currentPage--;
                    updateTable();
                    updatePagination();
                }
            });
        }
        
        if (DOM.nextPageBtn) {
            DOM.nextPageBtn.addEventListener("click", function() {
                const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    updateTable();
                    updatePagination();
                }
            });
        }
        
        // Modal
        if (DOM.addBtn) {
            DOM.addBtn.addEventListener("click", addTransaction);
        }
        
        if (DOM.closeBtn) {
            DOM.closeBtn.addEventListener("click", closeModal);
        }
        
        if (DOM.cancelBtn) {
            DOM.cancelBtn.addEventListener("click", closeModal);
        }
        
        if (DOM.form) {
            DOM.form.addEventListener("submit", saveTransaction);
        }
        
        if (DOM.typeSelect) {
            DOM.typeSelect.addEventListener("change", populateModalCategories);
        }
        
        // Exportação
        if (DOM.exportBtn) {
            DOM.exportBtn.addEventListener("click", exportTransactions);
        }
        
        // Fechar modal ao clicar fora
        window.addEventListener("click", function(event) {
            if (event.target === DOM.modal) {
                closeModal();
            }
        });
        
        // Fechar modal com ESC
        document.addEventListener("keydown", function(event) {
            if (event.key === "Escape" && DOM.modal.style.display === "flex") {
                closeModal();
            }
        });
    }
    
    // ======================
    // Inicialização
    // ======================
    
    init();
});

