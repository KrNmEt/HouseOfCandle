let cart = [];
try {
    const storedCart = localStorage.getItem('houseOfCandlesCart');
    if (storedCart && storedCart !== "undefined") {
        cart = JSON.parse(storedCart);
    }
} catch (e) {
    console.error("Error reading cart:", e);
    cart = [];
}

function updateCartCount() {
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        countEl.innerText = totalItems;
    }
}

function addToCart(productName, price) {
    
    const existingItemIndex = cart.findIndex(item => item.name === productName);

    if (existingItemIndex > -1) {
        
        cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
    } else {
        cart.push({ name: productName, price: price, quantity: 1 });
    }

    localStorage.setItem('houseOfCandlesCart', JSON.stringify(cart));
    updateCartCount();
    alert(`${productName} has been added to your cart!`);
}

function outOfStock(productName) {
    alert(`Sorry, ${productName} is currently out of stock.`);
}

function clearCart() {
    
    cart = [];
    
    
    localStorage.removeItem('houseOfCandlesCart');
    
    
    updateCartCount();
    renderCart();
}

function renderCart() {
    const cartContainer = document.getElementById('cart-items-container');
    const orderSummaryInput = document.getElementById('order-summary-input');
    const orderTotalInput = document.getElementById('order-total-input');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (!cartContainer) return; 

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align:center;">Your cart is currently empty.</p>';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        return;
    }

    let html = '<ul style="list-style:none; padding:0;">';
    let total = 0;
    let orderSummaryText = "";

    cart.forEach((item) => {
        
        const itemQty = item.quantity || 1; 
        const itemTotal = item.price * itemQty;

        html += `
            <li style="display:flex; justify-content:space-between; padding: 15px 0; border-bottom: 1px solid #d2d2d7;">
                <span>${itemQty}x ${item.name}</span>
                <span>₹${itemTotal.toFixed(2)}</span>
            </li>
        `;
        total += itemTotal;
        orderSummaryText += `- ${itemQty}x ${item.name} (₹${itemTotal.toFixed(2)})\n`; 
    });

    html += `
        <li style="display:flex; justify-content:space-between; padding: 15px 0; font-weight: bold; font-size: 1.2rem;">
            <span>Total:</span>
            <span>₹${total.toFixed(2)}</span>
        </li>
    </ul>`;

    cartContainer.innerHTML = html;
    if (orderSummaryInput) orderSummaryInput.value = orderSummaryText;
    if (orderTotalInput) orderTotalInput.value = "₹" + total.toFixed(2);
    
    
    if (checkoutBtn) checkoutBtn.style.display = 'inline-block';
}

document.addEventListener('DOMContentLoaded', () => {
    
    
    updateCartCount();
    renderCart();

    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                entry.target.classList.remove('js-hidden');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach((element) => {
        element.classList.add('js-hidden'); 
        observer.observe(element);
    });

    
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            addToCart(this.getAttribute('data-name'), parseFloat(this.getAttribute('data-price')));
        });
    });

    document.querySelectorAll('.out-of-stock-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); 
            outOfStock(this.getAttribute('data-name'));
        });
    });

    
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
        });
    }
});