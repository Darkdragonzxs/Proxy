       class URLManager {
            constructor() {
                this.proxyFrame = document.getElementById('proxyFrame');
                this.urlBar = document.querySelector('search-nav');
                this.reloadButton = document.querySelector('.reload-button');
                this.errorTooltip = document.querySelector('.error-tooltip');
                this.lastKnownUrl = '';
                this.navigationInProgress = false;
                this.setupEventListeners();
            }

            setupEventListeners() {
                this.urlBar.addEventListener('keydown', this.handleUrlBarKeydown.bind(this));
                this.urlBar.addEventListener('focus', () => this.urlBar.select());
                this.reloadButton.addEventListener('click', this.handleReload.bind(this));
                this.proxyFrame.addEventListener('load', this.handleFrameLoad.bind(this));
                this.proxyFrame.addEventListener('error', () => this.showError('Failed to load content'));
                this.proxyFrame.addEventListener('mouseover', () => {
                    if (!this.navigationInProgress) {
                        this.urlBar.value = '';
                    }
                });

                const backButton = document.querySelector('.nav-back');
                backButton.addEventListener('click', () => window.history.back());
                window.addEventListener('message', this.handleMessage.bind(this));
                window.addEventListener('popstate', this.handlePopState.bind(this));
                window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
                window.addEventListener('load', this.handleInitialLoad.bind(this));

                this.urlBar.addEventListener('input', () => {
                    this.clearError();
                    this.validateUrlFormat(this.urlBar.value);
                });
            }

            async handleUrlBarKeydown(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = this.urlBar.value.trim();
                    if (!input) return;

                    try {
                        const url = this.formatUrl(input);
                        await this.navigateToUrl(url);
                    } catch (err) {
                        this.showError(err.message);
                    }
                }
            }

            formatUrl(input) {
                // Handle special URLs
                if (input.startsWith('about:') || input.startsWith('chrome:') || 
                    input.startsWith('edge:') || input.startsWith('firefox:')) {
                    throw new Error('Browser-specific URLs are not supported');
                }

                // Handle search queries
                if (!input.includes('.') || input.includes(' ')) {
                    return `https://www.duckduckgo.com/search?q=${encodeURIComponent(input)}`;
                }

                if (!input.match(/^[a-zA-Z]+:\/\//)) {
                    input = input.startsWith('//') ? `https:${input}` : `https://${input}`;
                }

                try {
                    return new URL(input).href;
                } catch {
                    throw new Error('Invalid URL format');
                }
            }

            validateUrlFormat(input) {
                if (!input) return;
                
                try {
                    this.formatUrl(input);
                    this.urlBar.classList.remove('invalid');
                } catch {
                    this.urlBar.classList.add('invalid');
                }
            }

            async navigateToUrl(url, pushHistory = true) {
                if (this.navigationInProgress) return;
                this.navigationInProgress = true;

                try {
                    await registerSW();
                    const encodedUrl = __uv$config.prefix + __uv$config.encodeUrl(url);
                    this.proxyFrame.src = encodedUrl;
                    
                    if (url !== this.lastKnownUrl) {
                        this.updateUrlDisplay(url, pushHistory);
                    }
                    this.clearError();
                } catch (err) {
                    this.showError(err.message);
                    console.error('Navigation failed:', err);
                } finally {
                    this.navigationInProgress = false;
                }
            }

            updateUrlDisplay(url, pushHistory = true) {
                if (url === this.lastKnownUrl) return;
                
                this.lastKnownUrl = url;
                this.urlBar.value = url;
                
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set('url', url);
                
                if (pushHistory) {
                    window.history.pushState({ url }, '', newUrl);
                } else {
                    window.history.replaceState({ url }, '', newUrl);
                }
            }

            showError(message) {
                this.urlBar.classList.add('error');
                this.errorTooltip.textContent = message;
                setTimeout(() => this.clearError(), 3000);
            }

            clearError() {
                this.urlBar.classList.remove('error');
                this.errorTooltip.textContent = '';
            }

            handleFrameLoad() {
                this.clearError();
                
                if (this.proxyFrame.src && !this.proxyFrame.src.startsWith('about:')) {
                    const decodedUrl = this.decodeProxyUrl(this.proxyFrame.src);
                    if (decodedUrl) {
                        this.updateUrlDisplay(decodedUrl, false);
                    }
                }

                try {
                    const pageTitle = this.proxyFrame.contentDocument?.title;
                    if (pageTitle) {
                        document.title = `${pageTitle} - latte`;
                    }
                } catch {}
            }

            decodeProxyUrl(encodedUrl) {
                try {
                    if (!encodedUrl || typeof encodedUrl !== 'string') return '';
                    const match = encodedUrl.match(/(?:https?:\/\/)?[^@]+@(.+)$/);
                    return match ? match[1] : '';
                } catch (err) {
                    console.error('Error decoding URL:', err);
                    return '';
                }
            }

            handleMessage(event) {
                if (event.data?.type === 'uv_update' && typeof event.data.url === 'string') {
                    this.updateUrlDisplay(event.data.url, true);
                }
            }

            handlePopState(event) {
                const params = new URLSearchParams(window.location.search);
                const url = params.get('url');
                
                if (url) {
                    this.navigateToUrl(url, false);
                }
            }

            handleUnhandledRejection(event) {
                if (event.reason.toString().includes('CORS')) {
                    this.showError('CORS Error - Reconnecting...');
                    setTimeout(() => window.location.reload(), 2000);
                }
            }

            async handleInitialLoad() {
                const params = new URLSearchParams(window.location.search);
                const url = params.get('url');
                
                if (url) {
                    this.urlBar.value = url;
                    await this.navigateToUrl(url, false);
                }
            }

            handleReload() {
                const currentUrl = new URLSearchParams(window.location.search).get('url');
                if (currentUrl) {
                    this.navigateToUrl(currentUrl, false);
                }
            }
        }

        const urlManager = new URLManager();