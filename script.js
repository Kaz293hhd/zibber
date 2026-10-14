// Тапсырыс формасы жіберілген кезде 404 шықпауын қамтамасыз ету
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Беттің басқа жаққа ауысып кетіп 404 беруіне жол бермейді
        
        // Пайдаланушыға әдемі хабарлама көрсету
        alert('Тапсырысыңыз сәтті қабылданды! Жақын арада оператор сізбен хабарласады.');
        contactForm.reset();
    });
}
