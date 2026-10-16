// Бастапқы тағамдар
const initialMenuItems = [
    { id: 1, title: 'Фірменді бургер', category: 'burgers', price: 2500, desc: 'Ең таңдаулы сиыр еті мен балғын көкөністер.', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
    { id: 2, title: 'Пепперони пиццасы', category: 'pizza', price: 3800, desc: 'Қытырлақ қамыр, мол сыр және шұжықтар.', img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500' },
    { id: 3, title: 'Капучино кофесі', category: 'drinks', price: 1100, desc: 'Хош иісті табиғи дәндерден жасалған сусын.', img: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500' }
];

function getMenuItems() {
    const items = localStorage.getItem('menuItems');
    if (!items) {
        localStorage.setItem('menuItems', JSON.stringify(initialMenuItems));
        return initialMenuItems;
    }
    return JSON.parse(items);
}

function saveMenuItems(items) {
    localStorage.setItem('menuItems', JSON.stringify(items));
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function getOrders() {
    return JSON.parse(localStorage.getItem('orders') || '[]');
}

function saveOrders(orders) {
    localStorage.setItem('orders', JSON.stringify(orders));
}

function updateCartCount() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.innerText = totalCount;
}

// Тағам санын өзгерту (+ немесе -)
function updateQuantity(id, change) {
    let cart = getCart();
    const existIndex = cart.findIndex(item => item.id === id);

    if (existIndex > -1) {
        cart[existIndex].quantity += change;
        if (cart[existIndex].quantity <= 0) {
            cart.splice(existIndex, 1);
        }
    } else if (change > 0) {
        const items = getMenuItems();
        const product = items.find(item => item.id === id);
        if (product) {
            cart.push({ ...product, quantity: 1 });
        }
    }

    saveCart(cart);
    renderMenu();
    renderCartModal();
}

// Мәзірді шығару
function renderMenu(categoryFilter = 'all') {
    const menuGrid = document.getElementById('menu-grid');
    if (!menuGrid) return;

    const items = getMenuItems();
    const cart = getCart();
    menuGrid.innerHTML = '';

    const filtered = categoryFilter === 'all' 
        ? items 
        : items.filter(i => i.category === categoryFilter);

    if (filtered.length === 0) {
        menuGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Тағам табылмады.</p>';
        return;
    }

    filtered.forEach(item => {
        const cartItem = cart.find(c => c.id === item.id);
        const qty = cartItem ? cartItem.quantity : 0;

        let btnHTML = '';
        if (qty > 0) {
            btnHTML = `
                <div class="qty-control">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="qty-count">${qty}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            `;
        } else {
            btnHTML = `<button class="btn" onclick="updateQuantity(${item.id}, 1)"><i class="fa-solid fa-cart-plus"></i> Қосу</button>`;
        }

        menuGrid.innerHTML += `
            <div class="menu-card">
                <img src="${item.img}" alt="${item.title}" class="menu-card-img" onerror="this.src='https://via.placeholder.com/300'">
                <div class="menu-card-body">
                    <h3>${item.title}</h3>
                    <p>${item.desc}</p>
                    <div class="menu-card-footer">
                        <span class="price">${item.price} ₸</span>
                        ${btnHTML}
                    </div>
                </div>
            </div>
        `;
    });
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderMenu(btn.dataset.category);
        });
    });
}

// Себет модаль терезесі
function renderCartModal() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotalDiv = document.getElementById('cart-total');
    if (!cartItemsDiv) return;

    const cart = getCart();
    cartItemsDiv.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p>Себетіңіз бос.</p>';
        if (cartTotalDiv) cartTotalDiv.innerText = '0 ₸';
        return;
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        cartItemsDiv.innerHTML += `
            <div class="cart-item">
                <div>
                    <strong>${item.title}</strong><br>
                    <small>${item.price} ₸</small>
                </div>
                <div class="qty-control">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="qty-count">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        `;
    });

    if (cartTotalDiv) cartTotalDiv.innerText = `${total} ₸`;
}

// Тапсырысты рәсімдеу
function checkout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Себетіңіз бос!');
        return;
    }

    const name = document.getElementById('checkout-name').value;
    const phone = document.getElementById('checkout-phone').value;
    const address = document.getElementById('checkout-address').value;
    const payment = document.getElementById('checkout-payment').value;

    if (!name || !phone || !address) {
        alert('Өтініш, барлық өрістерді (Аты, Телефон, Мекенжай) толық енгізіңіз.');
        return;
    }

    const orders = getOrders();
    const newOrder = {
        id: Date.now(),
        customer: name,
        phone: phone,
        address: address,
        payment: payment,
        items: cart,
        total: cart.reduce((s, i) => s + (i.price * i.quantity), 0),
        date: new Date().toLocaleString('kk-KZ')
    };

    orders.push(newOrder);
    saveOrders(orders);
    saveCart([]);
    alert(`Тапсырысыңыз сәтті қабылданды!\nТөлем тәсілі: ${payment}`);
    toggleCartModal(false);
    renderMenu();
}

function toggleCartModal(show = true) {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    if (show) {
        renderCartModal();
        modal.classList.add('active');
    } else {
        modal.classList.remove('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderMenu();
    setupFilters();

    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) cartBtn.addEventListener('click', () => toggleCartModal(true));

    const closeModal = document.getElementById('close-cart');
    if (closeModal) closeModal.addEventListener('click', () => toggleCartModal(false));
});
