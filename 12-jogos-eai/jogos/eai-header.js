// EAI Games Header Component
// Adds INEMA.CLUB link, EAI link, and Share button to all games

(function() {
    // Create header styles
    const styles = document.createElement('style');
    styles.textContent = `
        .eai-top-bar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 45px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 15px;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .eai-top-bar a {
            text-decoration: none;
            transition: all 0.3s;
        }

        .eai-top-links {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .eai-link {
            display: flex;
            align-items: center;
            gap: 8px;
            color: white;
            font-weight: bold;
            font-size: 0.95rem;
            padding: 6px 12px;
            border-radius: 20px;
            background: rgba(255,255,255,0.1);
        }

        .eai-link:hover {
            background: rgba(255,255,255,0.2);
            transform: scale(1.05);
        }

        .eai-link-inema {
            background: linear-gradient(135deg, #06B6D4, #0891B2);
        }

        .eai-link-inema:hover {
            background: linear-gradient(135deg, #22D3EE, #06B6D4);
        }

        .eai-link-home {
            background: linear-gradient(135deg, #8B5CF6, #7C3AED);
        }

        .eai-link-home:hover {
            background: linear-gradient(135deg, #A78BFA, #8B5CF6);
        }

        .eai-link img, .eai-link svg {
            width: 20px;
            height: 20px;
        }

        .eai-play-count {
            display: flex;
            align-items: center;
            gap: 6px;
            background: linear-gradient(135deg, #6366F1, #8B5CF6);
            color: white;
            padding: 6px 14px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.85rem;
        }

        .eai-play-count .count {
            font-size: 0.95rem;
        }

        .eai-right-section {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .eai-share-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s;
        }

        .eai-share-btn:hover {
            background: linear-gradient(135deg, #34D399, #10B981);
            transform: scale(1.05);
        }

        .eai-share-menu {
            position: absolute;
            top: 50px;
            right: 15px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.2);
            padding: 10px;
            display: none;
            min-width: 200px;
            z-index: 10000;
        }

        .eai-share-menu.show {
            display: block;
            animation: eai-fade-in 0.2s ease;
        }

        @keyframes eai-fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .eai-share-option {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border-radius: 8px;
            color: #333;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s;
        }

        .eai-share-option:hover {
            background: #f0f0f0;
        }

        .eai-share-option span.icon {
            font-size: 1.2rem;
        }

        .eai-share-copied {
            position: fixed;
            top: 60px;
            right: 20px;
            background: #10B981;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: bold;
            display: none;
            z-index: 10001;
            animation: eai-fade-in 0.3s ease;
        }

        /* Adjust body padding to account for header */
        body {
            padding-top: 50px !important;
        }

        /* Mobile responsive */
        @media (max-width: 600px) {
            .eai-top-bar {
                height: 40px;
                padding: 0 10px;
            }

            .eai-link {
                font-size: 0.8rem;
                padding: 5px 10px;
            }

            .eai-link span.text {
                display: none;
            }

            .eai-share-btn span.text {
                display: none;
            }

            .eai-top-links {
                gap: 10px;
            }

            body {
                padding-top: 45px !important;
            }
        }
    `;
    document.head.appendChild(styles);

    // Create header HTML
    const header = document.createElement('div');
    header.className = 'eai-top-bar';
    header.innerHTML = `
        <div class="eai-top-links">
            <a href="https://inema.club/?src=mostratec" target="_blank" class="eai-link eai-link-inema">
                <span style="font-size: 1.1rem;">🌊</span>
                <span class="text">INEMA.CLUB</span>
            </a>
            <a href="../" class="eai-link eai-link-home">
                <span style="font-size: 1.1rem;">🎮</span>
                <span class="text">Todos os jogos</span>
            </a>
        </div>
        <div class="eai-right-section">
            <div class="eai-play-count" id="eai-header-count" style="display:none">
                <span style="font-size: 1rem;">🎮</span>
                <span class="count" id="eai-header-count-value">--</span>
            </div>
            <div style="position: relative;">
                <button class="eai-share-btn" onclick="toggleShareMenu()">
                    <span style="font-size: 1.1rem;">📤</span>
                    <span class="text">Compartilhar</span>
                </button>
                <div class="eai-share-menu" id="eai-share-menu">
                <div class="eai-share-option" onclick="shareWhatsApp()">
                    <span class="icon">💬</span>
                    <span>WhatsApp</span>
                </div>
                <div class="eai-share-option" onclick="shareFacebook()">
                    <span class="icon">📘</span>
                    <span>Facebook</span>
                </div>
                <div class="eai-share-option" onclick="shareTwitter()">
                    <span class="icon">🐦</span>
                    <span>Twitter / X</span>
                </div>
                <div class="eai-share-option" onclick="shareTelegram()">
                    <span class="icon">✈️</span>
                    <span>Telegram</span>
                </div>
                <div class="eai-share-option" onclick="copyLink()">
                    <span class="icon">🔗</span>
                    <span>Copiar Link</span>
                </div>
                </div>
            </div>
        </div>
        <div class="eai-share-copied" id="eai-copied-msg">✓ Link copiado!</div>
    `;

    // Insert header at the beginning of body
    document.body.insertBefore(header, document.body.firstChild);

    // Get page title and URL for sharing
    function getShareData() {
        const title = document.title || 'EAI Games';
        const url = window.location.href;
        const text = `🎮 Jogue ${title} no EAI Games! Diversão e aprendizado para toda a família.`;
        return { title, url, text };
    }

    // Toggle share menu
    window.toggleShareMenu = function() {
        const menu = document.getElementById('eai-share-menu');
        menu.classList.toggle('show');

        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!e.target.closest('.eai-share-btn') && !e.target.closest('.eai-share-menu')) {
                    menu.classList.remove('show');
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 10);
    };

    // Share functions
    window.shareWhatsApp = function() {
        const { text, url } = getShareData();
        window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
        closeShareMenu();
    };

    window.shareFacebook = function() {
        const { url } = getShareData();
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        closeShareMenu();
    };

    window.shareTwitter = function() {
        const { text, url } = getShareData();
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        closeShareMenu();
    };

    window.shareTelegram = function() {
        const { text, url } = getShareData();
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        closeShareMenu();
    };

    window.copyLink = function() {
        const { url } = getShareData();
        navigator.clipboard.writeText(url).then(() => {
            const msg = document.getElementById('eai-copied-msg');
            msg.style.display = 'block';
            setTimeout(() => {
                msg.style.display = 'none';
            }, 2000);
        });
        closeShareMenu();
    };

    function closeShareMenu() {
        document.getElementById('eai-share-menu').classList.remove('show');
    }

    // Native share API for mobile
    if (navigator.share) {
        const shareBtn = document.querySelector('.eai-share-btn');
        shareBtn.onclick = async function() {
            const { title, text, url } = getShareData();
            try {
                await navigator.share({ title, text, url });
            } catch (err) {
                // If native share fails, show menu
                toggleShareMenu();
            }
        };
    }
})();
