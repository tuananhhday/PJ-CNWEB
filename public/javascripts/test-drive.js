const form = document.getElementById('testDriveForm');
const submitBtn = document.getElementById('submitBtn');
const requiredFields = [
    document.getElementById('ho_ten'),
    document.getElementById('email'),
    document.getElementById('so_dien_thoai'),
    document.getElementById('mau_xe'),
    document.getElementById('thanh_pho'),
    document.getElementById('dai_ly'),
    document.getElementById('ngay_muon_lai'),
    document.getElementById('gio_muon_lai')
];
const policyCheckbox = form.querySelector('input[name="dong_y_chinh_sach"]');

function setFieldError(field, message) {
    const wrapper = field.closest('.field');
    const error = wrapper.querySelector('.field-error');

    wrapper.classList.toggle('invalid', Boolean(message));
    error.textContent = message || '';
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
    return /^(0|\+84)[0-9\s.-]{8,13}$/.test(value);
}

function validateField(field, showError) {
    const value = field.value.trim();
    let message = '';

    if (!value) {
        message = 'Thông tin này là bắt buộc';
    } else if (field.id === 'email' && !isValidEmail(value)) {
        message = 'Email không hợp lệ';
    } else if (field.id === 'so_dien_thoai' && !isValidPhone(value)) {
        message = 'Số điện thoại không hợp lệ';
    }

    if (showError) {
        setFieldError(field, message);
    }

    return message === '';
}

function updateButtonState() {
    const fieldsValid = requiredFields.every(field => validateField(field, false));
    submitBtn.classList.toggle('active', fieldsValid && policyCheckbox.checked);
}

requiredFields.forEach(field => {
    field.addEventListener('input', () => {
        validateField(field, field.closest('.field').classList.contains('invalid'));
        updateButtonState();
    });

    field.addEventListener('blur', () => {
        validateField(field, true);
        updateButtonState();
    });
});

policyCheckbox.addEventListener('change', updateButtonState);

form.addEventListener('submit', event => {
    const fieldsValid = requiredFields.every(field => validateField(field, true));

    if (!fieldsValid || !policyCheckbox.checked) {
        event.preventDefault();

        if (!policyCheckbox.checked) {
            alert('Vui lòng đồng ý với chính sách bảo mật trước khi gửi.');
        }
    }
});

updateButtonState();
