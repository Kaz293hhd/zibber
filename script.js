// Батырманы басқан кезде фон түсін кездейсоқ өзгерту функциясы
const colorBtn = document.getElementById('colorBtn');

const colors = ['#2e2e32', '#e8f8f5', '#b44040', '#f4ecf7'];

colorBtn.addEventListener('click', () => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.body.style.backgroundColor = randomColor;
});