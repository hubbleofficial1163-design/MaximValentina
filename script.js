// ==============================================
// СВАДЕБНЫЙ САЙТ - ФРОНТЕНД
// Мария & Алексей | 15.09.2024
// ==============================================

// Конфигурация
const CONFIG = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbw3mQQ9vOq-hQY__dD84Kemg4VBCmgtQOrby87ZRVX2S7Du7OzEMUccZ5moxJC7wHipGQ/exec', // ЗАМЕНИТЕ НА ВАШ URL
    TELEGRAM_CHAT_URL: 'https://t.me/+hOTwCMbLMwI3ZDYy', // ЗАМЕНИТЕ НА ВАШУ ССЫЛКУ НА ЧАТ
    WEDDING_DATE: '2026-08-08T11:45:00'  // Дата свадьбы
};

// Прелоадер
document.addEventListener('DOMContentLoaded', function() {
    const loader = document.querySelector('.loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
    }, 800);
    
    // Инициализация
    initTelegramLink();
});

// Таймер обратного отсчета
function updateCountdown() {
    const weddingDate = new Date(CONFIG.WEDDING_DATE).getTime();
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
        document.getElementById('days').innerText = '00';
        document.getElementById('hours').innerText = '00';
        document.getElementById('minutes').innerText = '00';
        document.getElementById('seconds').innerText = '00';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = days.toString().padStart(2, '0');
    document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
    document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
}

// Запускаем таймер
updateCountdown();
setInterval(updateCountdown, 1000);

// Управление количеством гостей
const guestsInput = document.getElementById('guests');
const minusBtn = document.querySelector('.minus-btn');
const plusBtn = document.querySelector('.plus-btn');

if (minusBtn && plusBtn) {
    minusBtn.addEventListener('click', function() {
        let currentValue = parseInt(guestsInput.value);
        if (currentValue > 1) {
            guestsInput.value = currentValue - 1;
            if (navigator.vibrate) navigator.vibrate(30);
        }
    });
    
    plusBtn.addEventListener('click', function() {
        let currentValue = parseInt(guestsInput.value);
        if (currentValue < 10) {
            guestsInput.value = currentValue + 1;
            if (navigator.vibrate) navigator.vibrate(30);
        }
    });
    
    guestsInput.addEventListener('change', function() {
        let value = parseInt(this.value);
        if (value < 1) this.value = 1;
        if (value > 10) this.value = 10;
    });
}

// Настройка ссылки на Telegram чат
function initTelegramLink() {
    const chatLink = document.querySelector('.chat-link');
    if (chatLink && CONFIG.TELEGRAM_CHAT_URL) {
        chatLink.href = CONFIG.TELEGRAM_CHAT_URL;
        chatLink.target = '_blank';
        chatLink.rel = 'noopener noreferrer';
    }
}

// Обработка формы RSVP
const rsvpForm = document.getElementById('rsvp-form');
if (rsvpForm) {
    rsvpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Валидация
        const attendanceSelected = document.querySelector('input[name="attendance"]:checked');
        if (!attendanceSelected) {
            showError('Пожалуйста, выберите, сможете ли вы прийти');
            return;
        }
        
        const name = document.getElementById('name').value.trim();
        const contact = document.getElementById('contact').value.trim();
        
        if (!name) {
            showError('Пожалуйста, введите ваше имя');
            document.getElementById('name').focus();
            return;
        }
        
        if (!contact) {
            showError('Пожалуйста, введите email или телефон для связи');
            document.getElementById('contact').focus();
            return;
        }
        
        // Подготовка данных
        const formData = {
            name: name,
            contact: contact,
            attendance: attendanceSelected.value,
            guests: document.getElementById('guests').value,
            message: document.getElementById('message').value.trim() || ''
        };
        
        // Отправка
        await submitRSVP(formData);
    });
}

