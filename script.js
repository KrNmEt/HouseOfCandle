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


function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    
    container.appendChild(toast);

    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// --- Cart Logic ---
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

    saveCart();
    showToast(`${productName} added to cart!`);
}

function updateQuantity(productName, delta) {
    const itemIndex = cart.findIndex(item => item.name === productName);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += delta;
        
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        saveCart();
        renderCart(); 
    }
}

function removeCartItem(productName) {
    cart = cart.filter(item => item.name !== productName);
    saveCart();
    renderCart();
}

function saveCart() {
    localStorage.setItem('houseOfCandlesCart', JSON.stringify(cart));
    updateCartCount();
}

function clearCart() {
    cart = [];
    localStorage.removeItem('houseOfCandlesCart');
    updateCartCount();
    renderCart();
}

function outOfStock(productName) {
    showToast(`Sorry, ${productName} is out of stock.`);
}

function renderCart() {
    const cartContainer = document.getElementById('cart-items-container');
    const orderSummaryInput = document.getElementById('order-summary-input');
    const orderTotalInput = document.getElementById('order-total-input');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (!cartContainer) return; 

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align:center; font-size: 1.2rem; color: #86868b; padding: 40px 0;">Your cart is currently empty.</p>';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        return;
    }

    let html = '<div style="display: flex; flex-direction: column;">';
    let total = 0;
    let orderSummaryText = "";

    cart.forEach((item) => {
        const itemQty = item.quantity || 1; 
        const itemTotal = item.price * itemQty;

        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${item.name}</strong><br>
                    <span style="color: #86868b; font-size: 0.9rem;">₹${item.price.toFixed(2)} each</span>
                </div>
                
                <div class="cart-controls">
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="updateQuantity('${item.name.replace(/'/g, "\\'")}', -1)">-</button>
                        <span class="qty-display">${itemQty}</span>
                        <button class="qty-btn" onclick="updateQuantity('${item.name.replace(/'/g, "\\'")}', 1)">+</button>
                    </div>
                    <span class="item-total">₹${itemTotal.toFixed(2)}</span>
                    <button class="remove-btn" onclick="removeCartItem('${item.name.replace(/'/g, "\\'")}')">Remove</button>
                </div>
            </div>
        `;
        total += itemTotal;
        orderSummaryText += `- ${itemQty}x ${item.name} (₹${itemTotal.toFixed(2)})\n`; 
    });

    html += `
        <div style="display:flex; justify-content:space-between; padding: 25px 0; font-weight: bold; font-size: 1.5rem; border-top: 2px solid #1d1d1f; margin-top: 10px;">
            <span>Total:</span>
            <span>₹${total.toFixed(2)}</span>
        </div>
    </div>`;

    cartContainer.innerHTML = html;
    if (orderSummaryInput) orderSummaryInput.value = orderSummaryText;
    if (orderTotalInput) orderTotalInput.value = "₹" + total.toFixed(2);
    
    if (checkoutBtn) checkoutBtn.style.display = 'inline-block';
}


function setupForms() {
    const forms = document.querySelectorAll('form[action^="https://api.sheetmonkey.io"]');
    
    forms.forEach(form => {
        
        form.removeAttribute('onsubmit'); 

        form.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const btn = form.querySelector('button[type="submit"]');
            const originalBtnText = btn.innerText;
            btn.innerText = 'Sending...';
            btn.disabled = true;

            const formData = new FormData(form);

            fetch(form.action, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if(response.ok) {
                    // Hide the form
                    form.style.display = 'none';
                    
                    
                    const successContainer = form.nextElementSibling;
                    if(successContainer && successContainer.classList.contains('success-message')) {
                        successContainer.style.display = 'block';
                    }
                    
                    
                    if(form.id === 'checkout-form') {
                        cart = [];
                        localStorage.removeItem('houseOfCandlesCart');
                        updateCartCount();
                        document.getElementById('cart-items-container').innerHTML = ''; 
                        document.querySelector('#cart h3').style.display = 'none'; 
                    }
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .catch(error => {
                console.error('Form submission error:', error);
                showToast('Something went wrong. Please try again.');
                btn.innerText = originalBtnText;
                btn.disabled = false;
            });
        });
    });
}



document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCart();
    setupForms();

    
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