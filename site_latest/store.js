
const CART_KEY='jumpinkickzzCart';
function getCart(){try{return JSON.parse(localStorage.getItem(CART_KEY)||'[]')}catch(e){return[]}}
function saveCartData(cart){localStorage.setItem(CART_KEY,JSON.stringify(cart));updateProductCartCount()}
function addToCart(product,size,quantity=1){const cart=getCart();const key=product.id+'|'+size;const item=cart.find(x=>x.key===key);if(item)item.quantity=Math.min(20,item.quantity+quantity);else cart.push({key,id:product.id,name:product.name,color:product.color,size,quantity,price:product.price,img:product.img});saveCartData(cart)}
function updateProductCartCount(){const el=document.getElementById('productCartCount');if(el)el.textContent=getCart().reduce((s,x)=>s+(x.quantity||0),0)}
function showToast(msg){const el=document.getElementById('siteToast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove('show'),1800)}
