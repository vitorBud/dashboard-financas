// categorias.js - Página de Categorias

document.addEventListener("DOMContentLoaded", function() {
    // ======================
    // Configurações e Estado
    // ======================
    
    let categories = [];
    let editingCategoryId = null;
    let currentTab = "income";
    
    // Elementos DOM
    const DOM = {
        // Tabs
        tabButtons: document.querySelectorAll(".tab-btn"),
        tabContents: document.querySelectorAll(".tab-content"),
        incomeList: document.getElementById("income-categories-list"),
        expenseList: document.getElementById("expense-categories-list"),
        
        // Modal
        modal: document.getElementById("category-modal"),
        modalTitle: document.getElementById("modal-category-title"),
        form: document.getElementById("category-form"),
        nameInput: document.getElementById("category-name"),
        typeSelect: document.getElementById("category-type"),
        colorInput: document.getElementById("category-color"),
        iconInput: document.getElementById("category-icon"),
        iconOptions: document.querySelectorAll(".icon-option"),
        
        // Botões
        addBtn: document.getElementById("add-category"),
        cancelBtn: document.getElementById("cancel-category"),
        closeBtn: document.querySelector(".close-modal")
    };
    
    // ======================
    // Funções de Inicialização
    // ======================
    
    function init() {
        loadData();
        setupEventListeners();
        setupTabs();
        setupIconSelector();
        renderCategories();
        console.log("Página de categorias inicializada");
    }
    
    function loadData() {
        categories = JSON.parse(localStorage.getItem("finance_categories") || "[]");
        
        // Se não há categorias, criar algumas padrão
        if (categories.length === 0) {
            categories = [
                { id: 1, name: "Salário", type: "income", color: "#4cc9f0", icon: "money-bill-wave" },
                { id: 2, name: "Freelance", type: "income", color: "#4895ef", icon: "laptop" },
                { id: 3, name: "Investimentos", type: "income", color: "#4361ee", icon: "chart-line" },
                { id: 4, name: "Moradia", type: "expense", color: "#f72585", icon: "home" },
                { id: 5, name: "Alimentação", type: "expense", color: "#b5179e", icon: "utensils" },
                { id: 6, name: "Transporte", type: "expense", color: "#7209b7", icon: "car" },
                { id: 7, name: "Lazer", type: "expense", color: "#560bad", icon: "film" },
                { id: 8, name: "Saúde", type: "expense", color: "#480ca8", icon: "heartbeat" }
            ];
            saveData();
        }
    }
    
    // ======================
    // Funções de Tabs
    // ======================
    
    function setupTabs() {
        DOM.tabButtons.forEach(btn => {
            btn.addEventListener("click", function() {
                const tabType = this.getAttribute("data-tab");
                switchTab(tabType);
            });
        });
    }
    
    function switchTab(tabType) {
        currentTab = tabType;
        
        // Atualizar botões
        DOM.tabButtons.forEach(btn => {
            btn.classList.remove("active");
            if (btn.getAttribute("data-tab") === tabType) {
                btn.classList.add("active");
            }
        });
        
        // Atualizar conteúdo
        DOM.tabContents.forEach(content => {
            content.classList.remove("active");
        });
        
        const activeContent = document.getElementById(`${tabType}-categories`);
        if (activeContent) {
            activeContent.classList.add("active");
        }
    }
    
    // ======================
    // Funções de Renderização
    // ======================
    
    function renderCategories() {
        renderCategoriesByType("income");
        renderCategoriesByType("expense");
    }
    
    function renderCategoriesByType(type) {
        const container = type === "income" ? DOM.incomeList : DOM.expenseList;
        if (!container) return;
        
        container.innerHTML = "";
        
        const filteredCategories = categories.filter(c => c.type === type);
        
        if (filteredCategories.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.className = "empty-message";
            emptyMessage.innerHTML = `
                <i class="fas fa-tags"></i>
                <p>Nenhuma categoria de ${type === "income" ? "receita" : "despesa"} encontrada</p>
                <button class="btn btn-text add-first-category" data-type="${type}">
                    Criar primeira categoria
                </button>
            `;
            container.appendChild(emptyMessage);
            
            const addFirstBtn = emptyMessage.querySelector(".add-first-category");
            if (addFirstBtn) {
                addFirstBtn.addEventListener("click", function() {
                    const categoryType = this.getAttribute("data-type");
                    openModal(categoryType);
                });
            }
            return;
        }
        
        filteredCategories.forEach(category => {
            const categoryCard = createCategoryCard(category);
            container.appendChild(categoryCard);
        });
    }
    
    function createCategoryCard(category) {
        const card = document.createElement("div");
        card.className = "category-card";
        card.style.borderLeft = `4px solid ${category.color}`;
        
        // Calcular uso da categoria
        const transactions = JSON.parse(localStorage.getItem("finance_transactions") || "[]");
        const categoryTransactions = transactions.filter(t => t.category === category.name);
        const totalAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
        const transactionCount = categoryTransactions.length;
        
        card.innerHTML = `
            <div class="category-header">
                <div class="category-icon" style="background-color: ${category.color}">
                    <i class="fas fa-${category.icon || 'tag'}"></i>
                </div>
                <div class="category-info">
                    <h4>${category.name}</h4>
                    <span class="category-type">${category.type === "income" ? "Receita" : "Despesa"}</span>
                </div>
                <div class="category-actions">
                    <button class="btn-icon edit-category" data-id="${category.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-category" data-id="${category.id}" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="category-stats">
                <div class="stat">
                    <span class="stat-label">Transações</span>
                    <span class="stat-value">${transactionCount}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Total</span>
                    <span class="stat-value">R$ ${totalAmount.toFixed(2)}</span>
                </div>
            </div>
        `;


        // Adicionar event listeners
        const editBtn = card.querySelector(".edit-category");
        const deleteBtn = card.querySelector(".delete-category");
        
        if (editBtn) {
            editBtn.addEventListener("click", function() {
                const id = parseInt(this.getAttribute("data-id"));
                editCategory(id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener("click", function() {
                const id = parseInt(this.getAttribute("data-id"));
                deleteCategory(id);
            });
        }
        
        return card;
    }
    
    // ======================
    // Funções do Modal
    // ======================
    
    function openModal(type = null) {
        if (!DOM.modal) return;
        
        DOM.modal.style.display = "flex";
        document.body.style.overflow = "hidden";
        
        // Resetar formulário
        if (DOM.form) DOM.form.reset();
        
        // Configurar tipo se fornecido
        if (type && DOM.typeSelect) {
            DOM.typeSelect.value = type;
        }
        
        // Configurar título
        if (DOM.modalTitle) {
            DOM.modalTitle.textContent = editingCategoryId ? "Editar Categoria" : "Nova Categoria";
        }
        
        // Resetar seleção de ícone
        resetIconSelection();
    }
    
    function closeModal() {
        if (!DOM.modal) return;
        
        DOM.modal.style.display = "none";
        document.body.style.overflow = "auto";
        editingCategoryId = null;
        resetIconSelection();
    }
    
    function setupIconSelector() {
        DOM.iconOptions.forEach(icon => {
            icon.addEventListener("click", function() {
                // Remover seleção anterior
                DOM.iconOptions.forEach(i => i.classList.remove("selected"));
                
                // Adicionar seleção atual
                this.classList.add("selected");
                
                // Atualizar input hidden
                const iconName = this.getAttribute("data-icon");
                if (DOM.iconInput) {
                    DOM.iconInput.value = iconName;
                }
            });
        });
    }
    
    function resetIconSelection() {
        DOM.iconOptions.forEach(icon => icon.classList.remove("selected"));
        if (DOM.iconInput) {
            DOM.iconInput.value = "tag";
        }
        
        // Selecionar primeiro ícone por padrão
        if (DOM.iconOptions.length > 0) {
            DOM.iconOptions[0].classList.add("selected");
            DOM.iconInput.value = DOM.iconOptions[0].getAttribute("data-icon");
        }
    }
    
    // ======================
    // Funções CRUD
    // ======================
    
    function addCategory() {
        editingCategoryId = null;
        openModal(currentTab);
    }
    
    function editCategory(id) {
        const category = categories.find(c => c.id === id);
        if (!category) return;
        
        editingCategoryId = id;
        
        // Preencher formulário
        if (DOM.nameInput) DOM.nameInput.value = category.name;
        if (DOM.typeSelect) DOM.typeSelect.value = category.type;
        if (DOM.colorInput) DOM.colorInput.value = category.color;
        if (DOM.iconInput) DOM.iconInput.value = category.icon || "tag";
        
        // Selecionar ícone
        DOM.iconOptions.forEach(icon => {
            icon.classList.remove("selected");
            if (icon.getAttribute("data-icon") === category.icon) {
                icon.classList.add("selected");
            }
        });
        
        openModal();
    }
    
    function deleteCategory(id) {
        const category = categories.find(c => c.id === id);
        if (!category) return;
        
        // Verificar se a categoria está sendo usada
        const transactions = JSON.parse(localStorage.getItem("finance_transactions") || "[]");
        const isUsed = transactions.some(t => t.category === category.name);
        
        if (isUsed) {
            if (!confirm(`A categoria "${category.name}" está sendo usada em transações. Tem certeza que deseja excluí-la? As transações não serão afetadas.`)) {
                return;
            }
        } else {
            if (!confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
                return;
            }
        }
        
        const index = categories.findIndex(c => c.id === id);
        if (index !== -1) {
            categories.splice(index, 1);
            saveData();
            renderCategories();
            showAlert("Categoria excluída com sucesso!", "success");
        }
    }
    
    function saveCategory(e) {
        e.preventDefault();
        
        const name = DOM.nameInput?.value?.trim();
        const type = DOM.typeSelect?.value;
        const color = DOM.colorInput?.value;
        const icon = DOM.iconInput?.value || "tag";
        
        // Validação
        if (!name || !type || !color) {
            showAlert("Por favor, preencha todos os campos.", "error");
            return;
        }
        
        // Verificar se já existe categoria com o mesmo nome e tipo
        const existingCategory = categories.find(c => 
            c.name.toLowerCase() === name.toLowerCase() && 
            c.type === type && 
            c.id !== editingCategoryId
        );
        
        if (existingCategory) {
            showAlert("Já existe uma categoria com este nome para este tipo.", "error");
            return;
        }
        
        const categoryData = {
            id: editingCategoryId || Date.now(),
            name,
            type,
            color,
            icon
        };
        
        if (editingCategoryId) {
            const index = categories.findIndex(c => c.id === editingCategoryId);
            if (index !== -1) {
                // Atualizar nome da categoria nas transações existentes
                const oldName = categories[index].name;
                updateTransactionsCategoryName(oldName, name);
                
                categories[index] = categoryData;
                showAlert("Categoria atualizada com sucesso!", "success");
            }
        } else {
            categories.push(categoryData);
            showAlert("Categoria criada com sucesso!", "success");
        }
        
        saveData();
        renderCategories();
        closeModal();
    }
    
    function updateTransactionsCategoryName(oldName, newName) {
        const transactions = JSON.parse(localStorage.getItem("finance_transactions") || "[]");
        const updatedTransactions = transactions.map(t => {
            if (t.category === oldName) {
                return { ...t, category: newName };
            }
            return t;
        });
        
        localStorage.setItem("finance_transactions", JSON.stringify(updatedTransactions));
    }
    
    // ======================
    // Funções Auxiliares
    // ======================
    
    function saveData() {
        try {
            localStorage.setItem("finance_categories", JSON.stringify(categories));
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
        // Botão adicionar categoria
        if (DOM.addBtn) {
            DOM.addBtn.addEventListener("click", addCategory);
        }
        
        // Modal
        if (DOM.closeBtn) {
            DOM.closeBtn.addEventListener("click", closeModal);
        }
        
        if (DOM.cancelBtn) {
            DOM.cancelBtn.addEventListener("click", closeModal);
        }
        
        if (DOM.form) {
            DOM.form.addEventListener("submit", saveCategory);
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

