// Байланыс немесе тапсырыс формасы жіберілген кезде
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Хабарламаңыз немесе тапсырысыңыз сәтті қабылданды!');
        contactForm.reset();
    });
}
