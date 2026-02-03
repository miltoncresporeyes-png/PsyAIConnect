const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');

const newLines = lines.map(line => {
    if (line.startsWith('DATABASE_URL=') || line.startsWith('DIRECT_URL=')) {
        const match = line.match(/=(.+)$/);
        if (match) {
            const url = match[1].replace(/^"|"$/g, '');
            const pwdMatch = url.match(/:([^@]+)@/);
            if (pwdMatch) {
                const originalPwd = pwdMatch[1];
                const encodedPwd = encodeURIComponent(originalPwd);
                if (originalPwd !== encodedPwd) {
                    console.log('Variable:', line.split('=')[0]);
                    console.log('  Password original:', originalPwd.substring(0, 5) + '...');
                    console.log('  Password encoded:', encodedPwd.substring(0, 10) + '...');
                    const newUrl = url.replace(':' + originalPwd + '@', ':' + encodedPwd + '@');
                    return line.split('=')[0] + '="' + newUrl + '"';
                }
            }
        }
    }
    return line;
});

fs.writeFileSync('.env.local', newLines.join('\n'));
console.log('\n✅ Archivo .env.local actualizado con passwords URL-encoded');
