const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client();

const menu = {
    "nasi goreng": 15000,
    "ayam geprek": 17000,
    "mie goreng": 14000
};

const greetedUsers = new Set();
const carts = {};

function formatRupiah(angka){
    return angka.toLocaleString("id-ID");
}

function generateOrderID(){
    return "ORD" + Math.floor(Math.random() * 10000);
}

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log("Bot siap!");
});

client.on('message_create', message => {

    if (message.fromMe) return;

    const text = message.body.toLowerCase();
    const user = message.from;

    if(!carts[user]){
        carts[user] = [];
    }

    const cart = carts[user];

    // ================= SALAM =================

    if (!greetedUsers.has(user)) {

        greetedUsers.add(user);

        message.reply(
`Halo 👋

Selamat datang di *UMKM Food Bot* 🍜

Ketik *menu* untuk melihat daftar makanan.`
        );

        return;
    }

    // ================= MENU =================

    if (text.includes("menu")) {

        let daftarMenu = "🍜 *Menu Kami*\n\n";

        for (let item in menu) {
            daftarMenu += `• ${item} - Rp${formatRupiah(menu[item])}\n`;
        }

        daftarMenu += "\nContoh pesan:\n";
        daftarMenu += "pesan nasi goreng 1 ayam geprek 2";

        message.reply(daftarMenu);

        return;
    }

    // ================= DETEKSI PESANAN =================

    if (text.includes("pesan") || text.includes("tambah")) {

        let ditemukan = false;

        for (let item in menu) {

            if (text.includes(item)) {

                ditemukan = true;

                let regex = new RegExp("(\\d+)\\s*" + item + "|" + item + "\\s*(\\d+)");
                let match = text.match(regex);

                let jumlah = 1;

                if(match){
                    jumlah = parseInt(match[1] || match[2]);
                }

                cart.push({
                    nama: item,
                    jumlah: jumlah,
                    harga: menu[item]
                });
            }
        }

        if(!ditemukan){
            message.reply("Menu tidak ditemukan 😅");
            return;
        }

        // hitung total
        let total = 0;
        let orderID = generateOrderID();

        let detail = `🧾 *Detail Pesanan*\n\nOrder ID: ${orderID}\n\n`;

        cart.forEach(item => {

            let subtotal = item.harga * item.jumlah;

            detail += `${item.nama}\n`;
            detail += `Jumlah: ${item.jumlah}\n`;
            detail += `Subtotal: Rp${formatRupiah(subtotal)}\n\n`;

            total += subtotal;

        });

        detail += `💰 *Total Bayar: Rp${formatRupiah(total)}*\n\n`;
        detail += `Pilih opsi:\n\n`;
        detail += `1️⃣ Transfer Bank\n`;
        detail += `2️⃣ E-Wallet\n`;
        detail += `3️⃣ COD\n`;
        detail += `4️⃣ Tambah Pesanan`;

        message.reply(detail);

        return;
    }

    // ================= TAMBAH PESANAN =================

    if (text === "4") {

        message.reply("Silakan kirim menu tambahan.\nContoh: tambah mie goreng 1");

        return;
    }

    // ================= PEMBAYARAN =================

    if (text === "1") {

        message.reply(
`💳 *Pembayaran Transfer*

Bank BCA
123456789
a.n UMKM Makanan

Kirim bukti pembayaran ya 🙏`
        );

        carts[user] = [];
        return;
    }

    if (text === "2") {

        message.reply(
`📱 *Pembayaran E-Wallet*

OVO / Dana / Gopay
089999999999

Silakan kirim bukti pembayaran 🙏`
        );

        carts[user] = [];
        return;
    }

    if (text === "3") {

        message.reply(
`🚚 *COD Dipilih*

Pesanan akan dibayar saat barang sampai.

Terima kasih sudah memesan 🙏`
        );

        carts[user] = [];
        return;
    }

    // ================= DEFAULT =================

    message.reply(
`Aku belum mengerti 😅

Ketik:
menu → lihat menu
pesan <menu> <jumlah>`
    );

});

client.initialize();