// Функция отправки данных
async function submitRSVP(formData) {
    const submitBtn = document.querySelector('.submit-btn');
    const originalContent = submitBtn.innerHTML;
    
    // Показываем индикатор загрузки
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Отправка...</span>';
    submitBtn.disabled = true;
    
    try {
        // Создаем FormData для отправки
        const data = new URLSearchParams();
        data.append('name', formData.name);
        data.append('contact', formData.contact);
        data.append('attendance', formData.attendance);
        data.append('guests', formData.guests);
        data.append('message', formData.message);
        
        // Отправляем запрос
        const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            body: data,
            mode: 'no-cors'
        });
        
        // Успешная отправка
        showSuccess(formData.name);
        
    } catch (error) {
        console.error('Ошибка отправки:', error);
        showSuccess(formData.name); // Показываем успех даже при ошибке (fallback)
    } finally {
        // Восстанавливаем кнопку
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Показать сообщение об успехе
function showSuccess(guestName) {
    const form = document.getElementById('rsvp-form');
    const successMessage = document.getElementById('success-message');
    
    // Персонализируем сообщение
    const successTitle = successMessage.querySelector('h3');
    const successText = successMessage.querySelector('p');
    
    successTitle.textContent = `Спасибо, ${guestName}!`;
    successText.textContent = 'Ваш ответ успешно отправлен! Мы будем с нетерпением ждать встречи на нашей свадьбе.';
    
    // Показываем/скрываем
    form.style.display = 'none';
    successMessage.style.display = 'block';
    
    // Прокручиваем к сообщению
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Скрываем клавиатуру
    document.activeElement.blur();
    
    // Вибрация
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
}

// Показать ошибку
function showError(message) {
    // Создаем элемент ошибки
    let errorDiv = document.querySelector('.form-error');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.style.cssText = `
            background: #fff5f5;
            border: 1px solid #feb2b2;
            color: #c53030;
            padding: 12px 16px;
            border-radius: 8px;
            margin: 15px 0;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: fadeIn 0.3s ease;
        `;
        
        const formHeader = document.querySelector('.form-header');
        if (formHeader) {
            formHeader.parentNode.insertBefore(errorDiv, formHeader.nextSibling);
        } else {
            rsvpForm.insertBefore(errorDiv, rsvpForm.firstChild);
        }
    }
    
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    // Автоудаление через 5 секунд
    setTimeout(() => {
        if (errorDiv && errorDiv.parentNode) {
            errorDiv.style.opacity = '0';
            errorDiv.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 300);
        }
    }, 5000);
    
    // Вибрация
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

// Кнопка "Заполнить ещё один ответ"
const newResponseBtn = document.getElementById('new-response');
if (newResponseBtn) {
    newResponseBtn.addEventListener('click', function() {
        const form = document.getElementById('rsvp-form');
        const successMessage = document.getElementById('success-message');
        
        // Сбрасываем форму
        form.reset();
        guestsInput.value = 1;
        
        // Удаляем сообщения об ошибках
        const errors = document.querySelectorAll('.form-error');
        errors.forEach(error => error.remove());
        
        // Показываем форму
        successMessage.style.display = 'none';
        form.style.display = 'block';
        
        // Прокручиваем к форме
        form.scrollIntoView({ behavior: 'smooth' });
        
        // Фокус на первое поле
        document.getElementById('name').focus();
    });
}

// Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const targetElement = document.querySelector(href);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Анимация появления элементов
function animateOnScroll() {
    const elements = document.querySelectorAll('.timeline-item');
    const windowHeight = window.innerHeight;
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        
        if (elementTop < windowHeight - 100) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Предотвращение двойного тапа для масштабирования
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Улучшение UX для iOS
if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    document.addEventListener('focus', function(e) {
        if (e.target.matches('input, textarea, select')) {
            setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }, true);
}

// Анимация иконок
document.querySelectorAll('.icon-circle').forEach(icon => {
    icon.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.95)';
    });
    
    icon.addEventListener('touchend', function() {
        this.style.transform = 'scale(1.05)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
});

// Добавляем CSS для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .fa-spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);


// ==============================================
// УПРАВЛЕНИЕ МУЗЫКОЙ
// ==============================================

// Создаем аудио объект
const audio = new Audio('1.mp3');
audio.loop = true;
audio.preload = 'auto';

let isPlaying = false;
const musicBtn = document.getElementById('music-toggle');

// Функция для переключения музыки
function toggleMusic() {
    if (isPlaying) {
        audio.pause();
        musicBtn.classList.remove('playing');
        musicBtn.querySelector('i').className = 'fas fa-music';
        musicBtn.querySelector('.music-text').textContent = 'Включить музыку';
        isPlaying = false;
    } else {
        // Пытаемся воспроизвести
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                musicBtn.classList.add('playing');
                musicBtn.querySelector('i').className = 'fas fa-music';
                musicBtn.querySelector('.music-text').textContent = 'Включить музыку';
                isPlaying = true;
            }).catch(() => {
                // Автовоспроизведение заблокировано - показываем подсказку
                musicBtn.querySelector('.music-text').textContent = 'Нажмите для воспроизведения';
                setTimeout(() => {
                    if (!isPlaying) {
                        musicBtn.querySelector('.music-text').textContent = 'Включить музыку';
                    }
                }, 2000);
            });
        }
    }
}

// Обработчик клика по кнопке
if (musicBtn) {
    musicBtn.addEventListener('click', toggleMusic);
    musicBtn.addEventListener('touchend', function(e) {
        // Предотвращаем двойное срабатывание
        e.preventDefault();
        toggleMusic();
    });
}

// Обработка ошибок аудио
audio.addEventListener('error', function(e) {
    console.warn('Ошибка загрузки музыки:', e);
    musicBtn.querySelector('i').className = 'fas fa-volume-mute';
    musicBtn.querySelector('.music-text').textContent = 'Музыка недоступна';
    musicBtn.style.opacity = '0.6';
    musicBtn.style.pointerEvents = 'none';
});

// Пауза при выходе из вкладки (экономия ресурсов)
document.addEventListener('visibilitychange', function() {
    if (document.hidden && isPlaying) {
        audio.pause();
    } else if (!document.hidden && isPlaying) {
        audio.play().catch(() => {});
    }
});