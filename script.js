// Тапсырыс формасы жіберілген кезде хабарлама шығару
const bookingForm = document.getElementById('booking-form');

bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Тапсырысыңыз қабылданды! Жақын арада сізбен хабарласамыз.');
    bookingForm.reset();
});
