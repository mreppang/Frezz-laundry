const bcrypt = require('bcrypt');

const test = async () => {
    const hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    const isMatch = await bcrypt.compare('password', hash);
    console.log('Does "password" match?', isMatch);
};

test();
