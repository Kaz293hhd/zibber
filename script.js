// 1. FIREBASE БАПТАУЛАРЫ (Осы жерге өз Firebase кілттеріңізді қойыңыз)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase инициализациясы
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// LocalStorage глобалды себет
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.innerText = totalCount;
}

// Тағам санын өзгерту (+ / -)
window.updateQuantity = function(id, change, itemData = null) {
    let cart = getCart();
    const existIndex = cart.findIndex(item => item.id === id);

    if (existIndex > -1) {
        cart[existIndex].quantity += change;
        if (cart[existIndex].quantity <= 0) {
            cart.splice(existIndex, 1);
        }
    } else if (change > 0 && itemData) {
        cart.push({ ...itemData, quantity: 1 });
    }

    saveCart(cart);
    window.renderMenu();
    window.renderCartModal();
};

// Бұлттан Мәзірді оқу (Нақты уақыт режимінде)
window.renderMenu = function(categoryFilter = 'all') {
    const menuGrid = document.getElementById('menu-grid');
    if (!menuGrid) return;

    onSnapshot(collection(db, "menu"), (snapshot) => {
        const items = [];
        snapshot.forEach(doc => {
            items.push({ id: doc.id, ...doc.data() });
        });

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
            const itemString = JSON.stringify(item).replace(/"/g, '&quot;');

            let btnHTML = qty > 0 ? `
                <div class="qty-control">
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span class="qty-count">${qty}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
            ` : `<button class="btn" onclick="updateQuantity('${item.id}', 1, ${itemString})"><i class="fa-solid fa-cart-plus"></i> Қосу</button>`;

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
    });
};

// Себет модалі
window.renderCartModal = function() {
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
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span class="qty-count">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
            </div>
        `;
    });

    if (cartTotalDiv) cartTotalDiv.innerText = `${total} ₸`;
};

// Бұлтқа Тапсырыс жіберу
window.checkout = async function() {
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
        alert('Өтініш, барлық өрістерді толық енгізіңіз.');
        return;
    }

    try {
        await addDoc(collection(db, "orders"), {
            customer: name,
            phone: phone,
            address: address,
            payment: payment,
            items: cart,
            total: cart.reduce((s, i) => s + (i.price * i.quantity), 0),
            date: new Date().toLocaleString('kk-KZ')
        });

        saveCart([]);
        alert('Тапсырысыңыз сәтті қабылданды!');
        window.toggleCartModal(false);
        window.renderMenu();
    } catch (e) {
        alert('Қате орын алды: ' + e.message);
    }
};

window.toggleCartModal = function(show = true) {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    if (show) {
        window.renderCartModal();
        modal.classList.add('active');
    } else {
        modal.classList.remove('active');
    }
};

// Экспорт (Admin үшін)
window.db = db;
window.collection = collection;
window.addDoc = addDoc;
window.deleteDoc = deleteDoc;
window.doc = doc;
window.onSnapshot = onSnapshot;

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    window.renderMenu();

    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) cartBtn.addEventListener('click', () => window.toggleCartModal(true));

    const closeModal = document.getElementById('close-cart');
    if (closeModal) closeModal.addEventListener('click', () => window.toggleCartModal(false));
});
