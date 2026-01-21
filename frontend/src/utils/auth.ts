export const generateJuryCredentials = (name: string) => {
    // Generate username from name: lowercase, remove spaces, add random number if needed (but for now just basic sanitization)
    // Actually, to ensure uniqueness we might want to append a number, but let's keep it simple for now or use a random suffix.
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const username = `${cleanName}${randomSuffix}`;

    // Generate random 8-char password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return { username, password };
};
