
class DBStore {
    constructor() {
        if(typeof DBStore.instance === "object") {
            return DBStore.instance;
        }

        const db = window.indexedDB.open("imap-lexon-db", 1);

        db.onupgradeneeded = this.upgradeDB.bind(this);
        db.onsuccess = this.successDB.bind(this);

        DBStore.instance = this;
        return this;
    }

    upgradeDB(evt) {
        const db = evt.target.result;
        db.createObjectStore('Messages', { keyPath: 'id', autoIncrement: false });
    }

    successDB(evt) {
        this.db = evt.target.result;
    }

    saveMessage(message) {
        const transaction = this.db.transaction('Messages', 'readwrite');
        const store = transaction.objectStore('Messages');
        store.add(message);
    }

    async getMessage(messageId) {
        return new Promise( (resolve, reject) => {
            const transaction = this.db.transaction('Messages', 'readonly');
            const store = transaction.objectStore('Messages');
            store.get( messageId ).onsuccess=  event => {
                debugger
                resolve(event.target.result);
            };
        })
    }
}

const dbStore = new DBStore();
export default dbStore;
