        function loadSavedSettings() {
            const savedTitle = localStorage.getItem('customTitle');
            const savedFavicon = localStorage.getItem('customFavicon');

            if (savedTitle) {
                document.title = savedTitle;
                document.getElementById('customTitle').value = savedTitle; 
            }

            if (savedFavicon) {
                document.getElementById('favicon').href = savedFavicon;
                document.getElementById('customFavicon').value = savedFavicon; 
            }
        }

        
        function changeFaviconAndTitle() {
            const newTitle = document.getElementById('customTitle').value;
            const newFavicon = document.getElementById('customFavicon').value;

            if (newTitle) {
                document.title = newTitle;
                localStorage.setItem('customTitle', newTitle); 
            }

            if (newFavicon) {
                const favicon = document.getElementById('favicon');
                favicon.href = newFavicon;
                localStorage.setItem('customFavicon', newFavicon); 
            }
        }

     
        function resetFaviconAndTitle() {
            
            document.title = 'latte';
            
            localStorage.removeItem('customTitle');
            localStorage.removeItem('customFavicon');
           
            document.getElementById('customTitle').value = '';
            document.getElementById('customFavicon').value = '';
        }

       
        window.onload = loadSavedSettings;