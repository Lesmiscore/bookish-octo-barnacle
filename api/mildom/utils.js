const MILDOM_PROXY_HOSTS = [
    // 'bookish-octo-barnacle.vercel.app',  // Vercel (has 100GB limit, no ratelimit)
    'free-mountain-goal.glitch.me',  // Glitch (400 req/hrs, has execution time limit per month)
    'lesmimonabb.dip.jp',  // Self-hosted (1TB bandwidth limit, but other contents are served in the host)
]

function mildomProxyHost(seed) {
    let index;
    if (seed) {
        // it is surjective when seed is given, to prevent from confusing ffmpeg
        index = 0;
        const chars = [...`${seed}`];
        for (num in chars) {
            index *= Number(num);
            index += chars[num].charCodeAt(0);
            index %= MILDOM_PROXY_HOSTS.length;
        }
    } else {
        index = Math.floor(Math.min(2, Math.random() * MILDOM_PROXY_HOSTS.length));
    }
    return MILDOM_PROXY_HOSTS[index];
}

module.exports = {
    MILDOM_PROXY_HOSTS, mildomProxyHost,
}
