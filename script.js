// Pioneer Timer - Local Storage Service Hours Tracker
class PioneerTimer {
    constructor() {
        this.storageKey = 'pioneer-timer-data';
        this.settingsKey = 'pioneer-timer-settings';
        this.data = this.loadData();
        this.settings = this.loadSettings();
        this.currentPanel = 'input';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setTodayDate();
        this.loadRecentEntries();
        this.updateStatistics();
        this.loadSettings();
        this.showPanel('input');
    }

    // Data management
    loadData() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : {};
    }

    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    loadSettings() {
        const stored = localStorage.getItem(this.settingsKey);
        const defaultSettings = {
            yearlyGoal: 840,
            defaultHours: 2,
            showNotifications: true
        };
        return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    }

    saveSettings() {
        localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
    }

    // Event listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const panel = e.target.dataset.panel;
                this.showPanel(panel);
            });
        });

        // Input panel
        document.getElementById('save-entry').addEventListener('click', () => this.saveEntry());
        document.getElementById('clear-form').addEventListener('click', () => this.clearForm());
        document.getElementById('service-date').addEventListener('change', () => this.loadEntryForDate());

        // Settings panel
        document.getElementById('yearly-goal').addEventListener('change', (e) => {
            this.settings.yearlyGoal = parseInt(e.target.value);
            this.saveSettings();
            this.updateStatistics();
        });

        document.getElementById('default-hours').addEventListener('change', (e) => {
            this.settings.defaultHours = parseFloat(e.target.value);
            this.saveSettings();
        });

        document.getElementById('show-notifications').addEventListener('change', (e) => {
            this.settings.showNotifications = e.target.checked;
            this.saveSettings();
        });

        // Data management
        document.getElementById('export-data').addEventListener('click', () => this.exportData());
        document.getElementById('import-data').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        document.getElementById('import-file').addEventListener('change', (e) => this.importData(e));
        document.getElementById('clear-all-data').addEventListener('click', () => this.clearAllData());
    }

    // Panel navigation
    showPanel(panelName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-panel="${panelName}"]`).classList.add('active');

        // Update panels
        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${panelName}-panel`).classList.add('active');

        this.currentPanel = panelName;

        // Refresh content based on panel
        if (panelName === 'statistics') {
            this.updateStatistics();
        } else if (panelName === 'settings') {
            this.populateSettings();
        }
    }

    // Date and form handling
    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('service-date').value = today;
        this.loadEntryForDate();
    }

    loadEntryForDate() {
        const date = document.getElementById('service-date').value;
        if (this.data[date]) {
            document.getElementById('service-hours').value = this.data[date].hours;
            document.getElementById('service-notes').value = this.data[date].notes || '';
        } else {
            document.getElementById('service-hours').value = '';
            document.getElementById('service-notes').value = '';
        }
    }

    saveEntry() {
        const date = document.getElementById('service-date').value;
        const hours = parseFloat(document.getElementById('service-hours').value);
        const notes = document.getElementById('service-notes').value;

        if (!date) {
            this.showMessage('Proszę wybrać datę.', 'error');
            return;
        }

        if (isNaN(hours) || hours < 0) {
            this.showMessage('Proszę wprowadzić prawidłową liczbę godzin.', 'error');
            return;
        }

        this.data[date] = {
            hours: hours,
            notes: notes,
            timestamp: new Date().getTime()
        };

        this.saveData();
        this.showMessage('Wpis został zapisany pomyślnie!', 'success');
        this.loadRecentEntries();
        this.updateStatistics();
    }

    clearForm() {
        document.getElementById('service-hours').value = '';
        document.getElementById('service-notes').value = '';
    }

    deleteEntry(date) {
        if (confirm('Czy na pewno chcesz usunąć ten wpis?')) {
            delete this.data[date];
            this.saveData();
            this.loadRecentEntries();
            this.updateStatistics();
            this.showMessage('Wpis został usunięty.', 'success');
        }
    }

    editEntry(date) {
        document.getElementById('service-date').value = date;
        this.loadEntryForDate();
        this.showPanel('input');
    }

    // Recent entries
    loadRecentEntries() {
        const container = document.getElementById('recent-entries-list');
        const entries = Object.entries(this.data)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .slice(0, 10);

        if (entries.length === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Brak wpisów do wyświetlenia.</p>';
            return;
        }

        container.innerHTML = entries.map(([date, entry]) => `
            <div class="entry-item">
                <div>
                    <div class="entry-date">${this.formatDate(date)}</div>
                    ${entry.notes ? `<div style="font-size: 0.9rem; color: #666; margin-top: 4px;">${entry.notes}</div>` : ''}
                </div>
                <div class="entry-hours">${entry.hours}h</div>
                <div class="entry-actions">
                    <button class="edit-btn" onclick="app.editEntry('${date}')">Edytuj</button>
                    <button class="delete-btn" onclick="app.deleteEntry('${date}')">Usuń</button>
                </div>
            </div>
        `).join('');
    }

    // Statistics
    updateStatistics() {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        
        // Current year hours
        const yearHours = this.getYearHours(currentYear);
        document.getElementById('current-year-hours').textContent = yearHours.toFixed(1);
        
        // Current month hours
        const monthHours = this.getMonthHours(currentYear, currentMonth);
        document.getElementById('current-month-hours').textContent = monthHours.toFixed(1);
        
        // Yearly goal progress
        const goalProgress = (yearHours / this.settings.yearlyGoal) * 100;
        document.getElementById('yearly-goal-progress').textContent = Math.min(goalProgress, 100).toFixed(1) + '%';
        
        // Progress bar
        const progressFill = document.getElementById('progress-fill');
        progressFill.style.width = Math.min(goalProgress, 100) + '%';
        
        // Hours to goal
        const hoursToGoal = Math.max(0, this.settings.yearlyGoal - yearHours);
        document.getElementById('hours-to-goal').textContent = 
            hoursToGoal > 0 ? `${hoursToGoal.toFixed(1)} godzin do celu` : 'Cel osiągnięty!';
        
        // Current year display
        document.getElementById('current-year').textContent = currentYear;
        
        // Monthly breakdown
        this.updateMonthlyChart(currentYear);
    }

    getYearHours(year) {
        return Object.entries(this.data)
            .filter(([date]) => new Date(date).getFullYear() === year)
            .reduce((total, [, entry]) => total + entry.hours, 0);
    }

    getMonthHours(year, month) {
        return Object.entries(this.data)
            .filter(([date]) => {
                const d = new Date(date);
                return d.getFullYear() === year && d.getMonth() === month;
            })
            .reduce((total, [, entry]) => total + entry.hours, 0);
    }

    updateMonthlyChart(year) {
        const container = document.getElementById('monthly-chart');
        const months = [
            'Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze',
            'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'
        ];

        const monthlyData = months.map((month, index) => {
            const hours = this.getMonthHours(year, index);
            return { month, hours, index };
        });

        const maxHours = Math.max(...monthlyData.map(d => d.hours), this.settings.yearlyGoal / 12);

        container.innerHTML = monthlyData.map(data => {
            const heightPercent = maxHours > 0 ? (data.hours / maxHours) * 100 : 0;
            return `
                <div class="month-bar">
                    <div class="month-fill" style="height: ${heightPercent}%"></div>
                    <div class="month-label">${data.month}</div>
                    ${data.hours > 0 ? `<div class="month-value">${data.hours.toFixed(1)}h</div>` : ''}
                </div>
            `;
        }).join('');
    }

    // Settings
    populateSettings() {
        document.getElementById('yearly-goal').value = this.settings.yearlyGoal;
        document.getElementById('default-hours').value = this.settings.defaultHours;
        document.getElementById('show-notifications').checked = this.settings.showNotifications;
    }

    // Data import/export
    exportData() {
        const exportData = {
            data: this.data,
            settings: this.settings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pioneer-timer-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showMessage('Dane zostały wyeksportowane.', 'success');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                if (importData.data && importData.settings) {
                    if (confirm('Czy na pewno chcesz zaimportować dane? To zastąpi wszystkie istniejące dane.')) {
                        this.data = importData.data;
                        this.settings = { ...this.settings, ...importData.settings };
                        this.saveData();
                        this.saveSettings();
                        this.loadRecentEntries();
                        this.updateStatistics();
                        this.populateSettings();
                        this.showMessage('Dane zostały zaimportowane pomyślnie!', 'success');
                    }
                } else {
                    this.showMessage('Nieprawidłowy format pliku.', 'error');
                }
            } catch (error) {
                this.showMessage('Błąd podczas importowania pliku.', 'error');
            }
        };
        reader.readAsText(file);
        
        // Clear the file input
        event.target.value = '';
    }

    clearAllData() {
        if (confirm('Czy na pewno chcesz usunąć wszystkie dane? Tej operacji nie można cofnąć.')) {
            if (confirm('To jest ostateczne ostrzeżenie. Wszystkie dane zostaną bezpowrotnie utracone. Kontynuować?')) {
                this.data = {};
                this.saveData();
                this.loadRecentEntries();
                this.updateStatistics();
                this.showMessage('Wszystkie dane zostały usunięte.', 'success');
            }
        }
    }

    // Utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        return date.toLocaleDateString('pl-PL', options);
    }

    showMessage(message, type) {
        // Remove existing messages
        document.querySelectorAll('.success-message, .error-message').forEach(el => el.remove());

        const messageEl = document.createElement('div');
        messageEl.className = `${type}-message`;
        messageEl.textContent = message;

        const currentPanel = document.querySelector('.panel.active');
        currentPanel.insertBefore(messageEl, currentPanel.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PioneerTimer();
});

// Service Worker registration for PWA capabilities (future enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when adding PWA features
        // navigator.serviceWorker.register('/sw.js');
    });
}