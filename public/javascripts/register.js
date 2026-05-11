const form = document.getElementById('registerForm');
const hoTen = document.getElementById('ho_ten');
const email = document.getElementById('email');
const soDienThoai = document.getElementById('so_dien_thoai');
const diaChi = document.getElementById('dia_chi');
const vaiTro = document.getElementById('vai_tro_id');
const maQuanLy = document.getElementById('ma_quan_ly');
const matKhau = document.getElementById('mat_khau');
const xacNhanMatKhau = document.getElementById('xac_nhan_mat_khau');
const registerBtn = document.getElementById('registerBtn');
const eyes = document.querySelectorAll('.eye');

function checkInput() {
    if (
        hoTen.value.trim() !== '' &&
        email.value.trim() !== '' &&
        soDienThoai.value.trim() !== '' &&
        diaChi.value.trim() !== '' &&
        (vaiTro.value === '3' || maQuanLy.value.trim() !== '') &&
        matKhau.value.trim() !== '' &&
        xacNhanMatKhau.value.trim() !== ''
    ) {
        registerBtn.classList.add('active');
    } else {
        registerBtn.classList.remove('active');
    }
}

[hoTen, email, soDienThoai, diaChi, vaiTro, maQuanLy, matKhau, xacNhanMatKhau].forEach(input => {
    input.addEventListener('input', checkInput);
});

vaiTro.addEventListener('change', function () {
    maQuanLy.style.display = this.value === '3' ? 'none' : 'block';
    checkInput();
});

maQuanLy.style.display = vaiTro.value === '3' ? 'none' : 'block';

eyes.forEach(eye => {
    eye.addEventListener('click', function () {
        const inputId = this.getAttribute('data-target');
        const input = document.getElementById(inputId);

        if (input.type === 'password') {
            input.type = 'text';
            this.textContent = '🙈';
        } else {
            input.type = 'password';
            this.textContent = '👁';
        }
    });
});

form.addEventListener('submit', function (e) {
    if (matKhau.value !== xacNhanMatKhau.value) {
        e.preventDefault();
        alert('Mật khẩu xác nhận không khớp!');
    }
});
